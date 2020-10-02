import { setConfig } from 'src/config'
import withAuthUserTokenSSRModule from 'src/withAuthUserTokenSSR'
import setAuthCookiesModule from 'src/setAuthCookies'
import unsetAuthCookiesModule from 'src/unsetAuthCookies'

export const init = (config) => {
  setConfig(config)
}

// TODO
export const withAuthUser = () => {}

// TODO
export const useAuthUser = () => {}

// TODO
export const withAuthUserSSR = () => {}

// TODO
export const withAuthUserTokenSSR = withAuthUserTokenSSRModule

// TODO
export const setAuthCookies = setAuthCookiesModule

// TODO
export const unsetAuthCookies = unsetAuthCookiesModule
