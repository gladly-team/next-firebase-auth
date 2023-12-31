import createUser from 'src/createUser'
import { getCookie } from 'src/cookies'
import { verifyIdToken } from 'src/firebaseAdmin'
import {
  getUserCookieName,
  getUserSigCookieName,
  getUserTokensCookieName,
  getUserTokensSigCookieName,
} from 'src/authCookies'
import { getConfig } from 'src/config'
import logDebug from 'src/logDebug'
import initFirebaseAdminSDK from 'src/initFirebaseAdminSDK'
import { GetServerSidePropsContext, NextApiRequest } from 'next'
import { User } from './User'

export type GetUserFromCookiesOptions = {
  /**
   * An HTTP request object (for example `context.req` from the Next.js
   * `context` object). It should contain the "cookie" header value.
   */
  req?: NextApiRequest | GetServerSidePropsContext['req']
  /**
   * Whether or not the returned user should include a Firebase ID token. When
   * true, the behavior follows `withUserTokenSSR`; when false, it follows
   * `withUserSSR`. Defaults to true. Read more about the distinction in
   * the docs for `withUserSSR` here:
   * https://github.com/gladly-team/next-firebase-auth#withuserssr-options-getserversidepropsfunc---user---
   */
  includeToken?: boolean
  /**
   * The value of the `next-firebase-auth` auth cookie from which to get the
   * user. This is an alternative to passing the request object.
   */
  authCookieValue?: string
  /**
   * The `next-firebase-auth` auth cookie signature value, if using signed
   * cookies. This is an alternative to passing the request object.
   */
  authCookieSigValue?: string
}

/**
 * Given a request object or cookie values, verify and return
 * the user. See:
 * https://github.com/gladly-team/next-firebase-auth/issues/223
 */
export type GetUserFromCookies = (
  options: GetUserFromCookiesOptions
) => Promise<User>

const getUserFromCookies: GetUserFromCookies = async ({
  req: initialReq,
  includeToken = true,
  authCookieValue,
  authCookieSigValue,
}: GetUserFromCookiesOptions) => {
  const { keys, secure, signed } = getConfig().cookies
  let user

  // Make sure the Firebase Admin SDK is initialized.
  initFirebaseAdminSDK()

  // If cookie values are provided instead of a request object, construct
  // a replacement "request object" for compatibility with our cookies
  // library.
  let req = initialReq
  if (!initialReq) {
    if (!authCookieValue) {
      throw new Error('Either "req" or "authCookieValue" must be provided.')
    }
    const cookieName = includeToken
      ? getUserTokensCookieName()
      : getUserCookieName()
    const cookieSigName = includeToken
      ? getUserTokensSigCookieName()
      : getUserSigCookieName()
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
      // Map onto IncomingMessage type, assuming other req properties are unused.
    } as NextApiRequest
  }

  if (!req) {
    // This shouldn't happen, as req assignment is handled above. This is
    // to force `req` typing to be defined.
    throw new Error(
      'When "authCookieValue" is not provided, "req" must be defined.'
    )
  }

  // Get the user either from:
  // * the ID token, refreshing the token as needed (via a network request),
  //   which will make `user.getIdToken` resolve to a valid ID token value.
  // * the user cookie (no network request), which will make `user.getIdToken`
  //   resolve to null.
  if (includeToken) {
    // Get the user's ID token from a cookie, verify it (refreshing
    // as needed), and return the serialized user in props.
    logDebug(
      '[getUserFromCookies] Attempting to get user info from cookies via the ID token.'
    )
    const cookieValStr = getCookie(
      getUserTokensCookieName(),
      {
        req,
      },
      { keys, secure, signed }
    )
    const {
      idToken,
      refreshToken,
    }: { idToken?: string; refreshToken?: string } = cookieValStr
      ? JSON.parse(cookieValStr)
      : {}
    if (idToken) {
      logDebug(
        '[getUserFromCookies] Successfully retrieved the ID token from cookies.'
      )

      // verifyIdToken will provide additional debug logs.
      user = await verifyIdToken(idToken, refreshToken)
    } else {
      logDebug(
        "[getUserFromCookies] Failed to retrieve the ID token from cookies. This will happen if the user is not logged in, the provided cookie values are invalid, or the cookie values don't align with your cookie settings. The user will be unauthenticated."
      )
      user = createUser() // unauthenticated user
    }
  } else {
    // https://github.com/gladly-team/next-firebase-auth/issues/195
    if (!signed) {
      throw new Error('Cookies must be signed when using withUserSSR.')
    }

    // Get the user's info from a cookie, verify it (refreshing
    // as needed), and return the serialized user in props.
    logDebug(
      '[getUserFromCookies] Attempting to get user info from cookies (not using the ID token).'
    )
    const cookieValStr = getCookie(
      getUserCookieName(),
      {
        req,
      },
      { keys, secure, signed }
    )
    if (cookieValStr) {
      logDebug(
        '[getUserFromCookies] Successfully retrieved the user info from cookies.'
      )
    } else {
      logDebug(
        '[getUserFromCookies] Failed to retrieve the user info from cookies. The provided cookie values might be invalid or not align with your cookie settings. The user will be unauthenticated.'
      )
    }
    user = createUser({
      serializedUser: cookieValStr,
    })
  }
  return user
}

export default getUserFromCookies
