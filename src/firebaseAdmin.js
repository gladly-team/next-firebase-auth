import * as admin from 'firebase-admin'
import createAuthUser from 'src/createAuthUser'

// https://firebase.google.com/docs/auth/admin/errors
const FIREBASE_ERROR_TOKEN_EXPIRED = 'auth/id-token-expired'

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
  const endpoint = `https://securetoken.googleapis.com/v1/token?key=${process.env.NEXT_PUBLIC_FIREBASE_PUBLIC_API_KEY}`
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

// TODO: refactor to return AuthUser, then expose it as a method.
//   This would provide an easy way to use token-based auth for
//   API endpoints, rather than relying on cookies or requiring
//   the user to interface with firebase-admin.
/**
 * Verify the Firebase ID token and return the Firebase user.
 * If the ID token has expired, refresh it if a refreshToken
 * is provided.
 * @return {Object} result
 * @return {Object} result.user - The Firebase user
 * @return {Object} result.token - The token, which will change when
 *   it is refreshed.
 */
export const verifyIdToken = async (token, refreshToken = null) => {
  let firebaseUser
  let newToken = token
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
  return {
    user: firebaseUser,
    token: newToken,
  }
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
  const { user: firebaseUser } = await verifyIdToken(token)

  // It's important that we pass the same user ID here, otherwise
  // Firebase will create a new user.
  const customToken = await admin.auth().createCustomToken(firebaseUser.uid)

  // https://firebase.google.com/docs/reference/rest/auth/#section-verify-custom-token
  const refreshTokenEndpoint = `https://identitytoolkit.googleapis.com/v1/accounts:signInWithCustomToken?key=${process.env.NEXT_PUBLIC_FIREBASE_PUBLIC_API_KEY}`
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

  const AuthUser = createAuthUser({ firebaseUserAdminSDK: firebaseUser })

  return {
    idToken,
    refreshToken,
    AuthUser,
  }
}
