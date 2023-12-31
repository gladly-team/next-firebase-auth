import { FirebaseApp, getApp, initializeApp } from 'firebase/app'
import { getAuth, connectAuthEmulator } from 'firebase/auth'
import { getConfig } from 'src/config'
import logDebug from 'src/logDebug'

export default function initFirebaseClientSDK() {
  const { firebaseClientInitConfig, firebaseAuthEmulatorHost, tenantId } =
    getConfig()
  try {
    if (!firebaseClientInitConfig) {
      throw new Error(
        'If not initializing the Firebase JS SDK elsewhere, you must provide "firebaseClientInitConfig" to next-firebase-auth.'
      )
    }

    initializeApp(firebaseClientInitConfig)
    if (tenantId) {
      getAuth().tenantId = tenantId
    }
    logDebug('[init] Initialized the Firebase JS SDK.')
  } catch (e) {
    logDebug('[init] Failed to initialize the Firebase JS SDK', e)
  }

  const app = getApp()

  // If the user has provided the firebaseAuthEmulatorHost address, set the emulator
  if (firebaseAuthEmulatorHost) {
    connectAuthEmulator(getAuth(app), `http://${firebaseAuthEmulatorHost}`)
  }
  const auth = getAuth(app)
  return { app, auth }
}
