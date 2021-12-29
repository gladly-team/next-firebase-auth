import { getConfig } from 'src/config'

const REDIRECT_DEFAULTS = {
  basePath: true,
  permanent: false,
}

const getDestination = ({ ctx, AuthUser, redirectDestination }) => {
  if (typeof redirectDestination === 'function') {
    const destination = redirectDestination({ ctx, AuthUser })
    return getDestination({ ctx, AuthUser, redirectDestination: destination })
  }

  if (typeof redirectDestination === 'string') {
    return {
      ...REDIRECT_DEFAULTS,
      destination: redirectDestination,
    }
  }

  if (typeof redirectDestination === 'object') {
    return {
      ...REDIRECT_DEFAULTS,
      ...redirectDestination,
    }
  }

  return null
}

const throwWhenInvalid = (redirectConfigName, redirectURL) => {
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

const getRedirectByUrlConfigName = (redirectConfig) => {
  const { redirectConfigName, redirectURL, ctx, AuthUser } = redirectConfig
  return throwWhenInvalid(
    redirectConfigName,
    getDestination({
      ctx,
      AuthUser,
      redirectDestination: redirectURL || getConfig()[redirectConfigName],
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
export const getLoginRedirectInfo = ({ redirectURL, AuthUser, ctx }) =>
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
export const getAppRedirectInfo = ({ redirectURL, AuthUser, ctx }) =>
  getRedirectByUrlConfigName({
    redirectConfigName: 'appPageURL',
    redirectURL,
    AuthUser,
    ctx,
  })
