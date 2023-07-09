/* eslint-disable global-require, @typescript-eslint/no-var-requires */

// Shared with client-side init code.
import initCommon from 'src/initCommon'

import type { ConfigInput } from './configTypes'
import type { WithUser } from './withUser'
import type { WithUserSSR, WithUserSSROptions } from './withUserTokenSSR'
import type { UseUser } from './useUser'

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

export const useUser: UseUser = () => {
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
  const useUserModule = require('src/useUser').default
  return useUserModule()
}

export { verifyIdToken } from 'src/firebaseAdmin'

export const withUser: WithUser = (options) => {
  // Require rather than import the module to support optional
  // peer dependencies. See:
  // https://github.com/gladly-team/next-firebase-auth/issues/502
  const withUserModule = require('src/withUser').default
  return withUserModule(options)
}

export const withUserSSR: WithUserSSR = (options?: WithUserSSROptions) => {
  const withUserTokenSSRModule = require('src/withUserTokenSSR').default
  return withUserTokenSSRModule(options, { useToken: false })
}

export const withUserTokenSSR: WithUserSSR = (options?: WithUserSSROptions) => {
  const withUserTokenSSRModule = require('src/withUserTokenSSR').default
  return withUserTokenSSRModule(options, { useToken: true })
}
