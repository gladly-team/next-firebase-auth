import type { GetServerSidePropsContext } from 'next'

import { User } from 'src/createUser'
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
  user,
  redirectDestination,
}: {
  ctx?: GetServerSidePropsContext
  user?: User
  redirectDestination: PageURL
}): RedirectObject | undefined => {
  if (typeof redirectDestination === 'function') {
    const destination = redirectDestination({ ctx, user })
    return getDestination({ ctx, user, redirectDestination: destination })
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
  const { redirectConfigName, redirectURL, ctx, user } = redirectConfig
  const redirectDestination =
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    redirectURL || ((getConfig() as any)[redirectConfigName] as PageURL)
  return throwWhenInvalid(
    redirectConfigName,
    getDestination({
      ctx,
      user,
      redirectDestination,
    })
  )
}

/**
 * getLoginRedirectInfo validates and returns the configuration for redirecting to the login page
 * by using the "redirectURL" prop or the "authPageURL" global config setting
 */
export const getLoginRedirectInfo = ({
  redirectURL,
  user,
  ctx,
}: RedirectInput) =>
  getRedirectByUrlConfigName({
    redirectConfigName: 'authPageURL',
    redirectURL,
    user,
    ctx,
  })

export const getAppRedirectInfo = ({ redirectURL, user, ctx }: RedirectInput) =>
  getRedirectByUrlConfigName({
    redirectConfigName: 'appPageURL',
    redirectURL,
    user,
    ctx,
  })
