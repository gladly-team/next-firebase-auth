import getFirebaseAdminApp from 'src/initFirebaseAdminSDK'
import createAuthUser from 'src/createAuthUser'
import { getConfig } from 'src/config'

// https://firebase.google.com/docs/auth/admin/errors
const FIREBASE_ERROR_TOKEN_EXPIRED = 'auth/id-token-expired'

const getFirebasePublicAPIKey = () => {
  const config = getConfig()
  return config.firebaseClientInitConfig.apiKey
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

  const endpoint = `https://securetoken.googleapis.com/v1/token?key=${firebasePublicAPIKey}`

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
  try {
    firebaseUser = await admin.auth().verifyIdToken(token)
  } catch (e) {
    // If the user's ID token has expired, refresh it if possible.
    if (refreshToken && e.code === FIREBASE_ERROR_TOKEN_EXPIRED) {
      newToken = await refreshExpiredIdToken(refreshToken)
      firebaseUser = await admin.auth().verifyIdToken(newToken)
    } else {
      // Otherwise, throw.
      throw e
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
  const AuthUser = await verifyIdToken(token)
  const admin = getFirebaseAdminApp()

  // It's important that we pass the same user ID here, otherwise
  // Firebase will create a new user.
  const customToken = await admin.auth().createCustomToken(AuthUser.id)

  // https://firebase.google.com/docs/reference/rest/auth/#section-verify-custom-token
  const firebasePublicAPIKey = getFirebasePublicAPIKey()

  const refreshTokenEndpoint = `https://identitytoolkit.googleapis.com/v1/accounts:signInWithCustomToken?key=${firebasePublicAPIKey}`

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
