import { useEffect, useState } from 'react'
import { getApp } from 'firebase/app'
import { getAuth, getIdTokenResult, onIdTokenChanged } from 'firebase/auth'
import { getConfig } from 'src/config'
import createAuthUser from 'src/createAuthUser'
import { filterStandardClaims } from 'src/claims'
import logDebug from 'src/logDebug'

const defaultTokenChangedHandler = async (authUser) => {
  const {
    loginAPIEndpoint,
    logoutAPIEndpoint,
    onLoginRequestError,
    onLogoutRequestError,
  } = getConfig()
  let response
  // If the user is authed, call login to set a cookie.
  if (authUser.id) {
    // Prefixing with "[withAuthUser]" because that's currently the only
    // place we use this logic.
    logDebug('[withAuthUser] Calling the login endpoint.')
    const userToken = await authUser.getIdToken()
    response = await fetch(loginAPIEndpoint, {
      method: 'POST',
      headers: {
        Authorization: userToken,
      },
      credentials: 'include',
    })
    if (!response.ok) {
      const responseJSON = await response.json()
      logDebug(
        `[withAuthUser] The call to the login endpoint failed with status ${
          response.status
        } and response: ${JSON.stringify(responseJSON)}`
      )

      // If the developer provided a handler for login errors,
      // call it and don't throw.
      // https://github.com/gladly-team/next-firebase-auth/issues/367
      const err = new Error(
        `Received ${
          response.status
        } response from login API endpoint: ${JSON.stringify(responseJSON)}`
      )
      if (onLoginRequestError) {
        await onLoginRequestError(err)
      } else {
        throw err
      }
    }
  } else {
    // If the user is not authed, call logout to unset the cookie.
    logDebug('[withAuthUser] Calling the logout endpoint.')
    response = await fetch(logoutAPIEndpoint, {
      method: 'POST',
      credentials: 'include',
    })
    if (!response.ok) {
      const responseJSON = await response.json()
      logDebug(
        `[withAuthUser] The call to the logout endpoint failed with status ${
          response.status
        } and response: ${JSON.stringify(responseJSON)}`
      )

      // If the developer provided a handler for logout errors,
      // call it and don't throw.
      // https://github.com/gladly-team/next-firebase-auth/issues/367
      const err = new Error(
        `Received ${
          response.status
        } response from logout API endpoint: ${JSON.stringify(responseJSON)}`
      )
      if (onLogoutRequestError) {
        await onLogoutRequestError(err)
      } else {
        throw err
      }
    }
  }
  return response
}

const setAuthCookie = async (firebaseUser) => {
  const { tokenChangedHandler } = getConfig()

  const authUser = createAuthUser({
    firebaseUserClientSDK: firebaseUser,
    clientInitialized: true,
  })

  if (tokenChangedHandler) {
    logDebug(
      `[withAuthUser] Calling the custom "tokenChangedHandler" provided in the config.`
    )
    return tokenChangedHandler(authUser)
  }

  return defaultTokenChangedHandler(authUser)
}

const useFirebaseUser = () => {
  const [userInfo, setUserInfo] = useState({
    user: undefined, // unmodified Firebase user, undefined if not authed
    claims: {},
    initialized: false,
  })
  const [isAuthCookieRequestComplete, setIsAuthCookieRequestComplete] =
    useState(false)

  useEffect(() => {
    let isCancelled = false

    const onIdTokenChange = async (firebaseUser) => {
      // Prefixing with "[withAuthUser]" because that's currently the only
      // place we use this hook.
      logDebug(
        '[withAuthUser] The Firebase ID token changed. New Firebase user:',
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

      await setAuthCookie(firebaseUser)

      // Cancel state updates if the component has unmounted. We could abort
      // fetches, but that would not currently support any async logic in the
      // user-defined "tokenChangedHandler" option.
      // https://developers.google.com/web/updates/2017/09/abortable-fetch
      // If we were to do the above, we might optionally have
      // "tokenChangedHandler" return an unsubscribe function.
      if (!isCancelled) {
        setIsAuthCookieRequestComplete(true)
        logDebug('[withAuthUser] Completed the auth API request.')
      } else {
        logDebug(
          '[withAuthUser] Component unmounted before completing the auth API request.'
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
