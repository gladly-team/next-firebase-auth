import { createContext, useContext } from 'react'
import { AuthUser } from './createUser'

type UserContext =
  | (AuthUser & {
      serialize: (opts?: { includeToken?: boolean }) => string
    })
  | undefined

// Default to undefined. `useUser` will throw if the value is undefined
// to ensure the developer wraps pages in `withUser`. See:
// https://github.com/gladly-team/next-firebase-auth/issues/155
export const UserContext = createContext<UserContext>(undefined)

export type UseAuthUser = () => AuthUser

const useUser: UseAuthUser = () => {
  const authUser = useContext<UserContext>(UserContext)
  if (!authUser) {
    throw new Error(
      'When using `useUser`, the page must be wrapped in `withUser`.'
    )
  }
  return authUser
}

export default useUser
