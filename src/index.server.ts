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

export const useUser: UseAuthUser = () => {
  // Some dependencies are optional. Throw if they aren't installed
  // when calling this API.
  // https://github.com/gladly-team/next-firebase-auth/issues/502
  try {
    // eslint-disable-next-line global-require
    require('react')
  } catch (e) {
    throw new Error(
      'The dependency "react" is required when calling `useUser`.'
    )
  }
  const useUserModule = require('src/useAuthUser').default
  return useUserModule()
}

export { verifyIdToken } from 'src/firebaseAdmin'

export const withUser: WithAuthUser = (options) => {
  // Require rather than import the module to support optional
  // peer dependencies. See:
  // https://github.com/gladly-team/next-firebase-auth/issues/502
  const withUserModule = require('src/withAuthUser').default
  return withUserModule(options)
}

export const withUserSSR: WithAuthUserSSR = (
  options?: WithAuthUserSSROptions
) => {
  const withUserTokenSSRModule = require('src/withAuthUserTokenSSR').default
  return withUserTokenSSRModule(options, { useToken: false })
}

export const withUserTokenSSR: WithAuthUserSSR = (
  options?: WithAuthUserSSROptions
) => {
  const withUserTokenSSRModule = require('src/withAuthUserTokenSSR').default
  return withUserTokenSSRModule(options, { useToken: true })
}
