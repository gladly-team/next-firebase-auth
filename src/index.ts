/* eslint-disable global-require */
import initFirebaseClientSDK from 'src/initFirebaseClientSDK'
import isClientSide from 'src/isClientSide'
import initCommon, { Init } from 'src/initCommon'
import type { GetUserFromCookies } from './getUserFromCookies'
import type { SetAuthCookies } from './setAuthCookies'
import type { UnsetAuthCookies } from './unsetAuthCookies'
import type { VerifyIdToken } from './firebaseAdmin'
import type { WithAuthUserSSR } from './withAuthUserTokenSSR'

// AuthAction
export * from 'src/AuthAction'

export const init: Init = (config) => {
  initCommon(config)

  // On the client side, initialize the Firebase JS SDK.
  if (isClientSide()) {
    initFirebaseClientSDK()
  }
}

export const getUserFromCookies: GetUserFromCookies = () => {
  throw new Error('"getUserFromCookies" can only be called server-side.')
}

export const setAuthCookies: SetAuthCookies = () => {
  throw new Error('"setAuthCookies" can only be called server-side.')
}

export const unsetAuthCookies: UnsetAuthCookies = () => {
  throw new Error('"unsetAuthCookies" can only be called server-side.')
}

export { default as useUser } from 'src/useAuthUser'

export const verifyIdToken: VerifyIdToken = () => {
  throw new Error('"verifyIdToken" can only be called server-side.')
}

export { default as withUser } from 'src/withAuthUser'

export const withUserSSR: WithAuthUserSSR = () => {
  throw new Error('"withUserSSR" can only be called server-side.')
}

export const withUserTokenSSR: WithAuthUserSSR = () => {
  throw new Error('"withUserTokenSSR" can only be called server-side.')
}
