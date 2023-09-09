import { useCallback } from "react"
import getFirebaseAuth from "./getFirebaseAuth"

const useFirebaseAuth = () => {
  const getFirebaseAuthMemoized = useCallback(() => getFirebaseAuth(), [])
  return { getFirebaseAuth: getFirebaseAuthMemoized }
}

export default useFirebaseAuth
