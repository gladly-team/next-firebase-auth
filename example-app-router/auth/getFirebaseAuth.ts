import { getAuth } from "firebase/auth"
import initFirebase from "./initFirebase"
import { getApp } from "firebase/app"

export default function getFirebaseAuth() {
  initFirebase()
  const auth = getAuth(getApp())
  return auth
}
