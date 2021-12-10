// Allow importing firebase-admin as wildcard.
/* eslint-disable no-import-assign */

import * as admin from 'firebase-admin'
import { getConfig } from 'src/config'

const initFirebaseAdminSDK = () => {
  if (!admin.apps.length) {
    const { firebaseAdminInitConfig, useFirebaseAdminDefaultCredential } =
      getConfig()
    if (!firebaseAdminInitConfig && !useFirebaseAdminDefaultCredential) {
      throw new Error(
        'Missing firebase-admin credentials in next-firebase-auth. Set "firebaseAdminInitConfig", "useFirebaseAdminDefaultCredential", or initialize firebase-admin yourself.'
      )
    }
    admin.initializeApp({
      ...firebaseAdminInitConfig,
      credential: useFirebaseAdminDefaultCredential
        ? admin.credential.applicationDefault()
        : admin.credential.cert({
            ...firebaseAdminInitConfig.credential,
          }),
    })
  }
  return admin
}

export default initFirebaseAdminSDK
