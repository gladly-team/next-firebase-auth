import { useEffect, useState } from 'react'
import firebase from 'firebase/app'
import 'firebase/auth'

// TODO: use config for correct endpoint or other customization
const loginEndpoint = '/api/login-v2'
const logoutEndpoint = '/api/logout-v2'

const setAuthCookie = async (firebaseUser) => {
  // If the user is authed, call login to set a cookie.
  if (firebaseUser) {
    const userToken = await firebaseUser.getIdToken()
    return fetch(loginEndpoint, {
      method: 'POST',
      headers: {
        Authorization: userToken,
      },
      credentials: 'include',
    })
  }

  // If the user is not authed, call logout to unset the cookie.
  return fetch(logoutEndpoint, {
    method: 'POST',
    credentials: 'include',
  })
}

const useFirebaseUser = () => {
  const [user, setUser] = useState()
  const [initialized, setInitialized] = useState(false)

  function onIdTokenChange(firebaseUser) {
    setUser(firebaseUser)
    setInitialized(true)
    setAuthCookie(firebaseUser)
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
