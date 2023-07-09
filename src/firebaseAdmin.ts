import { getAuth as getAdminAuth } from 'firebase-admin/auth'
import initFirebaseAdminSDK from 'src/initFirebaseAdminSDK'
import createUser, { User } from 'src/createUser'
import { getConfig } from 'src/config'
import logDebug from 'src/logDebug'
import { FirebaseError as FirebaseErrorType } from 'firebase-admin/app'

// If the FIREBASE_AUTH_EMULATOR_HOST variable is set, send the token request to the emulator
const getTokenPrefix = () =>
  process.env.FIREBASE_AUTH_EMULATOR_HOST
    ? `http://${process.env.FIREBASE_AUTH_EMULATOR_HOST}/`
    : 'https://'

const getFirebasePublicAPIKey = () => {
  const config = getConfig()
  return config.firebaseClientInitConfig.apiKey
}

const errorMessageVerifyFailed = (errCode: string) =>
  `[verifyIdToken] Error verifying the ID token: ${errCode}. The user will be unauthenticated.`

const throwIfFetchNotDefined = () => {
  if (typeof fetch === 'undefined') {
    throw new Error(
      'A `fetch` global is required when using next-firebase-auth. See documentation on setting up a `fetch` polyfill.'
    )
  }
}

/**
 * Get the firebase admin TenantAwareAuth or the BasicAuth object needed for the user
 */
const getAuth = (tenantId?: string | null) => {
  if (tenantId) {
    return getAdminAuth().tenantManager().authForTenant(tenantId)
  }
  return getAdminAuth()
}

/**
 * Given a refresh token, get a new Firebase ID token. Call this when
 * the Firebase ID token has expired.
 * @return {String} The new ID token
 */
const refreshExpiredIdToken = async (refreshToken: string) => {
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

export type VerifyIdToken = (
  token: string,
  refreshToken?: string
) => Promise<User>

export const verifyIdToken: VerifyIdToken = async (
  token: string,
  refreshToken?: string
) => {
  // Ensure `fetch` is defined.
  throwIfFetchNotDefined()

  initFirebaseAdminSDK()

  let firebaseUser
  let newToken: string | null = token
  const { onTokenRefreshError, onVerifyTokenError, tenantId } = getConfig()
  const firebaseAdminAuth = getAuth(tenantId)
  try {
    firebaseUser = await firebaseAdminAuth.verifyIdToken(token)
  } catch (e) {
    // FirebaseError isn't exported, so let's assume.
    // https://github.com/firebase/firebase-admin-node/issues/1666
    const firebaseErr: FirebaseErrorType = e as FirebaseErrorType
    if (firebaseErr.code) {
      // https://firebase.google.com/docs/reference/node/firebase.auth.Error
      switch (firebaseErr.code) {
        // Errors we consider expected and which should result in an
        // unauthenticated user.
        case 'auth/invalid-user-token':
        case 'auth/user-token-expired':
        case 'auth/user-disabled':
          // Return an unauthenticated user.
          // https://github.com/gladly-team/next-firebase-auth/issues/174
          newToken = null
          firebaseUser = undefined
          logDebug(errorMessageVerifyFailed(firebaseErr.code))
          break

        // Errors that might be fixed by refreshing the user's ID token.
        case 'auth/id-token-expired':
        case 'auth/argument-error':
          if (refreshToken) {
            logDebug(
              `[verifyIdToken] The ID token is expired (error code ${firebaseErr.code}). Attempting to refresh the ID token.`
            )
            let newTokenFailure = false
            try {
              newToken = await refreshExpiredIdToken(refreshToken)
            } catch (refreshErr) {
              newTokenFailure = true

              // Call developer-provided error callback.
              if (refreshErr instanceof Error) {
                if (onTokenRefreshError) {
                  await onTokenRefreshError(refreshErr)
                }
              } else {
                logDebug(refreshErr)
              }
            }

            if (!newTokenFailure) {
              logDebug('[verifyIdToken] Successfully refreshed the ID token.')
              try {
                firebaseUser = await firebaseAdminAuth.verifyIdToken(
                  // Assume new token is set and catch any errors.
                  newToken as string
                )
              } catch (verifyErr) {
                if (verifyErr instanceof Error) {
                  if (onVerifyTokenError) {
                    await onVerifyTokenError(verifyErr)
                  }
                  // FirebaseError isn't exported, so let's assume.
                  // https://github.com/firebase/firebase-admin-node/issues/1666
                  const verifyErrFromFirebase: FirebaseErrorType =
                    verifyErr as unknown as FirebaseErrorType
                  if (verifyErrFromFirebase.code) {
                    logDebug(
                      errorMessageVerifyFailed(verifyErrFromFirebase.code)
                    )
                  }
                } else {
                  logDebug(verifyErr)
                }
              }
            }

            // If either token refreshing or validation failed, return an
            // unauthenticated user.
            // https://github.com/gladly-team/next-firebase-auth/issues/366
            if (newTokenFailure) {
              newToken = null
              firebaseUser = undefined
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
          // catch errors in `withUserSSR`, so default to returning
          // an unauthed user and give the developer control over
          // handling the error.
          // https://github.com/gladly-team/next-firebase-auth/issues/366
          newToken = null
          firebaseUser = undefined

          // Call developer-provided error callback.
          if (onVerifyTokenError) {
            await onVerifyTokenError(firebaseErr as unknown as Error)
          }
          logDebug(errorMessageVerifyFailed(firebaseErr.code))
      }
    } else {
      // This should never happen because all errors should be instances of
      // FirebaseError.
      newToken = null
      firebaseUser = undefined
      logDebug(e)
    }
  }
  const user = createUser({
    firebaseUserAdminSDK: firebaseUser,
    token: newToken,
  })
  if (user.id) {
    logDebug(
      `[verifyIdToken] Successfully verified the ID token. The user is authenticated.`
    )
  }
  return user
}

/**
 * Given a Firebase ID token, return an ID token, refresh token,
 * and user. We can use the refresh token to refresh expired
 * ID tokens during server-side rendering.
 * See:
 *  https://firebase.google.com/docs/reference/rest/auth/#section-refresh-token
 *  https://stackoverflow.com/a/38284384
 */
export const getCustomIdAndRefreshTokens = async (token: string) => {
  // Ensure `fetch` is defined.
  throwIfFetchNotDefined()

  initFirebaseAdminSDK()

  const user = await verifyIdToken(token)
  const firebaseAdminAuth = getAuth(user.tenantId)

  // Ensure a user is authenticated before proceeding:
  // https://github.com/gladly-team/next-firebase-auth/issues/531
  if (!user.id) {
    throw new Error('Failed to verify the ID token.')
  }

  // To ensure we get the latest custom claims, we need to get the user record.
  logDebug('[setAuthCookies] Getting the Firebase user record.')
  const { customClaims } = await firebaseAdminAuth
    .getUser(user.id)
    .catch(() => {
      logDebug('[setAuthCookies] Failed to get the Firebase user record.')
      return {
        customClaims: {},
      }
    })

  // Prefixing with "[setAuthCookies]" because that's currently the only
  // use case for using getCustomIdAndRefreshTokens.
  logDebug('[setAuthCookies] Getting a refresh token from the ID token.')

  // It's important that we pass the same user ID here, otherwise
  // Firebase will create a new user.
  const customToken = await firebaseAdminAuth.createCustomToken(
    user.id,
    customClaims
  )

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
    user,
  }
}
