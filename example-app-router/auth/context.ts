"use client"

import { createContext, useContext } from "react"
import type { UserInfo } from "firebase/auth"


export interface AuthContextValue {
  user: UserInfo | null
}

export const AuthContext = createContext<AuthContextValue>({
  user: null,
})

export const useAuth = () => useContext(AuthContext)
