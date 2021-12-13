/* globals window */
import { useRouter } from 'next/router'

/**
 * getDestinationURL leverages an incoming redirect destination and deter
 *
 * @param {} ctx
 * @param {} AuthUser
 * @param {} redirectDestination
 */
const getDestination = (ctx, AuthUser, redirectDestination) => {
  if (typeof redirectDestination === 'function') {
    return redirectDestination({ ctx, AuthUser })
  }

  return redirectDestination
}

/**
 * getRedirectToLoginDestination.
 *
 * @param {} ctx
 * @param {} AuthUser
 * @param {} redirectDestination
 */
export const getRedirectToLoginDestination = (
  authRedirectDestination,
  ctx,
  AuthUser
) => {
  if (!authRedirectDestination) {
    throw new Error(
      'The "authPageURL" config setting must be set when using `REDIRECT_TO_LOGIN`.'
    )
  }
  const destination = getDestination(ctx, AuthUser, authRedirectDestination)

  if (!destination) {
    throw new Error(
      'The "appPageURL" must be set to a non-empty string, an object literal containing "url:string" and "basePath:boolean", or resolve to either'
    )
  }

  return destination
}

/**
 * getRedirectToAppDestination.
 *
 * @param {} ctx
 * @param {} AuthUser
 * @param {} redirectDestination
 */
export const getRedirectToAppDestination = (
  appRedirectDestination,
  ctx,
  AuthUser
) => {
  if (!appRedirectDestination) {
    throw new Error(
      'The "appPageURL" config setting must be set when using `REDIRECT_TO_APP`.'
    )
  }

  const destination = getDestination(ctx, AuthUser, appRedirectDestination)

  if (!destination) {
    throw new Error(
      'The "appPageURL" must be set to a non-empty string, an object literal containing "url" and "basePath", or resolve to either'
    )
  }

  return destination
}
