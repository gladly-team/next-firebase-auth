/* eslint-disable global-require */
import { setConfig } from 'src/config'
import withAuthUserModule from 'src/withAuthUser'
import useAuthUserModule from 'src/useAuthUser'
import initFirebaseClientSDK from 'src/initFirebaseClientSDK'
import { setDebugEnabled } from 'src/logDebug'
import isClientSide from 'src/isClientSide'
import AuthAction from 'src/AuthAction'

const init = (config = {}) => {
  setDebugEnabled(config.debug === true)

  setConfig(config)

  // On the client side, initialize the Firebase JS SDK.
  if (isClientSide()) {
    initFirebaseClientSDK()
  }
}

const withAuthUser = withAuthUserModule

const useAuthUser = useAuthUserModule

const withAuthUserSSR = () => {
  throw new Error('"withAuthUserSSR" can only be called server-side.')
}

const withAuthUserTokenSSR = () => {
  throw new Error('"withAuthUserTokenSSR" can only be called server-side.')
}

const setAuthCookies = () => {
  throw new Error('"setAuthCookies" can only be called server-side.')
}

const unsetAuthCookies = () => {
  throw new Error('"unsetAuthCookies" can only be called server-side.')
}

const verifyIdToken = () => {
  throw new Error('"verifyIdToken" can only be called server-side.')
}

const getFirebaseAdmin = () => {
  throw new Error('"getFirebaseAdmin" can only be called server-side.')
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
  getFirebaseAdmin,
}
