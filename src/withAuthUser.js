import React, { useEffect, useCallback } from 'react'
import { useRouter } from 'next/router'
import { AuthUserContext } from 'src/useAuthUser'
import createAuthUser from 'src/createAuthUser'
import useFirebaseUser from 'src/useFirebaseUser'
import { getConfig } from 'src/config'
import AuthStrategy from 'src/AuthStrategy'
import isClientSide from 'src/isClientSide'

// A higher-order component to provide pages with the
// authenticated user. This must be used if using `useAuthUser`.
// To access the user during SSR, this should be paired with
// `withAuthServerSideProps`.
const withAuthUser = ({
  whenAuthed = AuthStrategy.RENDER,
  whenUnauthedBeforeInit = AuthStrategy.RENDER,
  whenUnauthedAfterInit = AuthStrategy.RENDER,
  appPageURL = getConfig().appPageURL,
  authPageURL = getConfig().authPageURL,
} = {}) => (ChildComponent) => {
  const WithAuthUserHOC = (props) => {
    const { AuthUserSerialized, ...otherProps } = props
    const AuthUserFromServer = createAuthUser({
      serializedAuthUser: AuthUserSerialized,
    })

    const {
      user: firebaseUser,
      initialized: firebaseInitialized,
    } = useFirebaseUser()
    const AuthUserFromClient = createAuthUser({
      firebaseUserClientSDK: firebaseUser,
      clientInitialized: firebaseInitialized,
    })

    // Set the AuthUser to values from the Firebase JS SDK user
    // once it has initialized. On the server side and before the
    // client-side SDK has initialized, use the AuthUser from the
    // session.
    const AuthUser = firebaseInitialized
      ? AuthUserFromClient
      : AuthUserFromServer

    const isAuthed = !!AuthUser.id
    const isInitialized = AuthUser.clientInitialized

    // Redirect to the app if the user is authed and the "whenAuthed"
    // argument is set to redirect to the app.
    const shouldRedirectToApp =
      isAuthed && whenAuthed === AuthStrategy.REDIRECT_TO_APP

    // Redirect to the login page if the user is not authed and,
    // considering whether the Firebase JS SDK is initialized, the
    // "when unauthed" settings inform us to redirect.
    const shouldRedirectToLogin =
      !isAuthed &&
      ((!isInitialized &&
        whenUnauthedBeforeInit === AuthStrategy.REDIRECT_TO_LOGIN) ||
        (isInitialized &&
          whenUnauthedAfterInit === AuthStrategy.REDIRECT_TO_LOGIN))

    const router = useRouter()
    const redirectToApp = useCallback(() => {
      if (!appPageURL) {
        throw new Error(
          'The "appPageURL" config setting must be set when using `REDIRECT_TO_APP`.'
        )
      }
      router.push(appPageURL)
    }, [router])
    const redirectToLogin = useCallback(() => {
      if (!authPageURL) {
        throw new Error(
          'The "authPageURL" config setting must be set when using `REDIRECT_TO_LOGIN`.'
        )
      }
      router.push(authPageURL)
    }, [router])

    useEffect(() => {
      // Only redirect on the client side. To redirect server-side,
      // use `withAuthUserSSR` or `withAuthUserTokenSSR`.
      if (!isClientSide()) {
        return
      }
      if (shouldRedirectToApp) {
        redirectToApp()
      } else if (shouldRedirectToLogin) {
        redirectToLogin()
      }
    }, [
      shouldRedirectToApp,
      shouldRedirectToLogin,
      redirectToApp,
      redirectToLogin,
    ])

    // If we are in the process of redirecting, don't render
    // anything.
    const isRedirecting = shouldRedirectToApp || shouldRedirectToLogin
    if (isRedirecting) {
      return null
    }

    // If the user is not authed and the Firebase JS SDK has
    // not yet initialized, optionally show a "loading" component
    // or return null rather than rendering.
    if (!isInitialized && !isAuthed) {
      if (whenUnauthedBeforeInit === AuthStrategy.SHOW_LOADER) {
        // TODO: make customizable
        return <div>Loading...</div>
      }
      if (whenUnauthedBeforeInit === AuthStrategy.RETURN_NULL) {
        return null
      }
    }

    return (
      <AuthUserContext.Provider value={AuthUser}>
        {/* eslint-disable-next-line react/jsx-props-no-spreading */}
        <ChildComponent {...otherProps} />
      </AuthUserContext.Provider>
    )
  }

  WithAuthUserHOC.displayName = 'WithAuthUserHOC'

  return WithAuthUserHOC
}

export default withAuthUser
