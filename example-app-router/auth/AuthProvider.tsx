// Provide the Firebase user to the rest of the app.
'use client'

import { FunctionComponent, ReactNode, useEffect, useState } from "react"
import {
  onIdTokenChanged,
  User as FirebaseUser,
} from "firebase/auth"
import useFirebaseAuth from "./useFirebaseAuth"
import { AuthContext } from "./context"

export interface AuthProviderProps {
  children: ReactNode
}

export const AuthProvider: FunctionComponent<AuthProviderProps> = ({
  children,
}) => {
  const { getFirebaseAuth } = useFirebaseAuth()
  const [user, setUser] = useState<FirebaseUser | null>(null)

  const handleIdTokenChanged = async (firebaseUser: FirebaseUser | null) => {
    if (!firebaseUser) {
      setUser(null)
      return
    }
    setUser(firebaseUser)
  }

  const registerChangeListener = async () => {
    const auth = getFirebaseAuth()
    return onIdTokenChanged(auth, handleIdTokenChanged)
  }

  useEffect(() => {
    const unsubscribePromise = registerChangeListener()
    return () => {
      unsubscribePromise.then((unsubscribe) => unsubscribe())
    }
  }, [])

  return (
    <AuthContext.Provider
      value={{
        user,
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}
