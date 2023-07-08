import { createContext, useContext } from 'react'
import { User } from './createUser'

type UserContext =
  | (User & {
      serialize: (opts?: { includeToken?: boolean }) => string
    })
  | undefined

// Default to undefined. `useUser` will throw if the value is undefined
// to ensure the developer wraps pages in `withUser`. See:
// https://github.com/gladly-team/next-firebase-auth/issues/155
export const UserContext = createContext<UserContext>(undefined)

export type UseUser = () => User

const useUser: UseUser = () => {
  const user = useContext<UserContext>(UserContext)
  if (!user) {
    throw new Error(
      'When using `useUser`, the page must be wrapped in `withUser`.'
    )
  }
  return user
}

export default useUser
