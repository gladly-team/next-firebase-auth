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
  `[verifyIdToken] Error verifying the ID token: ${errCode}. The user will be unauthenticated.`

const throwIfFetchNotDefined = () => {
  if (typeof fetch === 'undefined') {
    throw new Error(
      'A `fetch` global is required when using next-firebase-auth. See documentation on setting up a `fetch` polyfill.'
    )
  }
}

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
  // Ensure `fetch` is defined.
  throwIfFetchNotDefined()

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
            `[verifyIdToken] The ID token is expired (error code ${e.code}). Attempting to refresh the ID token.`
          )
          let newTokenFailure = false
          try {
            newToken = await refreshExpiredIdToken(refreshToken)
          } catch (refreshErr) {
            newTokenFailure = true

            // Call developer-provided error callback.
            await onTokenRefreshError(refreshErr)
          }

          if (!newTokenFailure) {
            logDebug('[verifyIdToken] Successfully refreshed the ID token.')
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
              '[verifyIdToken] Failed to refresh the ID token. The user will be unauthenticated.'
            )
          }
          break
        }

      // Fall through here if there is no refresh token. Without a refresh
      // token, an expired ID token is not resolvable.
      // eslint-disable-next-line no-fallthrough
      default:
        // Here, any errors are unexpected. Return an unauthenticated user.
        // Rationale: it's not particularly easy for developers to
        // catch errors in `withAuthUserSSR`, so default to returning
        // an unauthed user and give the developer control over
        // handling the error.
        // https://github.com/gladly-team/next-firebase-auth/issues/366
        newToken = null
        firebaseUser = null

        // Call developer-provided error callback.
        await onVerifyTokenError(e)
        logDebug(errorMessageVerifyFailed(e.code))
    }
  }
  const AuthUser = createAuthUser({
    firebaseUserAdminSDK: firebaseUser,
    token: newToken,
  })
  if (AuthUser.id) {
    logDebug(
      `[verifyIdToken] Successfully verified the ID token. The user is authenticated.`
    )
  }
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
  // Ensure `fetch` is defined.
  throwIfFetchNotDefined()

  const AuthUser = await verifyIdToken(token)
  const admin = getFirebaseAdminApp()

  // Ensure a user is authenticated before proceeding:
  // https://github.com/gladly-team/next-firebase-auth/issues/531
  if (!AuthUser.id) {
    throw new Error('Failed to verify the ID token.')
  }

  // Prefixing with "[setAuthCookies]" because that's currently the only
  // use case for using getCustomIdAndRefreshTokens.
  logDebug('[setAuthCookies] Getting a refresh token from the ID token.')

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
    logDebug(
      '[setAuthCookies] Failed to get a refresh token from the ID token.'
    )
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
