import firebase from 'firebase/app'
import 'firebase/auth'
import { getConfig } from 'src/config'

export default function initFirebaseClientSDK() {
  const { firebaseClientInitConfig, firebaseAuthEmulatorHost } = getConfig()
  if (!firebase.apps.length) {
    if (!firebaseClientInitConfig) {
      throw new Error(
        'If not initializing the Firebase JS SDK elsewhere, you must provide "firebaseClientInitConfig" to next-firebase-auth.'
      )
    }
    const { tenantId, ...firebaseConfig } = firebaseClientInitConfig
    firebase.initializeApp(firebaseConfig)

    if (tenantId) {
      firebase.auth().tenantId = tenantId
    }
  }
  // If the user has provided the firebaseAuthEmulatorHost address, set the emulator
  if (firebaseAuthEmulatorHost) {
    firebase.auth().useEmulator(`http://${firebaseAuthEmulatorHost}`)
  }
}
