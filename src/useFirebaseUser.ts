import { useEffect, useState } from 'react'
import { getApp } from 'firebase/app'
import {
  User as FirebaseUser,
  getAuth,
  getIdTokenResult,
  onIdTokenChanged,
} from 'firebase/auth'
import { getConfig } from 'src/config'
import createUser, { User } from 'src/createUser'
import { Claims, filterStandardClaims } from 'src/claims'
import logDebug from 'src/logDebug'

const defaultTokenChangedHandler = async (user: User) => {
  const {
    loginAPIEndpoint,
    logoutAPIEndpoint,
    onLoginRequestError,
    onLogoutRequestError,
  } = getConfig()
  let response
  // If the user is authed, call login to set a cookie.
  if (user.id) {
    // Prefixing with "[withUser]" because that's currently the only
    // place we use this logic.
    logDebug('[withUser] Calling the login endpoint.')
    const userToken = await user.getIdToken()
    if (!loginAPIEndpoint) {
      throw new Error('Invalid config.')
    }
    try {
      response = await fetch(loginAPIEndpoint, {
        method: 'POST',
        headers: {
          Authorization: userToken || undefined,
        } as HeadersInit,
        credentials: 'include',
      })
      if (!response.ok) {
        const responseJSON = await response.json()
        logDebug(
          `[withUser] The call to the login endpoint failed with status ${
            response.status
          } and response: ${JSON.stringify(responseJSON)}`
        )

        // If the developer provided a handler for login errors,
        // call it and don't throw.
        // https://github.com/gladly-team/next-firebase-auth/issues/367
        throw new Error(
          `Received ${
            response.status
          } response from login API endpoint: ${JSON.stringify(responseJSON)}`
        )
      }
    } catch (err) {
      if (onLoginRequestError && err instanceof Error) {
        await onLoginRequestError(err)
      } else {
        throw err
      }
    }
  } else {
    // If the user is not authed, call logout to unset the cookie.
    logDebug('[withUser] Calling the logout endpoint.')
    if (!logoutAPIEndpoint) {
      throw new Error('Invalid config.')
    }
    try {
      response = await fetch(logoutAPIEndpoint, {
        method: 'POST',
        credentials: 'include',
      })
      if (!response.ok) {
        const responseJSON = await response.json()
        logDebug(
          `[withUser] The call to the logout endpoint failed with status ${
            response.status
          } and response: ${JSON.stringify(responseJSON)}`
        )

        // If the developer provided a handler for logout errors,
        // call it and don't throw.
        // https://github.com/gladly-team/next-firebase-auth/issues/367
        throw new Error(
          `Received ${
            response.status
          } response from logout API endpoint: ${JSON.stringify(responseJSON)}`
        )
      }
    } catch (err) {
      if (onLogoutRequestError && err instanceof Error) {
        await onLogoutRequestError(err)
      } else {
        throw err
      }
    }
  }
  return response
}

const setAuthCookie = async (firebaseUser?: FirebaseUser) => {
  const { tokenChangedHandler } = getConfig()

  const user = createUser({
    firebaseUserClientSDK: firebaseUser,
    clientInitialized: true,
  })

  if (tokenChangedHandler) {
    logDebug(
      `[withUser] Calling the custom "tokenChangedHandler" provided in the config.`
    )
    return tokenChangedHandler(user)
  }

  return defaultTokenChangedHandler(user)
}

const useFirebaseUser = () => {
  const [userInfo, setUserInfo] = useState<{
    user: FirebaseUser | null
    claims?: Claims
    initialized: boolean
  }>({
    user: null, // unmodified Firebase user, undefined if not authed
    claims: {},
    initialized: false,
  })
  const [isAuthCookieRequestComplete, setIsAuthCookieRequestComplete] =
    useState(false)

  useEffect(() => {
    let isCancelled = false

    const onIdTokenChange = async (firebaseUser: FirebaseUser | null) => {
      // Prefixing with "[withUser]" because that's currently the only
      // place we use this hook.
      logDebug(
        '[withUser] The Firebase ID token changed. New Firebase user:',
        firebaseUser
      )

      setIsAuthCookieRequestComplete(false)
      let customClaims = {}
      if (firebaseUser) {
        // Get the user's claims:
        // https://firebase.google.com/docs/reference/js/firebase.auth.IDTokenResult
        const idTokenResult = await getIdTokenResult(firebaseUser)
        customClaims = filterStandardClaims(idTokenResult.claims)
      }

      setUserInfo({
        user: firebaseUser,
        claims: customClaims,
        initialized: true,
      })

      await setAuthCookie(firebaseUser || undefined)

      // Cancel state updates if the component has unmounted. We could abort
      // fetches, but that would not currently support any async logic in the
      // user-defined "tokenChangedHandler" option.
      // https://developers.google.com/web/updates/2017/09/abortable-fetch
      // If we were to do the above, we might optionally have
      // "tokenChangedHandler" return an unsubscribe function.
      if (!isCancelled) {
        setIsAuthCookieRequestComplete(true)
        logDebug('[withUser] Completed the auth API request.')
      } else {
        logDebug(
          '[withUser] Component unmounted before completing the auth API request.'
        )
      }
    }

    // https://firebase.google.com/docs/reference/js/firebase.auth.Auth#onidtokenchanged
    const unsubscribe = onIdTokenChanged(getAuth(getApp()), onIdTokenChange)
    return () => {
      unsubscribe()
      isCancelled = true
    }
  }, [])

  return {
    ...userInfo,
    authRequestCompleted: isAuthCookieRequestComplete,
  }
}

export default useFirebaseUser
