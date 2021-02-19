import * as admin from 'firebase-admin'
import { getConfig } from 'src/config'

const initFirebaseAdminSDK = () => {
  if (!admin.apps.length) {
    const { firebaseAdminInitConfig } = getConfig()
    if (!firebaseAdminInitConfig) {
      throw new Error(
        'If not initializing the Firebase admin SDK elsewhere, you must provide "firebaseAdminInitConfig" to next-firebase-auth.'
      )
    }
    admin.initializeApp({
      ...firebaseAdminInitConfig,
      credential: admin.credential.cert({
        ...firebaseAdminInitConfig.credential,
      }),
    })
  }
  return admin
}

export default initFirebaseAdminSDK
