// Allow importing firebase-admin as wildcard.
/* eslint-disable no-import-assign */

import * as admin from 'firebase-admin'
import { getConfig } from 'src/config'
import logDebug from 'src/logDebug'

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
    logDebug('Initialized the Firebase admin SDK.')
  } else {
    logDebug(
      'Did not initialize the Firebase admin SDK because an app already exists.'
    )
  }
  return admin
}

export default initFirebaseAdminSDK
