import createAuthUser from 'src/createAuthUser'
import { getCookie } from 'src/cookies'
import { verifyIdToken } from 'src/firebaseAdmin'
import { getAuthUserTokensCookieName } from 'src/authCookies'

// An auth wrapper for a page's exported getServerSideProps.
// See this discussion on how best to use getServerSideProps
// with a higher-order component pattern:
// https://github.com/vercel/next.js/discussions/10925#discussioncomment-12471
const withAuthUserTokenSSR = ({ authRequired = false } = {}) => (
  getServerSidePropsFunc
) => async (ctx) => {
  const { req, res } = ctx

  // Get the user's ID token from their cookie, verify it (refreshing
  // as needed), and return the serialized AuthUser in props.
  const cookieValStr = getCookie(getAuthUserTokensCookieName(), {
    req,
    res,
  })
  const { idToken, refreshToken } = cookieValStr ? JSON.parse(cookieValStr) : {}
  let firebaseAdminUser
  let token
  if (idToken) {
    ;({ user: firebaseAdminUser, token } = await verifyIdToken(
      idToken,
      refreshToken
    ))
  }
  const AuthUser = createAuthUser({
    ...(firebaseAdminUser && {
      firebaseUserAdminSDK: firebaseAdminUser,
      token,
    }),
  })
  const AuthUserSerialized = AuthUser.serialize()

  // If auth is required but the user is not authed, don't return
  // any props.
  // Ideally, this should redirect on the server-side. See this
  // RFC on supporting redirects from getServerSideProps:
  // https://github.com/vercel/next.js/discussions/14890
  if (!AuthUser.id && authRequired) {
    return { props: {} }
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
