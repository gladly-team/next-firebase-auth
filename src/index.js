import { setConfig } from 'src/config'
import withAuthUserModule from 'src/withAuthUser'
import useAuthUserModule from 'src/useAuthUser'
import withAuthUserTokenSSRModule from 'src/withAuthUserTokenSSR'
import setAuthCookiesModule from 'src/setAuthCookies'
import unsetAuthCookiesModule from 'src/unsetAuthCookies'

export const init = (config) => {
  setConfig(config)
}

export const withAuthUser = withAuthUserModule

export const useAuthUser = useAuthUserModule

// TODO
export const withAuthUserSSR = () => {}

export const withAuthUserTokenSSR = withAuthUserTokenSSRModule

export const setAuthCookies = setAuthCookiesModule

export const unsetAuthCookies = unsetAuthCookiesModule
