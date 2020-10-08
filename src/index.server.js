/* eslint-disable global-require */
import index from 'src/index'

// These are exclusively for server-side use.
import setAuthCookies from 'src/setAuthCookies'
import unsetAuthCookies from 'src/unsetAuthCookies'
import withAuthUserTokenSSR from 'src/withAuthUserTokenSSR'
import initFirebaseAdminSDK from 'src/initFirebaseAdminSDK'

const initServer = (config) => {
  const clientInit = index.init(config)

  // On the server only, initialize the Firebase admin SDK.
  initFirebaseAdminSDK()

  return clientInit
}

export default {
  ...index,
  init: initServer,
  // withAuthUserSSR // TODO
  withAuthUserTokenSSR,
  setAuthCookies,
  unsetAuthCookies,
}
