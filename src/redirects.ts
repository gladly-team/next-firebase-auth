import type { GetServerSidePropsContext } from 'next'

import { AuthUser as AuthUserType } from 'src/createAuthUser'
import { getConfig } from 'src/config'
import {
  PageURL,
  RedirectConfig,
  RedirectConfigName,
  RedirectInput,
  RedirectObject,
} from './redirectTypes'

const getDestination = ({
  ctx,
  AuthUser,
  redirectDestination,
}: {
  ctx?: GetServerSidePropsContext
  AuthUser?: AuthUserType
  redirectDestination: PageURL
}): RedirectObject | undefined => {
  if (typeof redirectDestination === 'function') {
    const destination = redirectDestination({ ctx, AuthUser })
    return getDestination({ ctx, AuthUser, redirectDestination: destination })
  }

  if (typeof redirectDestination === 'string') {
    return {
      destination: redirectDestination,
      permanent: false,
    }
  }

  if (typeof redirectDestination === 'object') {
    return {
      permanent: false,
      ...redirectDestination,
    }
  }
  return undefined
}

const throwWhenInvalid = (
  redirectConfigName: RedirectConfigName,
  redirectURL?: RedirectObject
) => {
  const isValid =
    redirectURL &&
    (typeof redirectURL === 'string' ||
      (typeof redirectURL && 'destination' in redirectURL))

  if (!isValid) {
    throw new Error(
      `The "${redirectConfigName}" must be set to a non-empty string, an object literal containing "destination", or a function that returns either.`
    )
  }

  return redirectURL
}

const getRedirectByUrlConfigName = (redirectConfig: RedirectConfig) => {
  const { redirectConfigName, redirectURL, ctx, AuthUser } = redirectConfig
  const redirectDestination =
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    redirectURL || ((getConfig() as any)[redirectConfigName] as PageURL)
  return throwWhenInvalid(
    redirectConfigName,
    getDestination({
      ctx,
      AuthUser,
      redirectDestination,
    })
  )
}

/**
 * getLoginRedirectInfo validates and returns the configuration for redirecting to the login page
 * by using the "redirectURL" prop or the "authPageURL" global config setting
 *
 * @param {Object} LoginRedirectProps
 * @param {String|Function|Object} LoginRedirectProps.redirectURL - redirect config for determining the redirect destination
 * @param {Object} LoginRedirectProps.AuthUser - An instance of AuthUser
 * @param {ctx|null} LoginRedirectProps.ctx - Server-side context
 */
export const getLoginRedirectInfo = ({
  redirectURL,
  AuthUser,
  ctx,
}: RedirectInput) =>
  getRedirectByUrlConfigName({
    redirectConfigName: 'authPageURL',
    redirectURL,
    AuthUser,
    ctx,
  })

/**
 * getAppRedirectInfo validates and returns the configuration for redirecting to the main app page
 * by using the "redirectURL" prop or the "appPageURL" global config setting
 *
 * @param {Object} LoginRedirectProps
 * @param {String|Function|Object} LoginRedirectProps.redirectURL - redirect config for determining the redirect destination
 * @param {Object} LoginRedirectProps.AuthUser - An instance of AuthUser
 * @param {ctx|null} LoginRedirectProps.ctx - Server-side context
 */
export const getAppRedirectInfo = ({
  redirectURL,
  AuthUser,
  ctx,
}: RedirectInput) =>
  getRedirectByUrlConfigName({
    redirectConfigName: 'appPageURL',
    redirectURL,
    AuthUser,
    ctx,
  })
