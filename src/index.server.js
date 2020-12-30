/* eslint-disable global-require */
import index from 'src/index'

// These are exclusively for server-side use.
import setAuthCookies from 'src/setAuthCookies'
import unsetAuthCookies from 'src/unsetAuthCookies'
import withAuthUserTokenSSRModule from 'src/withAuthUserTokenSSR'
import initFirebaseAdminSDK from 'src/initFirebaseAdminSDK'
import { verifyIdToken } from 'src/firebaseAdmin'

const initServer = (config) => {
  const clientInit = index.init(config)

  // On the server only, initialize the Firebase admin SDK.
  initFirebaseAdminSDK()

  return clientInit
}

const withAuthUserTokenSSR = (options) =>
  withAuthUserTokenSSRModule(options, { useToken: true })

const withAuthUserSSR = (options) =>
  withAuthUserTokenSSRModule(options, { useToken: false })

export default {
  ...index,
  init: initServer,
  withAuthUserSSR,
  withAuthUserTokenSSR,
  setAuthCookies,
  unsetAuthCookies,
  verifyIdToken,
}
