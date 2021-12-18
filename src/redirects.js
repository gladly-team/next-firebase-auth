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

const throwWhenInvalid = (prop, redirectURL) => {
  const isValid =
    redirectURL &&
    (typeof redirectURL === 'string' ||
      (typeof redirectURL && 'destination' in redirectURL))

  if (!isValid) {
    throw new Error(
      `The "${prop}" must be set to a non-empty string, an object literal containing "destination", or a function that returns either.`
    )
  }

  return redirectURL
}

export const getRedirectToLoginDestination = ({
  redirectDestination,
  ctx,
  AuthUser,
} = {}) =>
  throwWhenInvalid(
    'authPageURL',
    getDestination({ ctx, AuthUser, redirectDestination })
  )

export const getRedirectToAppDestination = ({
  redirectDestination,
  ctx,
  AuthUser,
} = {}) =>
  throwWhenInvalid(
    'appPageURL',
    getDestination({ ctx, AuthUser, redirectDestination })
  )
