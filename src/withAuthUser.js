import React, { useEffect, useCallback } from 'react'
import { useRouter } from 'next/router'
import { AuthUserContext } from 'src/useAuthUser'
import createAuthUser from 'src/createAuthUser'
import useFirebaseUser from 'src/useFirebaseUser'
import { getConfig } from 'src/config'
import AuthStrategy from 'src/AuthStrategy'
import isClientSide from 'src/isClientSide'

/**
 * A higher-order component that provides pages with the
 * AuthUser and, optionally, redirects or renders different
 * children based on the user's current auth state.
 * To access the user from SSR, this should be paired with
 * `withAuthUserSSR` or `withAuthUserTokenSSR`.
 * @param {String} whenAuthed - The behavior to take if the user
 *   *is* authenticated. One of AuthStrategy.RENDER or
 *   AuthStrategy.REDIRECT_TO_APP.
 * @param {String} whenUnauthedBeforeInit - The behavior to take
 *   if the user is not authenticated but the Firebase client JS
 *   SDK has not initialized. One of: AuthStrategy.RENDER,
 *   AuthStrategy.REDIRECT_TO_LOGIN, AuthStrategy.SHOW_LOADER,
 *   AuthStrategy.RETURN_NULL. Defaults to AuthStrategy.RENDER.
 * @param {String} whenUnauthedAfterInit - The behavior to take
 *   if the user is not authenticated and the Firebase client JS
 *   SDK has already initialized. One of: AuthStrategy.RENDER,
 *   AuthStrategy.REDIRECT_TO_LOGIN. Defaults to
 *   AuthStrategy.RENDER
 * @param {String} appPageURL - The redirect destination URL when
 *   we redirect to the app.
 * @param {String} authPageURL - The redirect destination URL when
 *   we redirect to the login page.
 * @return {Function} A function that takes a child component
 */
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
