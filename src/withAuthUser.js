import React, { useEffect, useCallback, useMemo } from 'react'
import { useRouter } from 'next/router'
import hoistNonReactStatics from 'hoist-non-react-statics'
import { AuthUserContext } from 'src/useAuthUser'
import createAuthUser from 'src/createAuthUser'
import useFirebaseUser from 'src/useFirebaseUser'
import { getConfig } from 'src/config'
import AuthAction from 'src/AuthAction'
import isClientSide from 'src/isClientSide'
import logDebug from 'src/logDebug'

// Testing changes in bundle size.
const uselessData = `
Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed porta tempor dolor, viverra iaculis libero tincidunt sit amet. In hac habitasse platea dictumst. Aliquam erat volutpat. Nam et nisi at neque blandit egestas. Vivamus non tortor eu neque tempus convallis eu at nibh. Vestibulum eget lacus mattis lectus gravida feugiat. Sed sed vehicula mi, at tincidunt est. Phasellus faucibus est sit amet libero lacinia, semper convallis felis luctus. Nam ornare sapien dui, quis pharetra dui cursus at. Cras a accumsan sapien.

Vivamus hendrerit egestas nisl. Phasellus est diam, dapibus a enim ut, ornare fringilla arcu. Vestibulum vel tincidunt eros. Cras diam neque, euismod et auctor sed, ullamcorper vitae risus. Nam volutpat nulla metus, vitae dignissim mauris maximus vel. Curabitur vel risus at ligula iaculis malesuada. Aliquam venenatis sagittis augue sed maximus. Vivamus congue nulla quam, pellentesque cursus velit molestie sed. Integer semper mauris enim, id laoreet purus ultricies id. Curabitur euismod leo ac leo varius tristique.

Etiam justo ante, lobortis eu justo eget, rutrum gravida nunc. Vivamus consectetur lectus eget blandit aliquet. Quisque non magna velit. Phasellus ornare felis id ipsum suscipit, congue viverra mauris venenatis. Donec dignissim magna ac massa feugiat mattis. Sed a neque ac velit rhoncus maximus. In hac habitasse platea dictumst. Quisque diam quam, gravida non nisl vel, feugiat pharetra dolor.

Praesent vel fermentum purus, in rutrum turpis. Ut nec nisi felis. Donec et suscipit tellus. Morbi fringilla, lectus at porta malesuada, lectus justo malesuada libero, sit amet mollis sem eros ut mauris. Sed ut tempor nulla. Quisque lacus augue, tempor id tortor nec, pharetra euismod nisl. Vivamus tincidunt tellus eu dui placerat, quis sagittis sem aliquet. Lorem ipsum dolor sit amet, consectetur adipiscing elit. Suspendisse tincidunt ex sit amet euismod cursus. Maecenas tincidunt in odio eget dictum. Vivamus vel pretium eros. Praesent laoreet suscipit justo. Donec porttitor lorem a erat convallis porttitor. Praesent enim justo, egestas vel blandit non, laoreet eu nibh.

Curabitur facilisis massa viverra ante pharetra imperdiet sed sit amet nibh. Integer scelerisque metus dolor, ac hendrerit diam maximus et. Curabitur scelerisque neque a vulputate aliquam. Morbi molestie eget nisl nec pellentesque. Quisque maximus bibendum nulla, vitae dictum quam porttitor non. Fusce nec vestibulum lacus. Duis id massa egestas, convallis massa vitae, consequat augue. Mauris venenatis nunc sapien, eleifend porttitor ante efficitur et. Phasellus consectetur, lacus ut vestibulum congue, tortor tortor sagittis nibh, sit amet dapibus nisl augue et dolor. Sed interdum pretium eros ultrices egestas. Integer egestas, purus non aliquet viverra, velit risus auctor lectus, a tincidunt enim nisl non ipsum.

Aenean at tempor nunc. Integer dictum nec elit ac ultrices. Morbi lobortis ultrices massa. Integer sed arcu quis enim luctus laoreet. Lorem ipsum dolor sit amet, consectetur adipiscing elit. Vestibulum condimentum, nisl nec imperdiet ullamcorper, enim eros pharetra eros, ut facilisis augue leo quis turpis. Quisque dictum ex ut quam mattis pellentesque. Aliquam sollicitudin consectetur lacus at molestie. Sed at ligula sit amet erat tempor cursus. Ut consectetur porta arcu eu viverra. Ut pulvinar, odio et efficitur imperdiet, nulla elit pulvinar neque, id pellentesque sapien arcu ac nisi. In magna diam, consectetur sed libero eget, tincidunt aliquet sem. Nam eu semper odio. Ut vel ultrices tellus.

Ut vel lacus convallis, lacinia justo vel, placerat nibh. Maecenas tincidunt sapien ipsum, sed auctor ante egestas vel. Suspendisse in ligula suscipit, varius enim sit amet, efficitur lorem. Suspendisse at imperdiet magna, nec efficitur risus. Curabitur et rhoncus sem. Curabitur et turpis metus. In a arcu ut nunc ultrices lacinia vel ac ligula. Praesent eu sapien at erat rhoncus ultrices a in quam.

Duis et libero a leo bibendum vestibulum. Suspendisse placerat pulvinar metus at cursus. Vivamus mi elit, mollis quis placerat vel, feugiat quis sapien. Etiam ullamcorper suscipit mi, at dignissim lacus gravida sit amet. Cras vel velit pulvinar, egestas mauris sit amet, imperdiet metus. Fusce id dapibus lectus. Donec ac nulla elit. Integer rutrum hendrerit quam, eu dictum diam semper eu. Aliquam scelerisque risus vel turpis tincidunt, at sodales ligula cursus. Nullam accumsan lectus sit amet odio commodo viverra. Maecenas tempus aliquet ante. Cras lobortis mauris sit amet augue rhoncus, sed tincidunt velit pretium. Aliquam sodales scelerisque magna et posuere. Donec accumsan metus vitae turpis venenatis, ut posuere enim faucibus.

Proin auctor mauris eu ultrices accumsan. Nunc vitae leo id dui interdum tempus. Aliquam erat volutpat. Pellentesque molestie lacus orci, ac volutpat nulla fringilla at. Maecenas vitae purus eget urna porta elementum eu a purus. Morbi suscipit rhoncus quam sit amet maximus. Pellentesque ac enim vitae urna gravida vestibulum condimentum in purus. Ut sagittis sem sed iaculis mollis. Nunc maximus euismod hendrerit. Sed felis tellus, dapibus sed lacus sit amet, aliquam maximus ante. Nam consequat congue magna vitae mattis.

Nam cursus accumsan justo, ac vehicula dolor sagittis vel. Duis commodo tincidunt dui ut volutpat. Ut tempus, urna id vehicula porta, orci quam rutrum nisi, non volutpat odio quam quis tellus. Aliquam mattis eget urna vitae placerat. Fusce ultricies, ex id venenatis malesuada, elit libero aliquet elit, sed ornare sem urna quis diam. Sed a urna imperdiet, congue odio ut, consequat leo. Sed feugiat, massa vitae lacinia elementum, purus enim aliquam neque, semper euismod lectus odio quis metus. Quisque faucibus at dui efficitur molestie. Duis a aliquet tortor. Maecenas nec tellus porttitor, cursus libero vitae, consequat ipsum. Suspendisse dui est, lobortis eu leo id, bibendum tempus odio. Duis eget mi pellentesque, feugiat augue non, dictum massa. Etiam et posuere nulla.

Nulla quis condimentum urna. Aenean vulputate quam ut vulputate auctor. Interdum et malesuada fames ac ante ipsum primis in faucibus. Sed sem ligula, feugiat laoreet viverra vitae, iaculis et odio. Fusce quis ullamcorper massa. Nunc ac dignissim arcu, ut luctus lorem. Curabitur leo elit, eleifend a lacus at, egestas iaculis nibh. Ut molestie odio ipsum, quis sollicitudin orci laoreet et. Proin eget leo sit amet diam fermentum interdum a a arcu. Sed pellentesque tellus laoreet imperdiet tempus. Orci varius natoque penatibus et magnis dis parturient montes, nascetur ridiculus mus. Nam vel nunc sed odio tempus venenatis vitae quis leo. Suspendisse eros nunc, congue vitae ex sit amet, pretium pulvinar lectus. Integer fermentum consectetur pharetra.

Etiam pretium tristique ex eu ultrices. Praesent tristique maximus dui at pretium. Donec vulputate euismod augue, nec tempus ante ullamcorper in. In sagittis ipsum nec lectus laoreet dignissim. Etiam quis nibh eu risus mollis euismod. Maecenas quis pretium nunc, eu vehicula dui. Quisque nisi libero, ornare vel lorem nec, fringilla euismod orci. Nunc mollis elit id velit cursus, ultricies egestas metus gravida.

Donec dignissim consequat libero, ac rhoncus arcu lacinia a. Sed non consectetur enim. Proin scelerisque ullamcorper nisi sed ullamcorper. Aenean nec purus dignissim, rutrum lacus at, lobortis sapien. Morbi eu urna a erat facilisis dapibus in vitae mauris. Ut sit amet sagittis magna. Quisque elementum, velit sit amet dictum rutrum, nulla justo aliquam lorem, ut vulputate massa est id enim. Nunc malesuada sagittis dui vel iaculis. Phasellus lacinia malesuada imperdiet. Cras elementum dapibus nisi in dignissim. Etiam tempus sem in odio vulputate tristique.

Pellentesque faucibus elit in nisi dignissim, in tristique velit lobortis. Pellentesque habitant morbi tristique senectus et netus et malesuada fames ac turpis egestas. Mauris commodo a massa in ultrices. Pellentesque in ante et nisl facilisis rhoncus in in justo. Pellentesque blandit nisl eget purus scelerisque, vel rutrum elit rhoncus. Aenean eu luctus metus. Quisque condimentum luctus mauris, vel vehicula urna pulvinar et. Maecenas in ex eget est aliquam luctus et non augue. Quisque commodo pharetra nulla. Sed pulvinar orci eget mauris placerat, a scelerisque eros egestas. Pellentesque elementum, dolor in cursus porttitor, sem sem scelerisque turpis, non scelerisque libero nisl eget odio. Cras pellentesque fringilla nibh, id vulputate justo accumsan eget. Phasellus lobortis dolor id aliquet condimentum.

Etiam tincidunt, massa in commodo venenatis, massa lorem viverra nisl, in sollicitudin nisi nisl mollis justo. Nullam porta dolor urna, luctus gravida quam porta id. Proin vulputate tortor eu maximus condimentum. Ut sodales erat sit amet augue rhoncus, ac tristique neque faucibus. Fusce blandit lacinia lectus, et imperdiet velit facilisis at. Phasellus pulvinar, ipsum sed blandit blandit, lacus lorem congue nisl, a porta nunc ante eget sem. Aliquam erat volutpat. Maecenas vel varius est. Curabitur vestibulum nisl quis cursus ultrices. Nulla maximus mi vitae posuere consectetur. Mauris id orci vulputate, dictum eros sed, imperdiet sem. Nunc finibus ante eget quam varius imperdiet. Donec ornare vitae justo non accumsan. Maecenas interdum leo convallis consequat maximus. Donec venenatis rutrum augue vitae pharetra. Pellentesque habitant morbi tristique senectus et netus et malesuada fames ac turpis egestas.

Etiam sed mauris pretium, auctor justo at, dictum orci. Praesent vitae vulputate libero. Integer rhoncus augue at metus faucibus convallis. Sed eu quam sodales, lobortis libero ut, suscipit dolor. Vestibulum blandit nisi massa, at bibendum turpis feugiat id. Proin tincidunt porta mauris id vehicula. Aenean at varius purus, ut feugiat nisi. Fusce et molestie dolor, nec dictum enim. Vestibulum euismod, turpis ut convallis suscipit, enim dui sodales odio, interdum malesuada sapien leo nec risus. Morbi posuere erat sed feugiat sollicitudin. Vivamus ut erat vehicula, vestibulum orci eu, imperdiet nunc. Etiam varius vehicula ipsum nec mollis. Curabitur sollicitudin nisl risus, at blandit libero finibus a. Nam imperdiet augue dui, aliquet efficitur neque tincidunt et.

Duis tempus iaculis risus at maximus. Fusce euismod justo mi, eu ullamcorper ipsum gravida eget. Praesent efficitur nisi laoreet, placerat neque in, sollicitudin lorem. Duis fermentum dapibus cursus. Nunc vitae risus in felis aliquam dictum vitae vel justo. Nulla lectus lectus, accumsan id gravida sed, euismod a est. Nulla porttitor fringilla ipsum, vel sagittis dolor aliquam in. In quis sagittis dolor, quis consectetur ante. Etiam sit amet nisi quis ipsum egestas vulputate id at lectus. Sed laoreet convallis leo blandit feugiat.

Donec tincidunt ex non ante venenatis luctus quis in libero. Maecenas imperdiet laoreet bibendum. Pellentesque habitant morbi tristique senectus et netus et malesuada fames ac turpis egestas. Sed ut auctor purus. Nulla facilisi. Donec volutpat finibus sagittis. Duis vel dolor lorem. Aenean in felis sed enim elementum cursus ac at diam. Aenean non rhoncus magna. Vivamus id nisl ac lorem sollicitudin luctus. Sed finibus nunc id ligula auctor, vehicula convallis risus ultricies. Proin posuere ipsum quis rhoncus ornare. Phasellus vitae lectus facilisis, venenatis sem at, posuere nibh. Vestibulum ante ipsum primis in faucibus orci luctus et ultrices posuere cubilia curae; Duis in ipsum lorem.

Mauris vestibulum pretium magna ut rhoncus. Suspendisse vulputate sodales arcu ut ultricies. Fusce ut neque id lectus porttitor pretium. Sed tempor nunc et ullamcorper tincidunt. Pellentesque habitant morbi tristique senectus et netus et malesuada fames ac turpis egestas. Morbi faucibus, lorem eget interdum bibendum, ex sem consectetur magna, sit amet pellentesque magna ipsum nec nisi. Pellentesque ultrices placerat finibus. Nullam vel lorem vel libero aliquam dapibus ac pellentesque eros. Mauris porta ante ac mauris mollis interdum.

Proin sit amet massa vel eros commodo accumsan. Nulla sit amet varius leo, cursus pharetra libero. Suspendisse quis felis molestie, suscipit tortor nec, imperdiet odio. Vivamus efficitur vitae lectus at pharetra. Aliquam iaculis nibh quis orci dignissim accumsan. Phasellus ac augue aliquet, ornare velit id, aliquet nunc. Maecenas ornare elit in velit ullamcorper, nec tempus felis vulputate. Duis ut accumsan eros, ac accumsan lectus. 
`

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
    appPageURL = null,
    authPageURL = null,
    LoaderComponent = null,
  } = {}) =>
  (ChildComponent) => {
    const WithAuthUserHOC = (props) => {
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
            firebaseUserClientSDK: firebaseUser,
            clientInitialized: firebaseInitialized,
            claims,
          }),
        [firebaseUser, firebaseInitialized, claims]
      )

      // eslint-disable-next-line no-console
      console.log(uselessData)

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
        willRedirectToApp && isClientSide && authRequestCompleted

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
        isClientSide &&
        // We don't have to wait for an auth request if we should redirect
        // before Firebase initializes.
        (whenUnauthedBeforeInit !== AuthAction.REDIRECT_TO_LOGIN
          ? authRequestCompleted
          : true)

      const router = useRouter()
      const redirectToApp = useCallback(() => {
        logDebug('Redirecting to app.')
        const appRedirectDestination = appPageURL || getConfig().appPageURL
        if (!appRedirectDestination) {
          throw new Error(
            'The "appPageURL" config setting must be set when using `REDIRECT_TO_APP`.'
          )
        }

        const destination =
          typeof appRedirectDestination === 'string'
            ? appRedirectDestination
            : appRedirectDestination({ ctx: undefined, AuthUser })

        if (!destination || typeof destination !== 'string') {
          throw new Error(
            'The "appPageURL" must be set to a non-empty string or resolve to a non-empty string'
          )
        }
        router.replace(destination)
      }, [router, AuthUser])
      const redirectToLogin = useCallback(() => {
        logDebug('Redirecting to login.')
        const authRedirectDestination = authPageURL || getConfig().authPageURL
        if (!authRedirectDestination) {
          throw new Error(
            'The "authPageURL" config setting must be set when using `REDIRECT_TO_LOGIN`.'
          )
        }

        const destination =
          typeof authRedirectDestination === 'string'
            ? authRedirectDestination
            : authRedirectDestination({ ctx: undefined, AuthUser })

        if (!destination || typeof destination !== 'string') {
          throw new Error(
            'The "authPageURL" must be set to a non-empty string or resolve to a non-empty string'
          )
        }
        router.replace(destination)
      }, [router, AuthUser])

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
          {/* eslint-disable-next-line react/jsx-props-no-spreading */}
          <ChildComponent {...otherProps} />
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

      logDebug('AuthUser set to:', AuthUser)

      return returnVal
    }

    WithAuthUserHOC.displayName = 'WithAuthUserHOC'
    hoistNonReactStatics(WithAuthUserHOC, ChildComponent)
    return WithAuthUserHOC
  }

export default withAuthUser
