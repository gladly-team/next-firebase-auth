import { useEffect, useState } from 'react'
import firebase from 'firebase/app'
import 'firebase/auth'
import { getConfig } from 'src/config'

const setAuthCookie = async (firebaseUser) => {
  let response
  const { loginAPIEndpoint, logoutAPIEndpoint } = getConfig()

  // If the user is authed, call login to set a cookie.
  if (firebaseUser) {
    const userToken = await firebaseUser.getIdToken()
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

const useFirebaseUser = () => {
  const [user, setUser] = useState()
  const [initialized, setInitialized] = useState(false)

  async function onIdTokenChange(firebaseUser) {
    setUser(firebaseUser)
    setInitialized(true)
    await setAuthCookie(firebaseUser)
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
