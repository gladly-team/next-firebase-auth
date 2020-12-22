import createAuthUser from 'src/createAuthUser'
import { getCookie } from 'src/cookies'
import { verifyIdToken } from 'src/firebaseAdmin'
import { getAuthUserTokensCookieName } from 'src/authCookies'
import { getConfig } from 'src/config'
import AuthAction from 'src/AuthAction'

/**
 * An wrapper for a page's exported getServerSideProps that
 * provides the authed user's info as a prop. Optionally,
 * this handles redirects based on auth status.
 * See this discussion on how best to use getServerSideProps
 * with a higher-order component pattern:
 * https://github.com/vercel/next.js/discussions/10925#discussioncomment-12471
 * @param {String} whenAuthed - The behavior to take if the user
 *   *is* authenticated. One of AuthAction.RENDER or
 *   AuthAction.REDIRECT_TO_APP. Defaults to AuthAction.RENDER.
 * @param {String} whenUnauthed - The behavior to take if the user
 *   is not authenticated. One of AuthAction.RENDER or
 *   AuthAction.REDIRECT_TO_LOGIN. Defaults to AuthAction.RENDER.
 * @param {String} appPageURL - The redirect destination URL when
 *   we redirect to the app.
 * @param {String} authPageURL - The redirect destination URL when
 *   we redirect to the login page.
 * @return {Object} response
 * @return {Object} response.props - The server-side props
 * @return {Object} response.props.AuthUser
 */
const withAuthUserTokenSSR = ({
  whenAuthed = AuthAction.RENDER,
  whenUnauthed = AuthAction.RENDER,
  appPageURL = getConfig().appPageURL,
  authPageURL = getConfig().authPageURL,
} = {}) => (getServerSidePropsFunc) => async (ctx) => {
  const { req, res } = ctx

  const { keys, cookieOptions } = getConfig().cookies
  const { secure, signed } = cookieOptions

  // Get the user's ID token from their cookie, verify it (refreshing
  // as needed), and return the serialized AuthUser in props.
  const cookieValStr = getCookie(
    getAuthUserTokensCookieName(),
    {
      req,
      res,
    },
    { keys, secure, signed }
  )
  const { idToken, refreshToken } = cookieValStr ? JSON.parse(cookieValStr) : {}
  let AuthUser
  if (idToken) {
    AuthUser = await verifyIdToken(idToken, refreshToken)
  } else {
    AuthUser = createAuthUser() // unauthenticated AuthUser
  }
  const AuthUserSerialized = AuthUser.serialize()

  // If specified, redirect to the login page if the user is unauthed.
  if (!AuthUser.id && whenUnauthed === AuthAction.REDIRECT_TO_LOGIN) {
    if (!authPageURL) {
      throw new Error(
        `When "whenUnauthed" is set to AuthAction.REDIRECT_TO_LOGIN, "authPageURL" must be set.`
      )
    }
    return { redirect: { destination: authPageURL, permanent: false } }
  }

  // If specified, redirect to the app page if the user is authed.
  if (AuthUser.id && whenAuthed === AuthAction.REDIRECT_TO_APP) {
    if (!appPageURL) {
      throw new Error(
        `When "whenAuthed" is set to AuthAction.REDIRECT_TO_APP, "appPageURL" must be set.`
      )
    }
    return { redirect: { destination: appPageURL, permanent: false } }
  }

  // Evaluate the composed getServerSideProps().
  let composedProps = {}
  if (getServerSidePropsFunc) {
    // Add the AuthUser to Next.js context so pages can use
    // it in `getServerSideProps`, if needed.
    ctx.AuthUser = AuthUser
    composedProps = await getServerSidePropsFunc(ctx)
  }
  return {
    props: {
      AuthUserSerialized,
      ...composedProps,
    },
  }
}

export default withAuthUserTokenSSR
