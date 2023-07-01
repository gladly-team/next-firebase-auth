// Allow importing firebase-admin as wildcard.
/* eslint-disable no-import-assign */

import {
  applicationDefault,
  cert,
  getApps,
  initializeApp,
} from 'firebase-admin/app'
import { getConfig } from 'src/config'
import logDebug from 'src/logDebug'

const initFirebaseAdminSDK = () => {
  const apps = getApps()
  if (!apps.length) {
    const { firebaseAdminInitConfig, useFirebaseAdminDefaultCredential } =
      getConfig()
    if (!firebaseAdminInitConfig && !useFirebaseAdminDefaultCredential) {
      throw new Error(
        'Missing firebase-admin credentials in next-firebase-auth. Set "firebaseAdminInitConfig", "useFirebaseAdminDefaultCredential", or initialize firebase-admin yourself.'
      )
    }
    initializeApp({
      ...firebaseAdminInitConfig,
      credential: useFirebaseAdminDefaultCredential
        ? applicationDefault()
        : cert({
            ...firebaseAdminInitConfig?.credential,
          }),
    })
    logDebug('[init] Initialized the Firebase admin SDK.')
  }
}

export default initFirebaseAdminSDK
