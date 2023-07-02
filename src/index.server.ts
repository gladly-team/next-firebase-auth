// FIXME: remove "any" types

/* eslint-disable global-require, @typescript-eslint/no-var-requires */

import initCommon from 'src/initCommon'
import AuthAction from 'src/AuthAction'

// These are exclusively for server-side use.
import setAuthCookies from 'src/setAuthCookies'
import unsetAuthCookies from 'src/unsetAuthCookies'
import { verifyIdToken } from 'src/firebaseAdmin'
import getUserFromCookies from 'src/getUserFromCookies'
import { ConfigInput } from './configTypes'

const init = (config: ConfigInput) => {
  initCommon(config)

  // We only initialize the Firebase admin SDK as it's needed. See:
  // https://github.com/gladly-team/next-firebase-auth/issues/70
}

const withAuthUser = (...args: any) => {
  // Require rather than import the module to support optional
  // peer dependencies. See:
  // https://github.com/gladly-team/next-firebase-auth/issues/502
  const withAuthUserModule = require('src/withAuthUser').default
  return withAuthUserModule(...args)
}

const useAuthUser = (...args: any) => {
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
  return useAuthUserModule(...args)
}

const withAuthUserSSR = (options: any) => {
  const withAuthUserTokenSSRModule = require('src/withAuthUserTokenSSR').default
  return withAuthUserTokenSSRModule(options, { useToken: false })
}

const withAuthUserTokenSSR = (options: any) => {
  const withAuthUserTokenSSRModule = require('src/withAuthUserTokenSSR').default
  return withAuthUserTokenSSRModule(options, { useToken: true })
}

export default {
  init,
  withAuthUser,
  useAuthUser,
  withAuthUserSSR,
  withAuthUserTokenSSR,
  setAuthCookies,
  unsetAuthCookies,
  verifyIdToken,
  AuthAction,
  getUserFromCookies,
}
