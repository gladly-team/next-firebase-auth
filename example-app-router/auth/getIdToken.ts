import { onIdTokenChanged } from 'firebase/auth'
import getFirebaseAuth from "./getFirebaseAuth";

export default async function getIdToken() {
  return new Promise((resolve, reject) => {
    const auth = getFirebaseAuth()
    const unsubscribe = onIdTokenChanged(auth, (user) => {
      unsubscribe()
      if (user) {
        user.getIdToken().then((idToken) => {
          resolve(idToken)
        }, (error) => {
          resolve(null)
        })
      } else {
        resolve(null)
      }
    })
  }).catch((error) => {
    console.log(error)
  })
}