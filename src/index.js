/* eslint-disable global-require */
import withAuthUserModule from 'src/withAuthUser'
import useAuthUserModule from 'src/useAuthUser'
import initFirebaseClientSDK from 'src/initFirebaseClientSDK'
import isClientSide from 'src/isClientSide'
import AuthAction from 'src/AuthAction'
import initCommon from 'src/initCommon'

const init = (config = {}) => {
  initCommon(config)

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

const getUserFromCookies = () => {
  throw new Error('"getUserFromCookies" can only be called server-side.')
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
