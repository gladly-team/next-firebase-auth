/* eslint-disable global-require, @typescript-eslint/no-var-requires */

import initCommon from 'src/initCommon'

// These are exclusively for server-side use.
import setAuthCookiesExport from 'src/setAuthCookies'
import unsetAuthCookiesExport from 'src/unsetAuthCookies'
import { verifyIdToken as verifyIdTokenExport } from 'src/firebaseAdmin'
import getUserFromCookiesExport from 'src/getUserFromCookies'
import { ConfigInput } from './configTypes'
import { WithAuthUserOptions } from './withAuthUser'
import { WithAuthUserSSROptions } from './withAuthUserTokenSSR'

// enum: AuthAction
export * from 'src/AuthAction'

export const init = (config: ConfigInput) => {
  initCommon(config)

  // We only initialize the Firebase admin SDK as it's needed. See:
  // https://github.com/gladly-team/next-firebase-auth/issues/70
}

export const getUserFromCookies = getUserFromCookiesExport

export const setAuthCookies = setAuthCookiesExport

export const unsetAuthCookies = unsetAuthCookiesExport

export const useAuthUser = () => {
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

export const verifyIdToken = verifyIdTokenExport

export const withAuthUser = (options: WithAuthUserOptions) => {
  // Require rather than import the module to support optional
  // peer dependencies. See:
  // https://github.com/gladly-team/next-firebase-auth/issues/502
  const withAuthUserModule = require('src/withAuthUser').default
  return withAuthUserModule(options)
}

export const withAuthUserSSR = (options: WithAuthUserSSROptions) => {
  const withAuthUserTokenSSRModule = require('src/withAuthUserTokenSSR').default
  return withAuthUserTokenSSRModule(options, { useToken: false })
}

export const withAuthUserTokenSSR = (options: WithAuthUserSSROptions) => {
  const withAuthUserTokenSSRModule = require('src/withAuthUserTokenSSR').default
  return withAuthUserTokenSSRModule(options, { useToken: true })
}
