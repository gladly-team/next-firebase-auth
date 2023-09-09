import { getApp } from "firebase/app"
import { getAuth } from "firebase/auth"
import initFirebase from "./initFirebase"
import { useCallback } from "react"

const useFirebaseAuth = () => {
  const getFirebaseAuth = useCallback(() => {
    initFirebase()
    const auth = getAuth(getApp())
    return auth
  }, [])

  return { getFirebaseAuth }
}

export default useFirebaseAuth
