import firebase from 'firebase/app'
import 'firebase/auth'

// TODO: use user's config
// TODO: throw if not provided and no app already exists
const config = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_PUBLIC_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  databaseURL: process.env.NEXT_PUBLIC_FIREBASE_DATABASE_URL,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
}

export default function initFirebase() {
  if (!firebase.apps.length) {
    firebase.initializeApp(config)
  }
}
