import { useEffect, useState } from 'react'
import firebase from 'firebase/app'
import 'firebase/auth'
import { getConfig } from 'src/config'
import createAuthUser from 'src/createAuthUser'
import { filterStandardClaims } from 'src/claims'

const defaultTokenChangedHandler = async (authUser, userToken) => {
  const { loginAPIEndpoint, logoutAPIEndpoint } = getConfig()
  let response
  // If the user is authed, call login to set a cookie.
  if (authUser.id) {
    response = await fetch(loginAPIEndpoint, {
      method: 'POST',
      headers: {
        Authorization: userToken,
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

const setAuthCookie = async (firebaseUser, userToken) => {
  const { tokenChangedHandler } = getConfig()

  const authUser = createAuthUser({
    firebaseUserClientSDK: firebaseUser,
    clientInitialized: true,
  })

  if (tokenChangedHandler) {
    return tokenChangedHandler(authUser, userToken)
  }

  return defaultTokenChangedHandler(authUser, userToken)
}

const useFirebaseUser = () => {
  const [user, setUser] = useState()
  const [initialized, setInitialized] = useState(false)

  async function onIdTokenChange(firebaseUser) {
    let idTokenResult = { claims: {}, token: undefined }
    if (firebaseUser) {
      // Fetch the currentusers idTokenResult which contains both the idToken and the claims
      // https://firebase.google.com/docs/reference/js/firebase.auth.IDTokenResult
      idTokenResult = await firebase.auth().currentUser.getIdTokenResult()
    }
    const firebaseUserWithClaims = {
      ...firebaseUser,
      claims: filterStandardClaims(idTokenResult.claims),
    }

    setUser(firebaseUserWithClaims)
    setInitialized(true)
    // pass the idToken to the setAuthCookie function
    await setAuthCookie(firebaseUserWithClaims, idTokenResult.token)
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
