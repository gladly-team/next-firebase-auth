import getFirebaseAdminApp from 'src/initFirebaseAdminSDK'
import createAuthUser from 'src/createAuthUser'
import { getConfig } from 'src/config'
import logDebug from 'src/logDebug'

// If the FIREBASE_AUTH_EMULATOR_HOST variable is set, send the token request to the emulator
const getTokenPrefix = () =>
  process.env.FIREBASE_AUTH_EMULATOR_HOST
    ? `http://${process.env.FIREBASE_AUTH_EMULATOR_HOST}/`
    : 'https://'

const getFirebasePublicAPIKey = () => {
  const config = getConfig()
  return config.firebaseClientInitConfig.apiKey
}

const errorMessageVerifyFailed = (errCode) =>
  `Error during verifyIdToken: ${errCode}. User will be unauthenticated.`

/**
 * Given a refresh token, get a new Firebase ID token. Call this when
 * the Firebase ID token has expired.
 * @return {String} The new ID token
 */
const refreshExpiredIdToken = async (refreshToken) => {
  if (!refreshToken) {
    throw new Error('The "refreshToken" argument is required.')
  }

  // https://firebase.google.com/docs/reference/rest/auth/#section-refresh-token
  const firebasePublicAPIKey = getFirebasePublicAPIKey()

  const endpoint = `${getTokenPrefix()}securetoken.googleapis.com/v1/token?key=${firebasePublicAPIKey}`

  const response = await fetch(endpoint, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: `grant_type=refresh_token&refresh_token=${refreshToken}`,
  })
  const responseJSON = await response.json()
  if (!response.ok) {
    throw new Error(`Problem refreshing token: ${JSON.stringify(responseJSON)}`)
  }
  const idToken = responseJSON.id_token
  return idToken
}

/**
 * Verify the Firebase ID token and return the Firebase user.
 * If the ID token has expired, refresh it if a refreshToken
 * is provided.
 * @return {Object} An AuthUser instance
 */
export const verifyIdToken = async (token, refreshToken = null) => {
  let firebaseUser
  let newToken = token
  const admin = getFirebaseAdminApp()
  const { onTokenRefreshError, onVerifyTokenError } = getConfig()
  try {
    firebaseUser = await admin.auth().verifyIdToken(token)
  } catch (e) {
    // https://firebase.google.com/docs/reference/node/firebase.auth.Error
    switch (e.code) {
      // Errors we consider expected and which should result in an
      // unauthenticated user.
      case 'auth/invalid-user-token':
      case 'auth/user-token-expired':
      case 'auth/user-disabled':
        // Return an unauthenticated user.
        // https://github.com/gladly-team/next-firebase-auth/issues/174
        newToken = null
        firebaseUser = null
        logDebug(errorMessageVerifyFailed(e.code))
        break

      // Errors that might be fixed by refreshing the user's ID token.
      case 'auth/id-token-expired':
      case 'auth/argument-error':
        if (refreshToken) {
          logDebug(
            `ID token is expired (error code ${e.code}). Attempting to refresh the ID token.`
          )
          let newTokenFailure = false
          try {
            newToken = await refreshExpiredIdToken(refreshToken)
          } catch (refreshErr) {
            newTokenFailure = true

            // Call developer-provided error callback.
            await onTokenRefreshError(refreshErr)
            logDebug(
              `Failed to refresh the ID token. Error code: ${refreshErr.code}`
            )
          }

          if (!newTokenFailure) {
            logDebug('Successfully refreshed the ID token.')
            try {
              firebaseUser = await admin.auth().verifyIdToken(newToken)
            } catch (verifyErr) {
              await onVerifyTokenError(verifyErr)
              logDebug(errorMessageVerifyFailed(verifyErr.code))
            }
          }

          // If either token refreshing or validation failed, return an
          // unauthenticated user.
          // https://github.com/gladly-team/next-firebase-auth/issues/366
          if (newTokenFailure) {
            newToken = null
            firebaseUser = null
            logDebug(
              'Failed to refresh the ID token. The user will be unauthenticated.'
            )
          }
        } else {
          // TODO: call `onVerifyTokenError` here. Possibly just continue
          // on to default case rather than breaking.
          // https://github.com/gladly-team/next-firebase-auth/issues/531

          // Return an unauthenticated user.
          newToken = null
          firebaseUser = null
          logDebug(errorMessageVerifyFailed(e.code))
        }
        break

      // Errors we consider unexpected.
      default:
        // Return an unauthenticated user for any other error.
        // Rationale: it's not particularly easy for developers to
        // catch errors in `withAuthUserSSR`, so default to returning
        // an unauthed user and give the developer control over
        // handling the error.
        // https://github.com/gladly-team/next-firebase-auth/issues/366
        newToken = null
        firebaseUser = null

        // Call developer-provided error callback.
        await onVerifyTokenError(e)
        logDebug(
          `Error in verifyIdToken: ${e.code}. User will be unauthenticated.`
        )
    }
  }
  const AuthUser = createAuthUser({
    firebaseUserAdminSDK: firebaseUser,
    token: newToken,
  })
  return AuthUser
}

/**
 * Given a Firebase ID token, return an ID token, refresh token,
 * and AuthUser. We can use the refresh token to refresh expired
 * ID tokens during server-side rendering.
 * See:
 *  https://firebase.google.com/docs/reference/rest/auth/#section-refresh-token
 *  https://stackoverflow.com/a/38284384
 * @return {Object} response
 * @return {String} response.idToken - The user's ID token
 * @return {String} response.refreshToken - The user's refresh token
 * @return {Object} response.AuthUser - An AuthUser instance
 */
export const getCustomIdAndRefreshTokens = async (token) => {
  logDebug('Getting refresh token from ID token.')

  const AuthUser = await verifyIdToken(token)
  const admin = getFirebaseAdminApp()

  // FIXME: ensure a user is authenticated before proceeding. Issue:
  // https://github.com/gladly-team/next-firebase-auth/issues/531

  // It's important that we pass the same user ID here, otherwise
  // Firebase will create a new user.
  const customToken = await admin.auth().createCustomToken(AuthUser.id)

  // https://firebase.google.com/docs/reference/rest/auth/#section-verify-custom-token
  const firebasePublicAPIKey = getFirebasePublicAPIKey()

  const refreshTokenEndpoint = `${getTokenPrefix()}identitytoolkit.googleapis.com/v1/accounts:signInWithCustomToken?key=${firebasePublicAPIKey}`

  const refreshTokenResponse = await fetch(refreshTokenEndpoint, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      token: customToken,
      returnSecureToken: true,
    }),
  })
  const refreshTokenJSON = await refreshTokenResponse.json()
  if (!refreshTokenResponse.ok) {
    throw new Error(
      `Problem getting a refresh token: ${JSON.stringify(refreshTokenJSON)}`
    )
  }
  const { idToken, refreshToken } = refreshTokenJSON
  return {
    idToken,
    refreshToken,
    AuthUser,
  }
}
