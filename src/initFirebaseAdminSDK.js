import * as admin from 'firebase-admin'
import { getConfig } from 'src/config'

const initFirebaseAdminSDK = () => {
  if (!admin.apps.length) {
    const { firebaseAdminInitConfig, firebaseAdminDefaultCredential } =
      getConfig()
    if (!firebaseAdminInitConfig && !firebaseAdminDefaultCredential) {
      throw new Error(
        'If not initializing the Firebase admin SDK elsewhere, you must provide "firebaseAdminInitConfig" to next-firebase-auth.'
      )
    }
    admin.initializeApp({
      ...firebaseAdminInitConfig,
      credential: firebaseAdminDefaultCredential
        ? admin.credential.applicationDefault()
        : admin.credential.cert({
            ...firebaseAdminInitConfig.credential,
          }),
    })
  }
  return admin
}

export default initFirebaseAdminSDK
