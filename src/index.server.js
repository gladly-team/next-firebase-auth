/* eslint-disable global-require */

import withAuthUserModule from 'src/withAuthUser'
import useAuthUserModule from 'src/useAuthUser'
import initCommon from 'src/initCommon'
import AuthAction from 'src/AuthAction'

// These are exclusively for server-side use.
import setAuthCookies from 'src/setAuthCookies'
import unsetAuthCookies from 'src/unsetAuthCookies'
import withAuthUserTokenSSRModule from 'src/withAuthUserTokenSSR'
import { verifyIdToken } from 'src/firebaseAdmin'

import initFirebaseAdminSDK from 'src/initFirebaseAdminSDK'

const init = (config) => {
  initCommon(config)

  // We only initialize the Firebase admin SDK as it's needed. See:
  // https://github.com/gladly-team/next-firebase-auth/issues/70
}

const withAuthUser = withAuthUserModule

// TODO: support optional dependencies
const useAuthUser = useAuthUserModule

// TODO: support optional dependencies
const withAuthUserSSR = (options) =>
  withAuthUserTokenSSRModule(options, { useToken: false })

const withAuthUserTokenSSR = (options) =>
  withAuthUserTokenSSRModule(options, { useToken: true })

const getFirebaseAdmin = () => initFirebaseAdminSDK()

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
