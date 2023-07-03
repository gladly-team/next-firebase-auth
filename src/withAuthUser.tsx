/* eslint-disable block-scoped-var */
/* globals window */
import hoistNonReactStatics from 'hoist-non-react-statics'
import type { ComponentType } from 'react'

import { MODULE_NOT_FOUND } from 'src/constants'
import createAuthUser, {
  AuthUserSerialized as AuthUserSerializedType,
} from 'src/createAuthUser'
import useFirebaseUser from 'src/useFirebaseUser'
import { AuthAction } from 'src/AuthAction'
import isClientSide from 'src/isClientSide'
import logDebug from 'src/logDebug'
import { getAppRedirectInfo, getLoginRedirectInfo } from 'src/redirects'
import { PageURL, RedirectDestination } from './redirectTypes'

export interface WithAuthUserOptions {
  whenAuthed?: AuthAction.RENDER | AuthAction.REDIRECT_TO_APP
  whenAuthedBeforeRedirect?:
    | AuthAction.RENDER
    | AuthAction.SHOW_LOADER
    | AuthAction.RETURN_NULL
  whenUnauthedBeforeInit?:
    | AuthAction.RENDER
    | AuthAction.REDIRECT_TO_LOGIN
    | AuthAction.SHOW_LOADER
    | AuthAction.RETURN_NULL
  whenUnauthedAfterInit?: AuthAction.RENDER | AuthAction.REDIRECT_TO_LOGIN
  appPageURL?: PageURL
  authPageURL?: PageURL
  LoaderComponent?: ComponentType | null
}

interface HOCProps {
  AuthUserSerialized?: AuthUserSerializedType
}

/**
 * A higher-order component that provides pages with the
 * AuthUser and, optionally, redirects or renders different
 * children based on the user's current auth state.
 * To access the user from SSR, this should be paired with
 * `withAuthUserSSR` or `withAuthUserTokenSSR`.
 * @param {String} whenAuthed - The behavior to take if the user
 *   *is* authenticated. One of AuthAction.RENDER or
 *   AuthAction.REDIRECT_TO_APP. Defaults to AuthAction.RENDER.
 * @param {String} whenAuthedBeforeRedirect - The behavior to take
 *   if the user is authenticated and
 *   whenAuthed is set to AuthAction.REDIRECT_TO_APP.
 *   One of: AuthAction.RENDER, AuthAction.SHOW_LOADER, AuthAction.RETURN_NULL.
 *   Defaults to AuthAction.RETURN_NULL.
 * @param {String} whenUnauthedBeforeInit - The behavior to take
 *   if the user is not authenticated but the Firebase client JS
 *   SDK has not initialized. One of: AuthAction.RENDER,
 *   AuthAction.REDIRECT_TO_LOGIN, AuthAction.SHOW_LOADER,
 *   AuthAction.RETURN_NULL. Defaults to AuthAction.RENDER.
 * @param {String} whenUnauthedAfterInit - The behavior to take
 *   if the user is not authenticated and the Firebase client JS
 *   SDK has already initialized. One of: AuthAction.RENDER,
 *   AuthAction.REDIRECT_TO_LOGIN. Defaults to AuthAction.RENDER.
 * @param {String|Function} appPageURL - The redirect destination URL when
 *   we redirect to the app. Can either be a string or a function
 *   that accepts ({ctx, AuthUser}) as args and returns a string.
 * @param {String|Function} authPageURL - The redirect destination URL when
 *   we redirect to the login page. Can either be a string or a function
 *   that accepts ({ctx, AuthUser}) as args and returns a string.
 * @param {Function} Loader - The React component to show when the
 *   user is unauthed and `whenUnauthedBeforeInit` is set to
 *   `AuthAction.SHOW_LOADER`.
 * @return {Function} A function that takes a child component
 */
const withAuthUser =
  ({
    whenAuthed = AuthAction.RENDER,
    whenUnauthedBeforeInit = AuthAction.RENDER,
    whenUnauthedAfterInit = AuthAction.RENDER,
    whenAuthedBeforeRedirect = AuthAction.RETURN_NULL,
    appPageURL,
    authPageURL,
    LoaderComponent = null,
  }: WithAuthUserOptions = {}) =>
  <ComponentProps extends object>(
    ChildComponent: ComponentType<ComponentProps>
  ): ComponentType<ComponentProps & HOCProps> => {
    logDebug('[withAuthUser] Calling "withAuthUser".')

    // Some dependencies are optional. Throw if they aren't installed
    // when calling this API.
    // https://github.com/gladly-team/next-firebase-auth/issues/502
    try {
      /* eslint-disable global-require, no-var, vars-on-top, @typescript-eslint/no-var-requires */
      var React = require('react')
      var { useEffect, useCallback, useMemo } = require('react')
      var { useRouter } = require('next/router')
      var { AuthUserContext } = require('src/useAuthUser')
      /* eslint-enable global-require, no-var, vars-on-top, @typescript-eslint/no-var-requires */
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (e: any) {
      if (e.code === MODULE_NOT_FOUND) {
        throw new Error(
          'The dependencies "react" and "next" are required when calling `withAuthUser`.'
        )
      } else {
        throw e
      }
    }

    const WithAuthUserHOC = (props: ComponentProps & HOCProps) => {
      const { AuthUserSerialized, ...otherProps } = props
      const AuthUserFromServer = useMemo(
        () =>
          createAuthUser({
            serializedAuthUser: AuthUserSerialized,
          }),
        [AuthUserSerialized]
      )

      const {
        user: firebaseUser,
        claims,
        initialized: firebaseInitialized,
        authRequestCompleted,
      } = useFirebaseUser()
      const AuthUserFromClient = useMemo(
        () =>
          createAuthUser({
            firebaseUserClientSDK: firebaseUser || undefined,
            clientInitialized: firebaseInitialized,
            claims,
          }),
        [firebaseUser, firebaseInitialized, claims]
      )

      // Set the AuthUser to values from the Firebase JS SDK user
      // once it has initialized. On the server side and before the
      // client-side SDK has initialized, use the AuthUser from the
      // session.
      const AuthUser = firebaseInitialized
        ? AuthUserFromClient
        : AuthUserFromServer

      const isAuthed = !!AuthUser.id
      const isInitialized = AuthUser.clientInitialized

      // Redirect to the app if all are true:
      // * the user is authed
      // * the "whenAuthed" argument is set to redirect to the app
      // * if on the client side, the call to set cookies has completed
      //   (see: https://github.com/gladly-team/next-firebase-auth/issues/189)
      const willRedirectToApp =
        isAuthed && whenAuthed === AuthAction.REDIRECT_TO_APP
      const shouldRedirectToApp =
        willRedirectToApp && isClientSide() && authRequestCompleted

      // Redirect to the login page if the user is not authed and one of these
      // is true:
      // * the "when unauthed" settings tell us to redirect to login BEFORE
      //   Firebase has initialized
      // * the "when unauthed" settings tell us to redirect to login AFTER
      //   Firebase has initialized, and the call to set cookies has completed
      //   (see: https://github.com/gladly-team/next-firebase-auth/issues/189)
      const willRedirectToLogin =
        !isAuthed &&
        ((!isInitialized &&
          whenUnauthedBeforeInit === AuthAction.REDIRECT_TO_LOGIN) ||
          (isInitialized &&
            whenUnauthedAfterInit === AuthAction.REDIRECT_TO_LOGIN))
      const shouldRedirectToLogin =
        willRedirectToLogin &&
        isClientSide() &&
        // We don't have to wait for an auth request if we should redirect
        // before Firebase initializes.
        (whenUnauthedBeforeInit !== AuthAction.REDIRECT_TO_LOGIN
          ? authRequestCompleted
          : true)

      const router = useRouter()
      const routeToDestination = useCallback(
        ({ basePath, destination }: RedirectDestination) => {
          if (basePath === false) {
            window.location.replace(destination)
          } else {
            router.replace(destination)
          }
        },
        [router]
      )
      const redirectToApp = useCallback(() => {
        logDebug('[withAuthUser] Redirecting to app.')
        const destination = getAppRedirectInfo({
          AuthUser,
          redirectURL: appPageURL,
        })

        routeToDestination(destination)
      }, [AuthUser, routeToDestination])
      const redirectToLogin = useCallback(() => {
        logDebug('[withAuthUser] Redirecting to login.')
        const destination = getLoginRedirectInfo({
          AuthUser,
          redirectURL: authPageURL,
        })

        routeToDestination(destination)
      }, [AuthUser, routeToDestination])

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

      // Decide what to render.
      let returnVal = null
      const loaderComp = LoaderComponent ? <LoaderComponent /> : null
      const comps = (
        <AuthUserContext.Provider value={AuthUser}>
          {/**
           * https://github.com/Microsoft/TypeScript/issues/28938#issuecomment-450636046
           * */}
          {/* eslint-disable-next-line react/jsx-props-no-spreading */}
          <ChildComponent {...(otherProps as ComponentProps)} />
        </AuthUserContext.Provider>
      )
      if (willRedirectToApp) {
        if (whenAuthedBeforeRedirect === AuthAction.RENDER) {
          returnVal = comps
        } else if (whenAuthedBeforeRedirect === AuthAction.SHOW_LOADER) {
          returnVal = loaderComp
        } else {
          returnVal = null
        }
      } else if (willRedirectToLogin) {
        if (whenUnauthedBeforeInit === AuthAction.RETURN_NULL) {
          returnVal = null
        } else if (whenUnauthedBeforeInit === AuthAction.SHOW_LOADER) {
          returnVal = loaderComp
        } else {
          returnVal = comps
        }
      } else if (!isAuthed && !authRequestCompleted) {
        if (whenUnauthedBeforeInit === AuthAction.SHOW_LOADER) {
          returnVal = loaderComp
        } else if (whenUnauthedBeforeInit === AuthAction.RETURN_NULL) {
          returnVal = null
        } else {
          returnVal = comps
        }
      } else {
        returnVal = comps
      }

      logDebug('[withAuthUser] Set AuthUser to:', AuthUser)

      return returnVal
    }

    WithAuthUserHOC.displayName = 'WithAuthUserHOC'
    hoistNonReactStatics(WithAuthUserHOC, ChildComponent)
    return WithAuthUserHOC
  }

export default withAuthUser
