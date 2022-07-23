/* eslint-disable global-require */

// TODO: don't import here
import index from 'src/index'
import initCommon from 'src/initCommon'
import AuthAction from 'src/AuthAction'

// These are exclusively for server-side use.
import setAuthCookies from 'src/setAuthCookies'
import unsetAuthCookies from 'src/unsetAuthCookies'
import withAuthUserTokenSSRModule from 'src/withAuthUserTokenSSR'
import { verifyIdToken } from 'src/firebaseAdmin'

import initFirebaseAdminSDK from 'src/initFirebaseAdminSDK'

const initServer = (config) => {
  initCommon(config)

  // We only initialize the Firebase admin SDK as it's needed. See:
  // https://github.com/gladly-team/next-firebase-auth/issues/70
}

const withAuthUserTokenSSR = (options) =>
  withAuthUserTokenSSRModule(options, { useToken: true })

const withAuthUserSSR = (options) =>
  withAuthUserTokenSSRModule(options, { useToken: false })

const getFirebaseAdmin = () => initFirebaseAdminSDK()

// TODO: support optional dependencies in these modules:
// withAuthUser
// useAuthUser

export default {
  ...index,
  init: initServer,
  withAuthUserSSR,
  withAuthUserTokenSSR,
  setAuthCookies,
  unsetAuthCookies,
  verifyIdToken,
  AuthAction,
  getFirebaseAdmin,
}
