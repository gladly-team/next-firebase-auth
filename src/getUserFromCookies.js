// TODO: remove eslint-disable
/* eslint-disable no-unused-vars */

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
 * @param {String} params.authCookie - The value of the `next-firebase-auth`
 *   auth cookie from which to get the user. This is an alternative to
 *   passing the request object.
 * @param {String} params.authCookieSig - The `next-firebase-auth` auth
 *   cookie signature value, if using signed cookies. This is an alternative
 *   to passing the request object.
 * @return {Object} An AuthUser instance
 */
const getUserFromCookies = async ({
  req,
  includeToken = true,
  authCookie,
  authCookieSig,
}) => {
  // TODO
  const user = {}
  return user
}

export default getUserFromCookies
