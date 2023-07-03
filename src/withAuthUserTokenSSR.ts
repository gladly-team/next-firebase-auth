import type { ParsedUrlQuery } from 'querystring'
import {
  GetServerSidePropsContext,
  GetServerSidePropsResult,
  PreviewData,
} from 'next'

import getUserFromCookies from 'src/getUserFromCookies'
import { AuthAction } from 'src/AuthAction'
import { getLoginRedirectInfo, getAppRedirectInfo } from 'src/redirects'
import logDebug from 'src/logDebug'
import { AuthUser as AuthUserType } from './createAuthUser'
import { PageURL } from './redirectTypes'

export interface WithAuthUserSSROptions {
  whenAuthed?: AuthAction.RENDER | AuthAction.REDIRECT_TO_APP
  whenUnauthed?: AuthAction.RENDER | AuthAction.REDIRECT_TO_LOGIN
  appPageURL?: PageURL
  authPageURL?: PageURL
}

type GetSSRResult<P> = GetServerSidePropsResult<
  P & { AuthUserSerialized?: string }
>

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type Dictionary<T = any> = Record<string, T>

type SSRPropsContext<
  Q extends ParsedUrlQuery = ParsedUrlQuery,
  D extends PreviewData = PreviewData
> = GetServerSidePropsContext<Q, D> & { AuthUser: AuthUserType }

type SSRPropsGetter<
  P extends Dictionary = Dictionary,
  Q extends ParsedUrlQuery = ParsedUrlQuery,
  D extends PreviewData = PreviewData
> = (context: SSRPropsContext<Q, D>) => Promise<GetSSRResult<P>>

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
      appPageURL = undefined,
      authPageURL = undefined,
    }: WithAuthUserSSROptions = {},
    { useToken = true } = {}
  ) =>
  <
    P extends Dictionary = Dictionary,
    Q extends ParsedUrlQuery = ParsedUrlQuery,
    D extends PreviewData = PreviewData
  >(
    getServerSidePropsFunc?: SSRPropsGetter<P, Q, D>
  ) =>
  async (ctx: SSRPropsContext<Q, D>) => {
    logDebug(
      '[withAuthUserSSR] Calling "withAuthUserSSR" / "withAuthUserTokenSSR".'
    )
    const { req } = ctx
    const AuthUser = await getUserFromCookies({ req, includeToken: useToken })
    const AuthUserSerialized = AuthUser.serialize()

    // If specified, redirect to the login page if the user is unauthed.
    if (!AuthUser.id && whenUnauthed === AuthAction.REDIRECT_TO_LOGIN) {
      logDebug('[withAuthUserSSR] Redirecting to login.')
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
      logDebug('[withAuthUserSSR] Redirecting to app.')
      const redirect = getAppRedirectInfo({
        ctx,
        AuthUser,
        redirectURL: appPageURL,
      })

      return {
        redirect,
      }
    }

    // Evaluate the composed getServerSideProps().
    if (getServerSidePropsFunc) {
      // Add the AuthUser to Next.js context so pages can use
      // it in `getServerSideProps`, if needed.
      ctx.AuthUser = AuthUser
      const composedProps = (await getServerSidePropsFunc(ctx)) || {}
      if (composedProps) {
        if ('props' in composedProps) {
          // If there are composed props, add Authuser to the props.
          return {
            ...composedProps,
            props: {
              ...(composedProps.props || {}),
              AuthUserSerialized,
            },
          }
        }
        if ('notFound' in composedProps || 'redirect' in composedProps) {
          // If the composed props include a 'notFound' or 'redirect' key,
          // it means it contains a custom dynamic routing logic that should
          // not be overwritten:
          // https://nextjs.org/docs/basic-features/data-fetching#getserversideprops-server-side-rendering)
          return { ...composedProps }
        }
      }
    }
    return {
      props: {
        AuthUserSerialized,
      },
    }
  }

export default withAuthUserTokenSSR
