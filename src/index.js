/* eslint-disable global-require */
import { setConfig } from 'src/config'
import withAuthUserModule from 'src/withAuthUser'
import useAuthUserModule from 'src/useAuthUser'
import withAuthUserTokenSSRModule from 'src/withAuthUserTokenSSR'

export const init = (config) => {
  setConfig(config)
}

export const withAuthUser = withAuthUserModule

export const useAuthUser = useAuthUserModule

// TODO
export const withAuthUserSSR = () => {}

export const withAuthUserTokenSSR = withAuthUserTokenSSRModule

export const setAuthCookies = async (args) => {
  if (typeof window !== 'undefined') {
    throw new Error('setAuthCookies can only be called server-side.')
  }
  const setAuthCookiesModule = require('src/setAuthCookies').default
  setAuthCookiesModule(...args)
}

export const unsetAuthCookies = async (args) => {
  if (typeof window !== 'undefined') {
    throw new Error('unsetAuthCookies can only be called server-side.')
  }
  const unsetAuthCookiesModule = require('src/unsetAuthCookies').default
  unsetAuthCookiesModule(...args)
}
