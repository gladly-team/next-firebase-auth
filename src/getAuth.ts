import { getApp } from 'firebase/app'
import { Auth, getAuth as getAuthFirebase } from 'firebase/auth'
import initFirebaseClientSDK from './initFirebaseClientSDK'

const getAuth = (): Auth => {
  initFirebaseClientSDK()
  return getAuthFirebase(getApp())
}

export default getAuth
