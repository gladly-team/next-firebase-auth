import firebase from 'firebase/app'
import 'firebase/auth'
import { getConfig } from 'src/config'

export default function initFirebaseClientSDK() {
  if (!firebase.apps.length) {
    const { firebaseClientInitConfig } = getConfig()
    if (!firebaseClientInitConfig) {
      throw new Error(
        'If not initializing the Firebase JS SDK elsewhere, you must pass the "firebaseClientInitConfig" to next-firebase-auth.'
      )
    }
    firebase.initializeApp(firebaseClientInitConfig)
  }
}
