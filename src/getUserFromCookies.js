import createAuthUser from 'src/createAuthUser'
import { getCookie } from 'src/cookies'
import { verifyIdToken } from 'src/firebaseAdmin'
import {
  getAuthUserCookieName,
  getAuthUserSigCookieName,
  getAuthUserTokensCookieName,
  getAuthUserTokensSigCookieName,
} from 'src/authCookies'
import { getConfig } from 'src/config'

/**
 * Given a request object or cookie values, verify and return
 * the user. See:
 * https://github.com/gladly-team/next-firebase-auth/issues/223
 *
 * @param {Object} params
 * @param {Object} params.req - An HTTP request object (for example
 *   `context.req` from the Next.js `context` object). It should contain
 *   the "cookie" header value.
 * @param {Boolean} includeToken - Whether or not the returned user
 *   should include a Firebase ID token. When true, the behavior follows
 *   `withAuthUserTokenSSR`; when false, it follows `withAuthUserSSR`.
 *   Defaults to true. Read more about the distinction in the docs for
 *   `withAuthUserSSR` here:
 *   https://github.com/gladly-team/next-firebase-auth#withauthuserssr-options-getserversidepropsfunc---authuser---
 * @param {String} params.authCookieValue - The value of the
 *   `next-firebase-auth` auth cookie from which to get the user. This is an
 *   alternative to passing the request object.
 * @param {String} params.authCookieSigValue - The `next-firebase-auth` auth
 *   cookie signature value, if using signed cookies. This is an alternative
 *   to passing the request object.
 * @return {Object} An AuthUser instance
 */
const getUserFromCookies = async ({
  req: initialReq,
  includeToken = true,
  authCookieValue,
  authCookieSigValue,
}) => {
  const { keys, secure, signed } = getConfig().cookies
  let user

  // If cookie values are provided instead of a request object, construct
  // a replacement "request object" for compatibility with our cookies
  // library.
  let req = initialReq
  if (!initialReq) {
    if (!authCookieValue) {
      throw new Error('Either "req" or "authCookieValue" must be provided.')
    }
    const cookieName = includeToken
      ? getAuthUserTokensCookieName()
      : getAuthUserCookieName()
    const cookieSigName = includeToken
      ? getAuthUserTokensSigCookieName()
      : getAuthUserSigCookieName()
    const sigCookieStr = authCookieSigValue
      ? `${cookieSigName}=${authCookieSigValue};`
      : ''
    const cookieStr = `${cookieName}=${authCookieValue};${
      authCookieSigValue ? ` ${sigCookieStr}` : ''
    }`
    req = {
      headers: {
        cookie: cookieStr,
      },
    }
  }

  // Get the user either from:
  // * the ID token, refreshing the token as needed (via a network
  //   request), which will make `AuthUser.getIdToken` resolve to
  //   a valid ID token value
  // * the "AuthUser" cookie (no network request), which will make
  //  `AuthUser.getIdToken` resolve to null
  if (includeToken) {
    // Get the user's ID token from a cookie, verify it (refreshing
    // as needed), and return the serialized AuthUser in props.
    const cookieValStr = getCookie(
      getAuthUserTokensCookieName(),
      {
        req,
      },
      { keys, secure, signed }
    )
    const { idToken, refreshToken } = cookieValStr
      ? JSON.parse(cookieValStr)
      : {}
    if (idToken) {
      user = await verifyIdToken(idToken, refreshToken)
    } else {
      user = createAuthUser() // unauthenticated AuthUser
    }
  } else {
    // https://github.com/gladly-team/next-firebase-auth/issues/195
    if (!signed) {
      throw new Error('Cookies must be signed when using withAuthUserSSR.')
    }

    // Get the user's info from a cookie, verify it (refreshing
    // as needed), and return the serialized AuthUser in props.
    const cookieValStr = getCookie(
      getAuthUserCookieName(),
      {
        req,
      },
      { keys, secure, signed }
    )
    user = createAuthUser({
      serializedAuthUser: cookieValStr,
    })
  }
  return user
}

export default getUserFromCookies
