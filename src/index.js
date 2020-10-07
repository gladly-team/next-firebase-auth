/* eslint-disable global-require */
import { setConfig } from 'src/config'
import withAuthUserModule from 'src/withAuthUser'
import useAuthUserModule from 'src/useAuthUser'
import withAuthUserTokenSSRModule from 'src/withAuthUserTokenSSR'
import initFirebaseClientSDK from 'src/initFirebaseClientSDK'

const isClientSide = typeof window !== 'undefined'

const init = (config) => {
  setConfig(config)

  // On the client side, initialize the Firebase JS SDK.
  if (isClientSide) {
    initFirebaseClientSDK()
  }
}

const withAuthUser = withAuthUserModule

const useAuthUser = useAuthUserModule

// TODO
const withAuthUserSSR = () => {}

const withAuthUserTokenSSR = withAuthUserTokenSSRModule

const setAuthCookies = () => {
  throw new Error('"setAuthCookies" can only be called server-side.')
}

const unsetAuthCookies = () => {
  throw new Error('"unsetAuthCookies" can only be called server-side.')
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
