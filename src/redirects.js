function getDestinationURL(ctx, AuthUser, redirectDestination) {
  const redirectDestinationType = typeof redirectDestination
  if (redirectDestinationType === 'string') {
    return redirectDestination
  }

  if (redirectDestinationType === 'object') {
    return redirectDestination.url
  }

  return redirectDestination({ ctx, AuthUser })
}

export function getRedirectToLoginDestination(
  authRedirectDestination,
  ctx,
  AuthUser
) {
  if (!authRedirectDestination) {
    throw new Error(
      `When "whenUnauthed" is set to AuthAction.REDIRECT_TO_LOGIN, "authPageURL" must be set.`
    )
  }
  return getDestinationURL(ctx, AuthUser, authRedirectDestination)
}

export function getRedirectToAppDestination(
  appRedirectDestination,
  ctx,
  AuthUser
) {
  if (!appRedirectDestination) {
    throw new Error(
      `When "whenAuthed" is set to AuthAction.REDIRECT_TO_APP, "appPageURL" must be set.`
    )
  }
  const destination = getDestinationURL(ctx, AuthUser, appRedirectDestination)

  return destination
}
