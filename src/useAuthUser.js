import { createContext, useContext } from 'react'
import createAuthUser from 'src/createAuthUser'

// Defaults to empty AuthUser object.
export const AuthUserContext = createContext(createAuthUser())

const useAuthUser = () => useContext(AuthUserContext)

export default useAuthUser
