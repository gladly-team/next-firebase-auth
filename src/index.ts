/* eslint-disable global-require */
import withAuthUserModule from 'src/withAuthUser'
import useAuthUserModule from 'src/useAuthUser'
import initFirebaseClientSDK from 'src/initFirebaseClientSDK'
import isClientSide from 'src/isClientSide'
import initCommon from 'src/initCommon'
import { ConfigInput } from './configTypes'

// enum: AuthAction
export * from 'src/AuthAction'

export const init = (config: ConfigInput) => {
  initCommon(config)

  // On the client side, initialize the Firebase JS SDK.
  if (isClientSide()) {
    initFirebaseClientSDK()
  }
}

export const getUserFromCookies = () => {
  throw new Error('"getUserFromCookies" can only be called server-side.')
}

export const setAuthCookies = () => {
  throw new Error('"setAuthCookies" can only be called server-side.')
}

export const unsetAuthCookies = () => {
  throw new Error('"unsetAuthCookies" can only be called server-side.')
}

export const useAuthUser = useAuthUserModule

export const verifyIdToken = () => {
  throw new Error('"verifyIdToken" can only be called server-side.')
}

export const withAuthUser = withAuthUserModule

export const withAuthUserSSR = () => {
  throw new Error('"withAuthUserSSR" can only be called server-side.')
}

export const withAuthUserTokenSSR = () => {
  throw new Error('"withAuthUserTokenSSR" can only be called server-side.')
}
