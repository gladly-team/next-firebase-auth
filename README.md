[![Build Status](https://img.shields.io/github/workflow/status/gladly-team/next-firebase-auth/Unit%20test,%20log%20code%20coverage,%20and%20build)](https://github.com/gladly-team/next-firebase-auth/actions?query=workflow%3A%22Unit+test%2C+log+code+coverage%2C+and+build%22)
[![codecov](https://codecov.io/gh/gladly-team/next-firebase-auth/branch/main/graph/badge.svg)](https://codecov.io/gh/gladly-team/next-firebase-auth)
[![npm](https://img.shields.io/npm/v/next-firebase-auth.svg)](https://www.npmjs.com/package/next-firebase-auth)
[![Contributor Covenant](https://img.shields.io/badge/Contributor%20Covenant-2.1-4baaaa.svg)](./CODE_OF_CONDUCT.md)

# next-firebase-auth

Simple Firebase authentication for all Next.js rendering strategies.

#### [Demo](#demo) • [Alternatives](#when-not-to-use-this-package) • [Getting Started](#get-started) • [API](#api) • [Config](#config) • [Types](#types) • [Examples](#examples) • [Troubleshooting](#troubleshooting) • [Contributing](./CONTRIBUTING.md)

## What It Does

This package makes it simple to get the authenticated Firebase user and ID token during both client-side and server-side rendering (SSR).

###### &nbsp;&nbsp;&nbsp;&nbsp; 🌍 &nbsp; Support for all Next.js rendering strategies

###### &nbsp;&nbsp;&nbsp;&nbsp; 🔒 &nbsp; Signed, secure, HTTP-only cookies by default

###### &nbsp;&nbsp;&nbsp;&nbsp; 🆔 &nbsp; Server-side access to the user's Firebase ID token

###### &nbsp;&nbsp;&nbsp;&nbsp; 🍪 &nbsp; Built-in cookie management

###### &nbsp;&nbsp;&nbsp;&nbsp; ↩️ &nbsp; Built-in support for redirecting based on the user's auth status

We treat the Firebase JS SDK as the source of truth for auth status. When the user signs in, we call an endpoint to generate a refresh token and store the user info, ID token, and refresh token in cookies. Future requests to SSR pages receive the user info and ID token from cookies, refreshing the ID token as needed. When the user logs out, we unset the cookies.

## Demo

[See a live demo](https://nfa-example.vercel.app/) of the [example app](https://github.com/gladly-team/next-firebase-auth/tree/main/example).

## When (Not) to Use this Package

**This package will likely be helpful** if you're using Firebase authentication and expect to use server-side rendering—especially if you need access to Firebase ID tokens on the server side.

Depending on your app's needs, other approaches might work better for you.

**If your app only uses static pages** or doesn't need the Firebase user for SSR, use the Firebase JS SDK directly to load the user on the client side.

- _Pros:_ It's simpler and removes this package as a dependency.
- _Cons:_ You will not have access to the Firebase user when you use `getServerSideProps`.

**If your app needs the Firebase user for SSR (but does not need the ID token server side)**, you could consider one of these approaches:

1. On the client, set a JavaScript cookie with the Firebase user information once the Firebase JS SDK loads.
   - _Pros:_ You won't need login/logout API endpoints. You can structure the authed user data however you'd like.
   - _Cons:_ The cookie will be unsigned and accessible to other JavaScript, making this approach less secure. You won't always have access to the Firebase ID token server side, so you won't be able to access other Firebase services. You could set the ID token in the cookie, but it will expire after an hour and be invalid for future server-side-rendered pages.
2. Use [Firebase's session cookies](https://firebase.google.com/docs/auth/admin/manage-cookies).
   - _Pros:_ It removes this package as a dependency.
   - _Cons:_ You won't have access to the Firebase ID token server side, so you won't be able to access other Firebase services. You'll need to implement the logic for verifying the session and managing the session state.

**If your app needs a generalized authentication solution**—not specifically Firebase authentication—you could consider using [NextAuth.js](https://github.com/nextauthjs/next-auth). NextAuth.js does *not* use Firebase authentication but supports a wide variety of identity providers, including Google. [Read more here](https://github.com/gladly-team/next-firebase-auth/discussions/522#discussioncomment-3336440) about the differences between `next-firebase-auth` and NextAuth.js to see which works best for your needs.

**What this package does _not_ do:**
- It does not provide authentication UI. Consider [firebaseui-web](https://github.com/firebase/firebaseui-web) or build your own.
- It does not extend Firebase functionality beyond providing universal access to the authed user. Use the Firebase admin SDK and Firebase JS SDK for any other needs.

## Get Started

**Install:**

Firebase v8: `yarn add next-firebase-auth` or `npm i next-firebase-auth`

Firebase v9+: `yarn add next-firebase-auth@canary` or `npm i next-firebase-auth@canary`

> ⚠️ If you're using v9 of the Firebase JS SDK, use `next-firebase-auth@canary`. This is an unstable v1 prerelease. Track progress on v1 [in this issue](https://github.com/gladly-team/next-firebase-auth/issues/265).

Make sure peer dependencies are also installed:

`yarn add firebase firebase-admin next react react-dom`

Create a module to initialize `next-firebase-auth`.

#### Example config:

_See [config documentation](#config) for details_

```js
// ./initAuth.js
import { init } from 'next-firebase-auth'

const initAuth = () => {
  init({
    authPageURL: '/auth',
    appPageURL: '/',
    loginAPIEndpoint: '/api/login', // required
    logoutAPIEndpoint: '/api/logout', // required
    onLoginRequestError: (err) => {
      console.error(err)
    },
    onLogoutRequestError: (err) => {
      console.error(err)
    },
    firebaseAuthEmulatorHost: 'localhost:9099',
    firebaseAdminInitConfig: {
      credential: {
        projectId: 'my-example-app-id',
        clientEmail: 'example-abc123@my-example-app.iam.gserviceaccount.com',
        // The private key must not be accessible on the client side.
        privateKey: process.env.FIREBASE_PRIVATE_KEY,
      },
      databaseURL: 'https://my-example-app.firebaseio.com',
    },
    // Use application default credentials (takes precedence over firebaseAdminInitConfig if set)
    // useFirebaseAdminDefaultCredential: true,
    firebaseClientInitConfig: {
      apiKey: 'MyExampleAppAPIKey123', // required
      authDomain: 'my-example-app.firebaseapp.com',
      databaseURL: 'https://my-example-app.firebaseio.com',
      projectId: 'my-example-app-id',
    },
    cookies: {
      name: 'ExampleApp', // required
      // Keys are required unless you set `signed` to `false`.
      // The keys cannot be accessible on the client side.
      keys: [
        process.env.COOKIE_SECRET_CURRENT,
        process.env.COOKIE_SECRET_PREVIOUS,
      ],
      httpOnly: true,
      maxAge: 12 * 60 * 60 * 24 * 1000, // twelve days
      overwrite: true,
      path: '/',
      sameSite: 'strict',
      secure: true, // set this to false in local (non-HTTPS) development
      signed: true,
    },
    onVerifyTokenError: (err) => {
      console.error(err)
    },
    onTokenRefreshError: (err) => {
      console.error(err)
    },
  })
}

export default initAuth
```

Set the private environment variables `FIREBASE_PRIVATE_KEY`, `COOKIE_SECRET_CURRENT`, and `COOKIE_SECRET_PREVIOUS` in `.env.local`. If you have enabled [the Firebase Authentication Emulator](#https://firebase.google.com/docs/emulator-suite/connect_auth), you will also need to set the `FIREBASE_AUTH_EMULATOR_HOST` environment variable.

Initialize `next-firebase-auth` in `_app.js`:

```js
// ./pages/_app.js
import initAuth from '../initAuth' // the module you created above

initAuth()

function MyApp({ Component, pageProps }) {
  return <Component {...pageProps} />
}

export default MyApp
```

Create login and logout API endpoints that set auth cookies:

```js
// ./pages/api/login
import { setAuthCookies } from 'next-firebase-auth'
import initAuth from '../../initAuth' // the module you created above

initAuth()

const handler = async (req, res) => {
  try {
    await setAuthCookies(req, res)
  } catch (e) {
    return res.status(500).json({ error: 'Unexpected error.' })
  }
  return res.status(200).json({ success: true })
}

export default handler
```

```js
// ./pages/api/logout
import { unsetAuthCookies } from 'next-firebase-auth'
import initAuth from '../../initAuth' // the module you created above

initAuth()

const handler = async (req, res) => {
  try {
    await unsetAuthCookies(req, res)
  } catch (e) {
    return res.status(500).json({ error: 'Unexpected error.' })
  }
  return res.status(200).json({ success: true })
}

export default handler
```

Finally, use the authenticated user in a page:

```js
// ./pages/demo
import React from 'react'
import {
  useAuthUser,
  withAuthUser,
  withAuthUserTokenSSR,
} from 'next-firebase-auth'

const Demo = () => {
  const AuthUser = useAuthUser()
  return (
    <div>
      <p>Your email is {AuthUser.email ? AuthUser.email : 'unknown'}.</p>
    </div>
  )
}

// Note that this is a higher-order function.
export const getServerSideProps = withAuthUserTokenSSR()()

export default withAuthUser()(Demo)
```

## API

- [init](#initconfig)
- [withAuthUser](#withauthuser-options-pagecomponent)
- [withAuthUserTokenSSR](#withauthusertokenssr-options-getserversidepropsfunc---authuser---)
- [withAuthUserSSR](#withauthuserssr-options-getserversidepropsfunc---authuser---)
- [useAuthUser](#useauthuser)
- [setAuthCookies](#setauthcookiesreq-res)
- [unsetAuthCookies](#unsetauthcookiesreq-res)
- [verifyIdToken](#verifyidtokentoken--promiseauthuser)
- [AuthAction](#authaction)
- [getFirebaseAdmin](#getfirebaseadmin--firebaseadmin)

---

#### `init(config)`

Initializes `next-firebase-auth`, taking a [config](#config) object. **Must be called** before calling any other method.

#### `withAuthUser({ ...options })(PageComponent)`

A higher-order function to provide the `AuthUser` context to a component. Use this with any Next.js page that will access the authed user via the [`useAuthUser`](#useauthuser) hook. Optionally, it can client-side redirect based on the user's auth status.

It accepts the following options:

| Option                     | Description                                                                                                                                                                                                                                     | Default                  |
| -------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------ |
| `whenAuthed`               | The action to take if the user is authenticated. One of `AuthAction.RENDER` or `AuthAction.REDIRECT_TO_APP`.                                                                                                                                    | `AuthAction.RENDER`      |
| `whenAuthedBeforeRedirect` | The action to take while waiting for the browser to redirect. Relevant when the user is authenticated and whenAuthed is set to AuthAction.REDIRECT_TO_APP. One of: `AuthAction.RENDER` or `AuthAction.SHOW_LOADER` or `AuthAction.RETURN_NULL`. | `AuthAction.RETURN_NULL` |
| `whenUnauthedBeforeInit`   | The action to take if the user is _not_ authenticated but the Firebase client JS SDK has not yet initialized. One of: `AuthAction.RENDER`, `AuthAction.REDIRECT_TO_LOGIN`, `AuthAction.SHOW_LOADER`.                                            | `AuthAction.RENDER`      |
| `whenUnauthedAfterInit`    | The action to take if the user is _not_ authenticated and the Firebase client JS SDK has already initialized. One of: `AuthAction.RENDER`, `AuthAction.REDIRECT_TO_LOGIN`.                                                                      | `AuthAction.RENDER`      |
| `appPageURL`               | The redirect destination URL when we should redirect to the app. A [PageURL](#pageurl).                                                                                                                                                         | `config.appPageURL`      |
| `authPageURL`              | The redirect destination URL when we should redirect to the login page. A [PageURL](#pageurl).                                                                                                                                                  | `config.authPageURL`     |
| `LoaderComponent`          | The component to render when the user is unauthed and `whenUnauthedBeforeInit` is set to `AuthAction.SHOW_LOADER`.                                                                                                                              | null                     |

For example, this page will redirect to the login page if the user is not authenticated:

```jsx
import { withAuthUser, AuthAction } from 'next-firebase-auth'

const DemoPage = () => <div>My demo page</div>

export default withAuthUser({
  whenUnauthedAfterInit: AuthAction.REDIRECT_TO_LOGIN,
  authPageURL: '/my-login-page/',
})(DemoPage)
```

Here's an example of a login page that shows a loader until Firebase is initialized, then redirects to the app if the user is already logged in:

```jsx
import { withAuthUser, AuthAction } from 'next-firebase-auth'

const MyLoader = () => <div>Loading...</div>

const LoginPage = () => <div>My login page</div>

export default withAuthUser({
  whenAuthed: AuthAction.REDIRECT_TO_APP,
  whenUnauthedBeforeInit: AuthAction.SHOW_LOADER,
  whenUnauthedAfterInit: AuthAction.RENDER,
  LoaderComponent: MyLoader,
})(LoginPage)
```

For TypeScript usage, take a look [here](#typescript).

#### `withAuthUserTokenSSR({ ...options })(getServerSidePropsFunc = ({ AuthUser }) => {})`

A higher-order function that wraps a Next.js pages's `getServerSideProps` function to provide the `AuthUser` context during server-side rendering. Optionally, it can server-side redirect based on the user's auth status. A wrapped function is optional; if provided, it will be called with a `context` object that contains an [`AuthUser`](#authuser) property.

It accepts the following options:

| Option         | Description                                                                                                          | Default              |
| -------------- | -------------------------------------------------------------------------------------------------------------------- | -------------------- |
| `whenAuthed`   | The action to take if the user is authenticated. Either `AuthAction.RENDER` or `AuthAction.REDIRECT_TO_APP`.         | `AuthAction.RENDER`  |
| `whenUnauthed` | The action to take if the user is _not_ authenticated. Either `AuthAction.RENDER` or `AuthAction.REDIRECT_TO_LOGIN`. | `AuthAction.RENDER`  |
| `appPageURL`   | The redirect destination URL when we should redirect to the app. A [PageURL](#pageurl).                              | `config.appPageURL`  |
| `authPageURL`  | The redirect destination URL when we should redirect to the login page. A [PageURL](#pageurl).                       | `config.authPageURL` |

For example, this page will SSR for authenticated users, fetching props using their Firebase ID token, and will server-side redirect to the login page if the user is not authenticated:

```jsx
import { withAuthUser, AuthAction } from 'next-firebase-auth'

const DemoPage = ({ thing }) => <div>The thing is: {thing}</div>

export const getServerSideProps = withAuthUserTokenSSR({
  whenUnauthed: AuthAction.REDIRECT_TO_LOGIN,
})(async ({ AuthUser }) => {
  // Optionally, get other props.
  const token = await AuthUser.getIdToken()
  const response = await fetch('/api/my-endpoint', {
    method: 'GET',
    headers: {
      Authorization: token,
    },
  })
  const data = await response.json()
  return {
    props: {
      thing: data.thing,
    },
  }
})

export default withAuthUser()(DemoPage)
```

#### `withAuthUserSSR({ ...options })(getServerSidePropsFunc = ({ AuthUser }) => {})`

Behaves nearly identically to `withAuthUserTokenSSR`, with one key difference: it does not validate an ID token. Instead, it simply uses the `AuthUser` data from a cookie. Consequently:

- It does not provide an ID token on the server side. The `AuthUser` provided via context will resolve to null when you call `AuthUser.getIdToken()`.
- It does not need to make a network request to refresh an expired ID token, so it will, on average, be faster than `withAuthUserTokenSSR`.
- It does _not_ check for token revocation. If you need verification that the user's credentials haven't been revoked, you should always use `withAuthUserTokenSSR`.

⚠️ Do not use this when `cookies.signed` is set to `false`. Doing so is a potential security risk, because the authed user cookie values could be modified by the client.

This takes the same options as `withAuthUserTokenSSR`.

#### `useAuthUser()`

A hook that returns the current [`AuthUser`](#authuser). To use this, the Next.js page must be wrapped in `withAuthUser`. If the user is not authenticated, `useAuthUser` will return an `AuthUser` instance with a null `id`.

For example:

```jsx
import { useAuthUser, withAuthUser } from 'next-firebase-auth'

const Demo = () => {
  const AuthUser = useAuthUser()
  return (
    <div>
      <p>Your email is {AuthUser.email ? AuthUser.email : 'unknown'}.</p>
    </div>
  )
}

export default withAuthUser()(Demo)
```

#### `setAuthCookies(req, res)`

Sets cookies to store the authenticated user's info. Call this from your "login" API endpoint.

Cookies are managed with [`cookies`](https://github.com/pillarjs/cookies). See [the config for cookie options](#cookies).

The `req` argument should be an `IncomingMessage` / Next.js request object. The `res` argument should be a `ServerResponse` / Next.js response object. It requires that the `Authorization` request header be set to the Firebase user ID token, which this package handles automatically.

This can only be called on the server side.

#### `unsetAuthCookies(req, res)`

Unsets (expires) the auth cookies. Call this from your "logout" API endpoint.

The `req` argument should be an `IncomingMessage` / Next.js request object. The `res` argument should be a `ServerResponse` / Next.js response object.

This can only be called on the server side.

#### `verifyIdToken(token) => Promise<AuthUser>`

Verifies a Firebase ID token and resolves to an [`AuthUser`](#authuser) instance. This serves a similar purpose as Firebase admin SDK's [verifyIdToken](https://firebase.google.com/docs/auth/admin/verify-id-tokens#verify_id_tokens_using_the_firebase_admin_sdk).

#### `AuthAction`

An object that defines rendering/redirecting options for `withAuthUser` and `withAuthUserTokenSSR`. See [AuthAction](#authaction-1).

#### `getFirebaseAdmin() => FirebaseAdmin`

_Added in v0.13.1_

A convenience function that returns the configured Firebase admin module.

This can only be called from the server side. It will throw an error if called from the client side.

For example:

```jsx
import { getFirebaseAdmin } from 'next-firebase-auth'
// ...other imports

const Artist = ({ artists }) => {
  return (
    <ul>
      {artists.map((artist) => (
        <li>{artist.name}</li>
      ))}
    </ul>
  )
}

export async function getServerSideProps({ params: { id } }) {
  const db = getFirebaseAdmin().firestore()
  const doc = await db.collection('artists').get()
  return {
    props: {
      artists: artists.docs.map((a) => {
        return { ...a.data(), key: a.id }
      }),
    },
  }
}

export default withAuthUser()(Artist)
```

## Config

See an [example config here](#example-config). Provide the config when you call `init`.

#### authPageURL

`String|Function|Object` – a [PageURL](#pageurl)

The default URL to navigate to when `withAuthUser` or `withAuthUserTokenSSR` need to redirect to login. Optional unless using the `AuthAction.REDIRECT_TO_LOGIN` auth action.

#### appPageURL

`String|Function|Object` – a [PageURL](#pageurl)

The default URL to navigate to when `withAuthUser` or `withAuthUserTokenSSR` need to redirect to the app. Optional unless using the `AuthAction.REDIRECT_TO_APP` auth action.

#### loginAPIEndpoint

`String`

The API endpoint this module will call when the auth state changes for an authenticated Firebase user.

Required unless a custom `tokenChangedHandler` is set, in which case it cannot be defined.

#### logoutAPIEndpoint

`String`

The API endpoint this module will call when the auth state changes for an unauthenticated Firebase user.

Required unless a custom `tokenChangedHandler` is set, in which case it cannot be defined.

#### onLoginRequestError

_Added in v0.14.0_

`Function` (optional)

A handler called if the login API endpoint returns a non-200 response. If a handler is not defined, this library will throw on any non-200 responses.

Not used or allowed if a custom `tokenChangedHandler` is set.

#### onLogoutRequestError

_Added in v0.14.0_

`Function` (optional)

A handler called if the logout API endpoint returns a non-200 response. If a handler is not defined, this library will throw on any non-200 responses.

Not used or allowed if a custom `tokenChangedHandler` is set.

#### tokenChangedHandler

`Function`

A callback that runs when the auth state changes for a particular user. Use this if you want to customize how your client-side app calls your login/logout API endpoints (for example, to use a custom fetcher or add custom headers). `tokenChangedHandler` receives an `AuthUser` as an argument and is called when the user's ID token changes, similarly to Firebase's `onIdTokenChanged` event.

If this callback is specified, user is responsible for:

1. Calling their login/logout endpoints depending on the user's auth state.
2. Passing the user's ID token in the Authorization header
3. Ensuring it allows the request to set cookies.

See the [default handler](https://github.com/gladly-team/next-firebase-auth/blob/fda3fe1f1b69a989da8608cc30412f39c0cbe1ad/src/useFirebaseUser.js#L9) for guidance.

#### firebaseAuthEmulatorHost

`String`

The host and port for the local [Firebase Auth Emulator](https://firebase.google.com/docs/emulator-suite/connect_auth#admin_sdks). If this value is set, the auth emulator will be initialized with the provided host and port.

Must match the value of the `FIREBASE_AUTH_EMULATOR_HOST` environment variable, e.g., `localhost:9099`.

#### firebaseAdminInitConfig

`Object`

Configuration passed to `firebase-admin`'s [`initializeApp`](https://firebase.google.com/docs/admin/setup#initialize-sdk). It should contain a `credential` property (a plain object) and a `databaseURL` property. **Required** unless you initialize `firebase-admin` yourself before initializing `next-firebase-auth`.

The `firebaseAdminInitConfig.credential.privateKey` cannot be defined on the client side and should live in a secret environment variable.

> ℹ️ Using Vercel? See [adding a private key to Vercel](#adding-a-private-key-to-Vercel) for guidance.

#### useFirebaseAdminDefaultCredential

`Boolean`

When true, `firebase-admin` will implicitly find your hosting environment service account during `initializeApp`. This is applicable for both [Firebase](https://firebase.google.com/docs/admin/setup#initialize-sdk), and [Google Cloud Platform](https://cloud.google.com/docs/authentication/production), and recommended over adding service account key to the code via file path or direct value.

**Note**: To setup `firebase-admin`, either `firebaseAdminInitConfig` or `useFirebaseAdminDefaultCredential` must be provided. Using the default credentials will override values passed to `firebaseAdminInitConfig.credential` if both are presented.

#### firebaseClientInitConfig

`Object`

Configuration passed to the Firebase JS SDK's [`initializeApp`](https://firebase.google.com/docs/reference/node/firebase#initializeapp). The `firebaseClientInitConfig.apiKey` value is **always required**. Other properties are required unless you initialize the `firebase` app yourself before initializing `next-firebase-auth`.

#### cookies

`Object`

Settings used for auth cookies. We use [`cookies`](https://github.com/pillarjs/cookies) to manage cookies.

Properties include:

- `name`: Used as a base for cookie names: if `name` is set to "MyExample", cookies will be named `MyExample.AuthUser` and `MyExample.AuthUserTokens` (plus `MyExample.AuthUser.sig` and `MyExample.AuthUserTokens.sig` if cookies are signed). **Required.**
- `keys`: An array of strings that will be used to sign cookies; for instance, `['xD$WVv3qrP3ywY', '2x6#msoUeNhVHr']`. As these strings are secrets, provide them via secret environment variables, such as `[ process.env.COOKIE_SECRET_CURRENT, process.env.COOKIE_SECRET_PREVIOUS ]`. The `keys` array is passed to the [Keygrip](https://www.npmjs.com/package/keygrip) constructor as described in [the `cookies` package](https://github.com/pillarjs/cookies#cookies--new-cookies-request-response--options--). **Required** unless `signed` is set to `false`.
- [All options for `cookies.set`](https://github.com/pillarjs/cookies#cookiesset-name--value---options--).

The `keys` value cannot be defined on the client side and should live in a secret environment variable.

For security, the `maxAge` value must be two weeks or less. Note that `maxAge` is defined in milliseconds.

> **Note:** The cookies' expirations will be extended automatically when the user loads the Firebase JS SDK.
>
> The Firebase JS SDK is the source of truth for authentication, so if the cookies expire but the user is still authed with Firebase, the cookies will be automatically set again when the user loads the Firebase JS SDK—but the user will not be authed during SSR on that first request.

#### onVerifyTokenError

_Added in v0.14.0_

`Function` (optional)

Error handler that will be called if there's an unexpected error while verifying the user's ID token server side. It will receive a [Firebase auth error](https://firebase.google.com/docs/reference/node/firebase.auth.Error).

This library will **not** throw when it cannot verify an ID token. Instead, it will provide an unauthenticated user to the app. It will typically handle common auth-related errors such as `auth/id-token-expired` and `auth/user-disabled` without throwing. See [#366](https://github.com/gladly-team/next-firebase-auth/issues/366) and [#174](https://github.com/gladly-team/next-firebase-auth/issues/174) for additional background.

#### onTokenRefreshError

_Added in v0.14.0_

`Function` (optional)

Error handler that will be called if there's an unexpected error while refreshing the user's ID token server side.

This library will **not** throw when it cannot refresh an ID token. Instead, it will provide an unauthenticated user to the app. See [#366](https://github.com/gladly-team/next-firebase-auth/issues/366) and [#174](https://github.com/gladly-team/next-firebase-auth/issues/174) for additional background.

## Types

### AuthAction

Defines actions to take depending on a user's auth status, using the following constants:

**`AuthAction.RENDER`**: render the child component

**`AuthAction.SHOW_LOADER`**: show a loader component

**`AuthAction.RETURN_NULL`**: return null instead of any component

**`AuthAction.REDIRECT_TO_LOGIN`**: redirect to the login page

**`AuthAction.REDIRECT_TO_APP`**: redirect to the app

### AuthUser

The auth user object is used across server-side and client-side contexts. This is a normalized representation of a Firebase user.

**id** - `String|null`

The Firebase user's ID, or null if the user is not authenticated.

**email** - `String|null`

The Firebase user's email address, or null if the user has no email address.

**emailVerified** - `Boolean`

Whether the user's email address is verified.

**phoneNumber** - `String|null`

_Added in v0.13.1_

The Firebase user's phone number, or null if the user has no phone number.

**displayName** - `String|null`

_Added in v0.13.1_

The Firebase user's display name, or null if the user has no display name.

**photoURL** - `String|null`

_Added in v0.13.1_

The Firebase user's photo URL, or null if the user has no photo URL.

**claims** - `Object`

_Added in v0.13.0_

Any [custom Firebase claims](https://firebase.google.com/docs/auth/admin/custom-claims#set_and_validate_custom_user_claims_via_the_admin_sdk).

**getIdToken** - `Function => Promise<String|null>`

An async function that resolves to a valid Firebase ID token string, or null if no valid token is available.

**clientInitialized** - `Boolean`

Whether the Firebase JS SDK has initialized. If `true`, we are no longer using any user info from server-side props.

**firebaseUser** - [`FirebaseUser`](https://firebase.google.com/docs/reference/js/firebase.User)`|null`

The user from the Firebase JS SDK, if it has been initialized. Otherwise, null.

**signOut** - `Function => Promise<void>`

A method that calls Firebase's [`signOut`](https://firebase.google.com/docs/reference/js/firebase.auth.Auth#signout) if the Firebase JS SDK has been initialized. If the SDK has not been initialized, this method is a no-op.

### PageURL

`String|Function|Object`

Used in `appPageURL` and `authPageURL` in the config and higher-order components, the PageURL defines a redirect destination URL or path.

It can be a string: `/my-url/here/`

Or an object:

```javascript
{
  destination: '/my-url/here/', // Required string: the URL destination of a redirect
  basePath: true, // Optional boolean (defaults to true): whether to use the Next.js base path.
}
```

Or a function that receives `{ ctx, AuthUser }` and returns a string or RedirectObject:

```javascript
const redirect = ({ ctx, AuthUser }) => {
  // any custom logic here
  return `/my-url/here/?username=${AuthUser.displayName}`
}
```

The `ctx` is the [Next.js context value](https://nextjs.org/docs/basic-features/data-fetching#getserversideprops-server-side-rendering) if server side, or undefined if client side.

## Examples

- [Adding a private key to Vercel](#adding-a-private-key-to-Vercel)
- [Using the Firebase Apps](#using-the-firebase-apps)
- [TypeScript](#typescript)
- [Dynamic Redirects](#dynamic-redirects)
- [Testing and Mocking with Jest](#testing-and-mocking-with-jest)

### Adding a private key to Vercel

There are various ways to add your Firebase private key as an environment variable to Vercel.

**Vercel console**

In the [Vercel console](https://vercel.com/docs/concepts/projects/environment-variables), add the private key in double quotes (screenshot [here](https://github.com/gladly-team/next-firebase-auth/issues/212)).

Then, use the private key in your `next-firebase-auth` config, in the `firebaseAdminInitConfig.credential.privateKey` property:

```javascript
privateKey: process.env.FIREBASE_PRIVATE_KEY
```

**Vercel CLI**

Via the Vercel CLI, add the private key _with double quotes_:

`vercel secrets add firebase-private-key '"my-key-here"'`

Then, use `JSON.parse` in the `firebaseAdminInitConfig.credential.privateKey` property:

```javascript
privateKey: process.env.FIREBASE_PRIVATE_KEY
  ? JSON.parse(process.env.FIREBASE_PRIVATE_KEY)
  : undefined
```

**Alternative formatting**

Others have taken different approaches to deal with escaped newline characters in the private key; for example, by [using string replacement](https://stackoverflow.com/a/50376092). This discussion includes other approaches: [discussion #95](https://github.com/gladly-team/next-firebase-auth/discussions/95)

### Using the Firebase Apps

You may want to access the Firebase admin module or Firebase JS SDK.

To use the Firebase admin module, you can use [`getFirebaseAdmin`](#getfirebaseadmin--firebaseadmin). (If you prefer, you can instead choose to initialize Firebase yourself _prior_ to initializing `next-firebase-auth`. [Here's some example code](https://github.com/gladly-team/next-firebase-auth/discussions/61#discussioncomment-323977) with this pattern.)

To use the Firebase JS SDK, simply import Firebase as you normally would. For example:

```jsx
import firebase from 'firebase/app'
import 'firebase/firestore'
import { useEffect } from 'react'

const Artists = () => {
  const [artists, setArtists] = useState(artists)

  useEffect(() => {
    return firebase
      .firestore()
      .collection('artists')
      .onSnapshot((snap) => {
        if (!snap) {
          return
        }
        setArtists(snap.docs.map((doc) => ({ ...doc.data(), key: doc.id })))
      })
  }, [])

  return (
    <div>
      {artists.map((artist) => (
        <div>{artist.name}</div>
      ))}
    </div>
  )
}
```

### TypeScript

When using `withAuthUser` with TypeScript, use [TypeScript Generics](https://www.typescriptlang.org/docs/handbook/2/generics.html). For example:

```TypeScript
// /pages/demo.tsx
import { VFC } from 'react'
import { Loading } from 'components/Loading/Loading'
import { AuthAction, withAuthUser } from 'next-firebase-auth'

type DemoDataType = {
  name: string
}

const Demo: VFC<DemoDataType> = ({ name }) => {
  return <div>Hello {name}!</div>
}

export default withAuthUser<DemoDataType>({ // <--- Ensure that the type is provided
  whenUnauthedBeforeInit: AuthAction.SHOW_LOADER,
  whenUnauthedAfterInit: AuthAction.REDIRECT_TO_LOGIN,
  LoaderComponent: Loading,
})(Demo)
```

For a full example with server-side data fetching, see the [TypeScript demo page](https://github.com/gladly-team/next-firebase-auth/blob/main/example/pages/ssr-no-token.tsx) in the example app.

### Dynamic Redirects

This package makes it easy to redirect to a login page or app page depending on whether a user is logged in. The destination URLs can also be dynamic: the [PageURL](#pageurl) can be a function that returns the URL at runtime.

The [example app](https://github.com/gladly-team/next-firebase-auth/tree/main/example) uses this to set a post-login destination URL:

```js
// ./utils/initAuth.js
import { init } from 'next-firebase-auth'
import absoluteUrl from 'next-absolute-url'

const initAuth = () => init({
  // This demonstrates setting a dynamic destination URL when
  // redirecting from app pages. Alternatively, you can simply
  // specify `authPageURL: '/auth-ssr'`.
  authPageURL: ({ ctx }) => {
    const isServerSide = typeof window === 'undefined'
    const origin = isServerSide
      ? absoluteUrl(ctx.req).origin
      : window.location.origin
    const destPath =
      typeof window === 'undefined' ? ctx.resolvedUrl : window.location.href
    const destURL = new URL(destPath, origin)
    return `auth-ssr?destination=${encodeURIComponent(destURL)}`
  },

  // This demonstrates setting a dynamic destination URL when
  // redirecting from auth pages. Alternatively, you can simply
  // specify `appPageURL: '/'`.
  appPageURL: ({ ctx }) => {
    const isServerSide = typeof window === 'undefined'
    const origin = isServerSide
      ? absoluteUrl(ctx.req).origin
      : window.location.origin
    const params = isServerSide
      ? new URL(ctx.req.url, origin).searchParams
      : new URLSearchParams(window.location.search)
    const destinationParamVal = params.get('destination')
      ? decodeURIComponent(params.get('destination'))
      : undefined

    // By default, go to the index page if the destination URL
    // is invalid or unspecified.
    let destURL = '/'
    if (destinationParamVal) {
      // Verify the redirect URL host is allowed.
      // https://owasp.org/www-project-web-security-testing-guide/v41/4-Web_Application_Security_Testing/11-Client_Side_Testing/04-Testing_for_Client_Side_URL_Redirect
      const allowedHosts = ['localhost:3000', 'nfa-example.vercel.app']
      const allowed =
        allowedHosts.indexOf(new URL(destinationParamVal).host) > -1
      if (allowed) {
        destURL = destinationParamVal
      } else {
        // eslint-disable-next-line no-console
        console.warn(
          `Redirect destination host must be one of ${allowedHosts.join(
            ', '
          )}.`
        )
      }
    }
    return destURL
  },

  // ... other config
}

export default initAuth
```

### Testing and Mocking with Jest

To test components wrapped with functions from `next-firebase-auth`, you will likely want to mock the `next-firebase-auth` library. This can be achieved using the [manual mocks feature of Jest](https://jestjs.io/docs/manual-mocks#mocking-node-modules).

It can be helpful to define the default mock behavior of `next-firebase-auth` across your tests. To do so, stub out the module in a top-level `__mocks__` folder (alongside the `node_modules` in your application):

```
├── __mocks__
│   └── next-firebase-auth
│       └── index.js
├── node_modules
│   └── ... all your deps
├── src
│   └── ... all your source code
```

In `index.js`, export a mock of `next-firebase-auth`:

```javascript
const { AuthAction } = require('next-firebase-auth')
const NFAMock = jest.createMockFromModule('next-firebase-auth')

module.exports = {
  ...NFAMock,
  // Customize any mocks as needed.
  init: jest.fn(),
  // For example, in tests, this will automatically render the child component of
  // `withAuthUser`.
  withAuthUser: jest.fn(() => (wrappedComponent) => wrappedComponent),
  useAuthUser: jest.fn(() => ({
    // ... you could return a default AuthUser here
  }),
  AuthAction,
}
```

See our implementation of this in our [tab-web repository](https://github.com/gladly-team/tab-web/tree/master/__mocks__/next-firebase-auth) for a more robust example.

You will also likely want to have a utility to mock the `AuthUser` object that is passed around via the hooks and higher-order functions in `next-firebase-auth`. You might put this in a `utils` folder in your app.

```javascript
// Create a mock FirebaseUser instance with the fields that you use.
const mockFirebaseUser = {
  displayName: 'Banana Manana',
  // ... other fields from firebaseUser that you may use
}

/**
 * Build and return a dummy AuthUser instance to use in tests.
 *
 * @arg {boolean} isLoggedIn - Pass `false` to mimic a logged out user.
 * @returns {AuthUserContext} - A mocked AuthUser instance, with 'serialize' added.
 */
const getMockAuthUser = (isLoggedIn = true) => ({
  id: isLoggedIn ? 'abcd1234' : null,
  email: isLoggedIn ? 'banana@banana.com' : null,
  emailVerified: isLoggedIn,
  getIdToken: jest.fn(async () => (isLoggedIn ? 'i_am_a_token' : null)),
  clientInitialized: isLoggedIn,
  firebaseUser: isLoggedIn ? mockFirebaseUser : null,
  signOut: jest.fn(),
  serialize: jest.fn(() => 'serialized_auth_user'),
})

export default getMockAuthUser
```

Now, you can use and customize the mock behavior in your tests.

If you're modifying higher-order functions, components being tested need to be `required` inside a `beforeEach` function or each test case. This is because mocking `next-firebase-auth` has to happen _before_ your component is imported, because the call to the `next-firebase-auth` function is part of the default export of your component (e.g., `export default withAuthUser()(MyComponent)`).

Given the following component:

```javascript
import React from 'react'
import { useAuthUser, withAuthUser } from 'next-firebase-auth'

function UserDisplayName() {
  const AuthUser = useAuthUser()
  const { displayName = 'anonymous' } = AuthUser.firebaseUser
  return <span>{displayName}</span>
}

export default withAuthUser()(UserDisplayName)
```

you can write a test suite like this:

```javascript
import { render, screen } from '@testing-library/react'

// Import the functions that the component module calls, which allows jest to mock them
// in the context of this test run. This allows you to manipulate the return value of each
// function within this test suite.
import { useAuthUser, withAuthUser } from 'next-firebase-auth'

// Import your mock AuthUser generator
import getMockAuthUser from '../../utils/test-utils/get-mock-auth-user'

// Mock all of `next-firebase-auth`. This is *not* necessary if you set up manual mocks,
// because Jest will automatically mock the module in every test.
jest.mock('next-firebase-auth')

describe('UserDisplayName', () => {

  // Create a placeholder for your component that you want to test
  let UserDisplayName

  beforeEach(() => {
    // Mock the functions that your component uses, and import your component before each test.
    useAuthUser.mockReturnValue(getMockAuthUser())
    withAuthUser.mockImplementation(() => (wrappedComponent) => wrappedComponent))
    UserDisplayName = require('./').default
  })

  afterAll(() => {
    // Reset the mocks so that they don't bleed into the next test suite.
    jest.resetAllMocks()
  })

  it('renders the logged in user\'s display name', () => {
    // The default value for the mocked implementation of `withAuthUser` is a fully logged in and verified
    // user. Rendering your component directly with the setup above will result in a "logged in" user being
    // passed to your component.
    render(<UserDisplayName />)
    expect(screen.queryByTest(getMockAuthUser().firebaseUser.displayName)).toBeInTheDocument()
  })

  it('renders "anonymous" when user is not logged in', () => {
    // If you want to test a "logged out" state, then you can mock the function again inside any test,
    // passing a falsy value to `getMockAuthUser`, which will return a logged out AuthUser object.
    useAuthUser.mockReturnValue(getMockAuthUser(false))
    render(<Header />)
    expect(screen.getByText('anonymous')).toBeInTheDocument()
  })
})
```

#### Mocks and Typescript

When using TypeScript for your test files, you will have to cast the mocked functions to get access to the `mockImplementation` and `mockReturnValue` methods. If we were to rewrite the above example in TS, it might look something like this:

```typescript
import type { ComponentType } from 'react'
import { render, screen } from '@testing-library/react'

// Import the functions that the component module calls, which allows jest to mock them
// in the context of this test run. This allows you to manipulate the return value of each
// function within this test suite.
import { useAuthUser, withAuthUser } from 'next-firebase-auth'

// Import your mock AuthUser generator
import getMockAuthUser from '../../utils/test-utils/get-mock-auth-user'

// Mock all of `next-firebase-auth`. This is *not* necessary if you set up manual mocks,
// because Jest will automatically mock the module
jest.mock('next-firebase-auth')

describe('UserDisplayName', () => {

  // Create a placeholder for your component that you want to test
  let UserDisplayName: ComponentType

  beforeEach(() => {
    // Mock the functions that your component uses, and import your component before each test.
    (useAuthUser as jest.Mock).mockReturnValue(getMockAuthUser())
    (withAuthUser as jest.Mock).mockImplementation(() => (wrappedComponent: ComponentType) => wrappedComponent: ComponentType))
    UserDisplayName = require('./').default as ComponentType
  })

  afterAll(() => {
    // Reset the mocks so that they don't bleed into the next test suite.
    jest.resetAllMocks()
  })

  it('renders the logged in user\'s display name', () => {
    // The default value for the mocked implementation of `withAuthUser` is a fully logged in and verified
    // user. Rendering your component directly with the setup above will result in a "logged in" user being
    // passed to your component.
    render(<UserDisplayName />)
    expect(screen.getByText(getMockAuthUser().firebaseUser.displayName)).toBeInTheDocument()
  })

  it('renders "anonymous" when user is not logged in', () => {
    // If you want to test a "logged out" state, then you can mock the function again inside any test,
    // passing a falsy value to `getMockAuthUser`, which will return a logged out AuthUser object.
    (useAuthUser as jest.Mock).mockReturnValue(getMockAuthUser(false))
    render(<Header />)
    expect(screen.getByText('anonymous')).toBeInTheDocument()
  })
})
```

## Troubleshooting

_Stuck? Search [discussions](https://github.com/gladly-team/next-firebase-auth/discussions) or open your own Q&A discussion describing what you've already tried._

#### I get the error "[Some setting] should not be available on the client side."

We expect certain sensitive config values to be falsy on the client side (see the [config validation code](https://github.com/gladly-team/next-firebase-auth/blob/main/src/config.js)). This is a precaution to make sure developers aren't accidentally bundling something like their Firebase private key with client JS.

To fix this, ensure the config setting is `undefined` on the client side by logging it to your browser console. You can use Next's `.env` support to set server-only variables. Never use the `NEXT_PUBLIC*` prefix for any secret values.

#### I get an "INVALID_CUSTOM_TOKEN" error when trying to get a refresh token.

This package will call [a Google endpoint](https://firebase.google.com/docs/reference/rest/auth#section-verify-custom-token) when it needs to refresh a token server side. You're seeing an error from that request.

To fix this, confirm that your `firebaseAdminInitConfig.credential.clientEmail` is correct. It should be the email paired with your Firebase private key.

If that doesn't help, try inspecting the custom token to manually validate the values and structure. Some people encounter this problem [when their server time is incorrect](https://github.com/firebase/php-jwt/issues/127#issuecomment-291862337).

#### Server-side auth is not working. The user and token are always null when using `withAuthUserTokenSSR`, but client-side auth works.

If auth is working on the client side but not on the server side, the auth cookies are most likely not set.

To fix this, confirm the auth cookies are set in your browser's dev tools. If they're not set, please check that the `secure`, `sameSite`, and `path` options passed in the `next-firebase-auth` config make sense for your environment. For example, if you're testing on non-HTTPS localhost, make sure `secure` is false.

In addition, please double-check your server logs for any errors to ensure the Firebase admin app is initializing properly.

#### I get an "auth/argument-error" with message "Firebase ID token has invalid signature".

Often, this is caused by an incorrect email in Firebase credentials. Please verify that the email is correct and is from the same Firebase account as your private key, or try generating a new key:
https://firebase.google.com/docs/admin/setup

You can try setting up your credentials in [the example app](https://github.com/gladly-team/next-firebase-auth/tree/main/example) to be sure your app code isn't a problem.

In local development, try clearing data/cookies for `localhost` in case you previously signed in with another Firebase account and still have auth cookies signed by another private key.

You can also try disabling the Firebase Authentication Emulator. Remove `firebaseAuthEmulatorHost` from your config and remove `FIREBASE_AUTH_EMULATOR_HOST` from your `.env` file.

#### I get the error, "Failed to parse private key: Error: Invalid PEM formatted message."

See [adding a private key to Vercel](#adding-a-private-key-to-Vercel) and [this discussion](https://github.com/gladly-team/next-firebase-auth/discussions/95) on private key formatting.

## Limitations & Feedback

We expect some apps will need some features that are not currently available:

- **Supporting custom session logic:** Currently, this package doesn't allow using a custom cookie or session module. Some developers may need this flexibility to, for example, keep auth user data in server-side session storage.
- **Setting a single auth cookie:** This package currently sets more than one cookie to store authentication state. It's not currently possible to use a single cookie with a customized name: [#190](https://github.com/gladly-team/next-firebase-auth/issues/190)

We'd love to hear your feedback on these or other features. Please feel free to [open a discussion](https://github.com/gladly-team/next-firebase-auth/discussions)!

## Contributing

We welcome contributions! Please see [contributing docs](./CONTRIBUTING.md) to get started.
