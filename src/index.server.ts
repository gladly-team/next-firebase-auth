/* eslint-disable global-require, @typescript-eslint/no-var-requires */

// Shared with client-side init code.
import initCommon from 'src/initCommon'

import type { ConfigInput } from './configTypes'
import type { WithAuthUser } from './withAuthUser'
import type {
  WithAuthUserSSR,
  WithAuthUserSSROptions,
} from './withAuthUserTokenSSR'
import type { UseAuthUser } from './useAuthUser'

// enum: AuthAction
export * from 'src/AuthAction'

export const init = (config: ConfigInput) => {
  initCommon(config)

  // We only initialize the Firebase admin SDK as it's needed. See:
  // https://github.com/gladly-team/next-firebase-auth/issues/70
}

export { default as getUserFromCookies } from 'src/getUserFromCookies'

export { default as setAuthCookies } from 'src/setAuthCookies'

export { default as unsetAuthCookies } from 'src/unsetAuthCookies'

export const useAuthUser: UseAuthUser = () => {
  // Some dependencies are optional. Throw if they aren't installed
  // when calling this API.
  // https://github.com/gladly-team/next-firebase-auth/issues/502
  try {
    // eslint-disable-next-line global-require
    require('react')
  } catch (e) {
    throw new Error(
      'The dependency "react" is required when calling `useAuthUser`.'
    )
  }
  const useAuthUserModule = require('src/useAuthUser').default
  return useAuthUserModule()
}

export { verifyIdToken } from 'src/firebaseAdmin'

export const withAuthUser: WithAuthUser = (options) => {
  // Require rather than import the module to support optional
  // peer dependencies. See:
  // https://github.com/gladly-team/next-firebase-auth/issues/502
  const withAuthUserModule = require('src/withAuthUser').default
  return withAuthUserModule(options)
}

export const withAuthUserSSR: WithAuthUserSSR = (
  options?: WithAuthUserSSROptions
) => {
  const withAuthUserTokenSSRModule = require('src/withAuthUserTokenSSR').default
  return withAuthUserTokenSSRModule(options, { useToken: false })
}

export const withAuthUserTokenSSR: WithAuthUserSSR = (
  options?: WithAuthUserSSROptions
) => {
  const withAuthUserTokenSSRModule = require('src/withAuthUserTokenSSR').default
  return withAuthUserTokenSSRModule(options, { useToken: true })
}
