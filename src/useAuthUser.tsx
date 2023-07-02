import { createContext, useContext } from 'react'
import { AuthUser } from './createAuthUser'

type AuthUserContext =
  | (AuthUser & {
      serialize: (opts?: { includeToken?: boolean }) => string
    })
  | undefined

// Default to undefined. `useAuthUser` will throw if the value is undefined
// to ensure the developer wraps pages in `withAuthUser`. See:
// https://github.com/gladly-team/next-firebase-auth/issues/155
export const AuthUserContext = createContext<AuthUserContext>(undefined)

const useAuthUser = () => {
  const authUser = useContext<AuthUserContext>(AuthUserContext)
  if (!authUser) {
    throw new Error(
      'When using `useAuthUser`, the page must be wrapped in `withAuthUser`.'
    )
  }
  return authUser
}

export default useAuthUser
