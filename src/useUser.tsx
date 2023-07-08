import { createContext, useContext } from 'react'
import { AuthUser } from './createUser'

type AuthUserContext =
  | (AuthUser & {
      serialize: (opts?: { includeToken?: boolean }) => string
    })
  | undefined

// Default to undefined. `userUser` will throw if the value is undefined
// to ensure the developer wraps pages in `withUser`. See:
// https://github.com/gladly-team/next-firebase-auth/issues/155
export const AuthUserContext = createContext<AuthUserContext>(undefined)

export type UseAuthUser = () => AuthUser

const userUser: UseAuthUser = () => {
  const authUser = useContext<AuthUserContext>(AuthUserContext)
  if (!authUser) {
    throw new Error(
      'When using `userUser`, the page must be wrapped in `withUser`.'
    )
  }
  return authUser
}

export default userUser
