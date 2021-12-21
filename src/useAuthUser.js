import { createContext, useContext } from 'react'

// Default to undefined. `useAuthUser` will throw if the value is undefined
// to ensure the developer wraps pages in `withAuthUser`. See:
// https://github.com/gladly-team/next-firebase-auth/issues/155
export const AuthUserContext = createContext()

const useAuthUser = () => {
  const authUser = useContext(AuthUserContext)
  if (!authUser) {
    throw new Error(
      'When using `useAuthUser`, the page must be wrapped in `withAuthUser`.'
    )
  }
  return authUser
}

export default useAuthUser
