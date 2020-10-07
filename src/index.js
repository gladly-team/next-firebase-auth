/* eslint-disable global-require */
import { setConfig } from 'src/config'
import withAuthUserModule from 'src/withAuthUser'
import useAuthUserModule from 'src/useAuthUser'
import withAuthUserTokenSSRModule from 'src/withAuthUserTokenSSR'

const init = (config) => {
  setConfig(config)
}

const withAuthUser = withAuthUserModule

const useAuthUser = useAuthUserModule

// TODO
const withAuthUserSSR = () => {}

const withAuthUserTokenSSR = withAuthUserTokenSSRModule

const setAuthCookies = async (args) => {
  if (typeof window !== 'undefined') {
    throw new Error('setAuthCookies can only be called server-side.')
  }
  // const setAuthCookiesModule = require('src/setAuthCookies').default
  // setAuthCookiesModule(...args)
}

const unsetAuthCookies = async (args) => {
  if (typeof window !== 'undefined') {
    throw new Error('unsetAuthCookies can only be called server-side.')
  }
  // const unsetAuthCookiesModule = require('src/unsetAuthCookies').default
  // unsetAuthCookiesModule(...args)
}

export default {
  init,
  withAuthUser,
  useAuthUser,
  withAuthUserSSR,
  withAuthUserTokenSSR,
  setAuthCookies,
  unsetAuthCookies,
}
