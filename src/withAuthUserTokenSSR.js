import getUserFromCookies from 'src/getUserFromCookies'
import AuthAction from 'src/AuthAction'
import { getLoginRedirectInfo, getAppRedirectInfo } from 'src/redirects'

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
 * @param {String|Function} appPageURL - The redirect destination URL when
 *   we redirect to the app. Can either be a string or a function
 *   that accepts ({ctx, AuthUser}) as args and returns a string.
 * @param {String|Function} authPageURL - The redirect destination URL when
 *   we redirect to the login page. Can either be a string or a function
 *   that accepts ({ctx, AuthUser}) as args and returns a string.
 * @return {Object} response
 * @return {Object} response.props - The server-side props
 * @return {Object} response.props.AuthUser
 */
const withAuthUserTokenSSR =
  (
    {
      whenAuthed = AuthAction.RENDER,
      whenUnauthed = AuthAction.RENDER,
      appPageURL = null,
      authPageURL = null,
    } = {},
    { useToken = true } = {}
  ) =>
  (getServerSidePropsFunc) =>
  async (ctx) => {
    const { req } = ctx
    const AuthUser = await getUserFromCookies({ req, includeToken: useToken })
    const AuthUserSerialized = AuthUser.serialize()

    // If specified, redirect to the login page if the user is unauthed.
    if (!AuthUser.id && whenUnauthed === AuthAction.REDIRECT_TO_LOGIN) {
      const redirect = getLoginRedirectInfo({
        ctx,
        AuthUser,
        redirectURL: authPageURL,
      })

      return {
        redirect,
      }
    }

    // If specified, redirect to the app page if the user is authed.
    if (AuthUser.id && whenAuthed === AuthAction.REDIRECT_TO_APP) {
      const redirect = getAppRedirectInfo({
        ctx,
        AuthUser,
        redirectURL: appPageURL,
      })

      return {
        redirect,
      }
    }

    // Prepare return data
    let returnData = { props: { AuthUserSerialized } }

    // Evaluate the composed getServerSideProps().
    if (getServerSidePropsFunc) {
      // Add the AuthUser to Next.js context so pages can use
      // it in `getServerSideProps`, if needed.
      ctx.AuthUser = AuthUser
      const composedProps = (await getServerSidePropsFunc(ctx)) || {}
      if (composedProps) {
        if (composedProps.props) {
          // If there are composed props, add Authuser to the props.
          returnData = { ...composedProps }
          returnData.props.AuthUserSerialized = AuthUserSerialized
        } else if (composedProps.notFound || composedProps.redirect) {
          // If the composed props include a 'notFound' or 'redirect' key,
          // it means it contains a custom dynamic routing logic that should
          // not be overwritten:
          // https://nextjs.org/docs/basic-features/data-fetching#getserversideprops-server-side-rendering)
          returnData = { ...composedProps }
        }
      }
    }

    return returnData
  }

export default withAuthUserTokenSSR
