import { getApp, getApps, initializeApp } from 'firebase/app'
import { getAuth, connectAuthEmulator } from 'firebase/auth'
import { getConfig } from 'src/config'
import logDebug from 'src/logDebug'

export default function initFirebaseClientSDK() {
  const { firebaseClientInitConfig, firebaseAuthEmulatorHost } = getConfig()
  if (!getApps().length) {
    if (!firebaseClientInitConfig) {
      throw new Error(
        'If not initializing the Firebase JS SDK elsewhere, you must provide "firebaseClientInitConfig" to next-firebase-auth.'
      )
    }
    const { tenantId, ...firebaseConfig } = firebaseClientInitConfig

    initializeApp(firebaseConfig)
    if (tenantId) {
      getAuth().tenantId = tenantId
    }
    logDebug('[init] Initialized the Firebase JS SDK.')
  } else {
    logDebug(
      '[init] Did not initialize the Firebase JS SDK because an app already exists.'
    )
  }
  // If the user has provided the firebaseAuthEmulatorHost address, set the emulator
  if (firebaseAuthEmulatorHost) {
    connectAuthEmulator(getAuth(getApp()), `http://${firebaseAuthEmulatorHost}`)
  }
}
