import { useEffect, useState } from 'react'
import firebase from 'firebase/app'
import 'firebase/auth'
import { getConfig } from 'src/config'
import createAuthUser from 'src/createAuthUser'
import { filterStandardClaims } from 'src/claims'

const defaultTokenChangedHandler = async (authUser) => {
  const { loginAPIEndpoint, logoutAPIEndpoint } = getConfig()
  let response
  // If the user is authed, call login to set a cookie.
  if (authUser.id) {
    const authToken = await authUser.getIdToken()
    response = await fetch(loginAPIEndpoint, {
      method: 'POST',
      headers: {
        Authorization: authToken,
      },
      credentials: 'include',
    })
    if (!response.ok) {
      const responseJSON = await response.json()
      throw new Error(
        `Received ${
          response.status
        } response from login API endpoint: ${JSON.stringify(responseJSON)}`
      )
    }
  } else {
    // If the user is not authed, call logout to unset the cookie.
    response = await fetch(logoutAPIEndpoint, {
      method: 'POST',
      credentials: 'include',
    })
    if (!response.ok) {
      const responseJSON = await response.json()
      throw new Error(
        `Received ${
          response.status
        } response from logout API endpoint: ${JSON.stringify(responseJSON)}`
      )
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
    return tokenChangedHandler(authUser)
  }

  return defaultTokenChangedHandler(authUser)
}

const useFirebaseUser = () => {
  const [user, setUser] = useState()
  const [initialized, setInitialized] = useState(false)

  async function onIdTokenChange(firebaseUser) {
    let idTokenResult = { claims: {} }
    if (firebaseUser) {
      // Fetch the currentusers idTokenResult which contains both the idToken and the claims
      // https://firebase.google.com/docs/reference/js/firebase.auth.IDTokenResult
      idTokenResult = await firebase.auth().currentUser.getIdTokenResult()
    }
    const firebaseUserWithClaims = {
      ...firebaseUser,
      claims: idTokenResult ? filterStandardClaims(idTokenResult.claims) : {},
    }

    setUser(firebaseUserWithClaims)
    setInitialized(true)
    // pass the idToken to the setAuthCookie function
    await setAuthCookie(firebaseUserWithClaims)
  }

  useEffect(() => {
    // https://firebase.google.com/docs/reference/js/firebase.auth.Auth#onidtokenchanged
    const unsubscribe = firebase.auth().onIdTokenChanged(onIdTokenChange)
    return () => unsubscribe()
  }, [])

  return {
    user,
    initialized,
  }
}

export default useFirebaseUser
