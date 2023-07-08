import type { ParsedUrlQuery } from 'querystring'
import {
  GetServerSideProps,
  GetServerSidePropsContext,
  PreviewData,
  Redirect,
} from 'next'

import getUserFromCookies from 'src/getUserFromCookies'
import { AuthAction } from 'src/AuthAction'
import { getLoginRedirectInfo, getAppRedirectInfo } from 'src/redirects'
import logDebug from 'src/logDebug'
import { User } from './createUser'
import { PageURL } from './redirectTypes'

export interface WithUserSSROptions {
  /**
   * The behavior to take if the user is authenticated.
   */
  whenAuthed?: AuthAction.RENDER | AuthAction.REDIRECT_TO_APP
  /**
   * The behavior to take if the user is not authenticated.
   */
  whenUnauthed?: AuthAction.RENDER | AuthAction.REDIRECT_TO_LOGIN
  /**
   * The redirect destination URL when redirecting to the app.
   */
  appPageURL?: PageURL
  /**
   * The redirect destination URL when redirecting to the login page.
   */
  authPageURL?: PageURL
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type Dictionary<T = any> = Record<string, T>

type GetSSRProps<P> = P & { userSerialized?: string }

type GetSSRResult<P> =
  | {
      redirect: Redirect
    }
  | {
      notFound: true
    }
  | {
      props: GetSSRProps<P>
    }

type SSRPropsContext<
  Q extends ParsedUrlQuery = ParsedUrlQuery,
  D extends PreviewData = PreviewData
> = GetServerSidePropsContext<Q, D> & { user?: User }

type SSRPropsGetter<P, Q extends ParsedUrlQuery, D extends PreviewData> = (
  context: SSRPropsContext<Q, D>
) => Promise<GetSSRResult<P>>

/**
 * An wrapper for a page's exported getServerSideProps that provides the authed
 * user's info as a prop. Optionally, this handles redirects based on auth
 * status.
 * See this discussion on how best to use `getServerSideProps` with a
 * a higher-order component pattern:
 * https://github.com/vercel/next.js/discussions/10925#discussioncomment-12471
 */
export type WithUserSSR = (
  options?: WithUserSSROptions
) => <
  P extends Dictionary = Dictionary,
  Q extends ParsedUrlQuery = ParsedUrlQuery,
  D extends PreviewData = PreviewData
>(
  propGetter?: SSRPropsGetter<P, Q, D>
) => GetServerSideProps<P, Q, D>

const withUserTokenSSR: WithUserSSR =
  (
    {
      whenAuthed = AuthAction.RENDER,
      whenUnauthed = AuthAction.RENDER,
      appPageURL = undefined,
      authPageURL = undefined,
    }: WithUserSSROptions = {},
    { useToken = true } = {}
  ) =>
  <P extends Dictionary, Q extends ParsedUrlQuery, D extends PreviewData>(
    getServerSidePropsFunc?: GetServerSideProps<P, Q, D>
  ) =>
  async (ctx: SSRPropsContext<Q, D>) => {
    logDebug('[withUserSSR] Calling "withUserSSR" / "withUserTokenSSR".')
    const { req } = ctx
    const user = await getUserFromCookies({ req, includeToken: useToken })
    const userSerialized = user.serialize()

    // If specified, redirect to the login page if the user is unauthed.
    if (!user.id && whenUnauthed === AuthAction.REDIRECT_TO_LOGIN) {
      logDebug('[withUserSSR] Redirecting to login.')
      const redirect = getLoginRedirectInfo({
        ctx,
        user,
        redirectURL: authPageURL,
      })

      return {
        redirect,
      }
    }

    // If specified, redirect to the app page if the user is authed.
    if (user.id && whenAuthed === AuthAction.REDIRECT_TO_APP) {
      logDebug('[withUserSSR] Redirecting to app.')
      const redirect = getAppRedirectInfo({
        ctx,
        user,
        redirectURL: appPageURL,
      })

      return {
        redirect,
      }
    }

    // Evaluate the composed getServerSideProps().
    if (getServerSidePropsFunc) {
      // Add the user to Next.js context so pages can use it in
      // `getServerSideProps`.
      ctx.user = user
      const composedProps = (await getServerSidePropsFunc(ctx)) || {}
      if (composedProps) {
        if ('props' in composedProps) {
          // If there are composed props, add user to the props.
          return {
            ...composedProps,
            props: {
              ...((composedProps.props || {}) as P),
              userSerialized,
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
        userSerialized,
      } as unknown as P,
    }
  }

export default withUserTokenSSR
