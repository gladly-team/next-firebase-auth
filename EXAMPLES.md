# Examples

- [Adding a private key to Vercel](#adding-a-private-key-to-Vercel)
- [Using the Firebase Apps](#using-the-firebase-apps)
- [Getting the user in an API route](#getting-the-user-in-an-api-route)
- [Getting the user in a standalone backend environment](#getting-the-user-in-a-standalone-backend-environment)
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

To use the Firebase admin package or Firebase JS SDK elsewhere in your app, simply import them as you normally would.

For example:

```jsx
import { getApp } from 'firebase/app'
import { getFirestore, collection, onSnapshot } from 'firebase/firestore'
import { useEffect } from 'react'

const Artists = () => {
  const [artists, setArtists] = useState(artists)

  useEffect(() => {
    return onSnapshot(collection(getFirestore(getApp()), 'artists'), (snap) => {
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

Or for the admin app:

```js
import { getAuth } from 'firebase-admin/auth'
import { init } from 'next-firebase-auth'

// Make sure NFA is initialized for any API routes, too.
init({
  // ... config
})

const myCode = () => {
  const auth = getAuth()
  // ...
}
```


As a convenience, `next-firebase-auth` initializes the default Firebase admin app and default Firebase JS SDK app if they haven't already been initialized. However, if you prefer, you can choose to initialize Firebase yourself _prior_ to initializing `next-firebase-auth`.

### Getting the user in an API route

You can easily get the user in an API route by using [verifyIdToken](#verifyidtokentoken--promiseuser) or [getUserFromCookies](#getuserfromcookies-options-). The demo app has an [example API route](https://github.com/gladly-team/next-firebase-auth/blob/v1.x/example/pages/api/example.js).

### Getting the user in a standalone backend environment

Your app might need to authenticate the user in another server-side environment that's separate from your Next.js app, such as an API service or another server-side rendered stack. This is straightforward with `next-firebase-auth`.

To do so:

1. Install dependencies
   - `yarn add next-firebase-auth firebase-admin`
   - Other peer dependencies are not required
2. Ensure your environment supports `fetch`
   - Next.js ships with a global `fetch` polyfill, but your environment might not have it.
   - If `fetch` is not defined in your backend, add a polyfill using `node-fetch`: [documentation here](https://github.com/node-fetch/node-fetch#providing-global-access)
3. Initialize `next-firebase-auth` as you normally would
   - Ensure your Firebase admin and cookies settings exactly match the settings you're using in Next.js or elsewhere.
4. All set! Use `verifyIdToken` or `getUserFromCookies` as needed.


A small example:

```js
// my-api-module.js

import { init, getUserFromCookies } from 'next-firebase-auth'

// Adding `fetch` to a server environment that doesn't have it:
// https://github.com/node-fetch/node-fetch#providing-global-access
import './fetch-polyfill'


init({
  // ... config
})

const myApiHandler = ({ req }) => {
  const user = await getUserFromCookies({
    req,
    includeToken: true,
  })
  // ... other logic

  return {
    // whatever
  }
}

export default myApiHandler

```

### TypeScript

See the [TypeScript demo page](https://github.com/gladly-team/next-firebase-auth/blob/main/example/pages/ssr-no-token.tsx) in the example app.

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
  // `withUser`.
  withUser: jest.fn(() => (wrappedComponent) => wrappedComponent),
  useUser: jest.fn(() => ({
    // ... you could return a default user here
  }),
  AuthAction,
}
```

See our implementation of this in our [tab-web repository](https://github.com/gladly-team/tab-web/tree/master/__mocks__/next-firebase-auth) for a more robust example.

You will also likely want to have a utility to mock the `user` object that is passed around via the hooks and higher-order functions in `next-firebase-auth`. You might put this in a `utils` folder in your app.

```javascript
// Create a mock FirebaseUser instance with the fields that you use.
const mockFirebaseUser = {
  displayName: 'Banana Manana',
  // ... other fields from firebaseUser that you may use
}

/**
 * Build and return a dummy User instance to use in tests.
 *
 * @arg {boolean} isLoggedIn - Pass `false` to mimic a logged out user.
 * @returns {UserContext} - A mocked User instance, with 'serialize' added.
 */
const getMockUser = (isLoggedIn = true) => ({
  id: isLoggedIn ? 'abcd1234' : null,
  email: isLoggedIn ? 'banana@banana.com' : null,
  emailVerified: isLoggedIn,
  getIdToken: jest.fn(async () => (isLoggedIn ? 'i_am_a_token' : null)),
  clientInitialized: isLoggedIn,
  firebaseUser: isLoggedIn ? mockFirebaseUser : null,
  signOut: jest.fn(),
  serialize: jest.fn(() => 'serialized_auth_user'),
})

export default getMockUser
```

Now, you can use and customize the mock behavior in your tests.

If you're modifying higher-order functions, components being tested need to be `required` inside a `beforeEach` function or each test case. This is because mocking `next-firebase-auth` has to happen _before_ your component is imported, because the call to the `next-firebase-auth` function is part of the default export of your component (e.g., `export default withUser()(MyComponent)`).

Given the following component:

```javascript
import React from 'react'
import { useUser, withUser } from 'next-firebase-auth'

function UserDisplayName() {
  const user = useUser()
  const { displayName = 'anonymous' } = user.firebaseUser
  return <span>{displayName}</span>
}

export default withUser()(UserDisplayName)
```

you can write a test suite like this:

```javascript
import { render, screen } from '@testing-library/react'

// Import the functions that the component module calls, which allows jest to mock them
// in the context of this test run. This allows you to manipulate the return value of each
// function within this test suite.
import { useUser, withUser } from 'next-firebase-auth'

// Import your mock User generator
import getMockUser from '../../utils/test-utils/get-mock-auth-user'

// Mock all of `next-firebase-auth`. This is *not* necessary if you set up manual mocks,
// because Jest will automatically mock the module in every test.
jest.mock('next-firebase-auth')

describe('UserDisplayName', () => {

  // Create a placeholder for your component that you want to test
  let UserDisplayName

  beforeEach(() => {
    // Mock the functions that your component uses, and import your component before each test.
    useUser.mockReturnValue(getMockUser())
    withUser.mockImplementation(() => (wrappedComponent) => wrappedComponent))
    UserDisplayName = require('./').default
  })

  afterAll(() => {
    // Reset the mocks so that they don't bleed into the next test suite.
    jest.resetAllMocks()
  })

  it('renders the logged in user\'s display name', () => {
    // The default value for the mocked implementation of `withUser` is a fully logged in and verified
    // user. Rendering your component directly with the setup above will result in a "logged in" user being
    // passed to your component.
    render(<UserDisplayName />)
    expect(screen.queryByTest(getMockUser().firebaseUser.displayName)).toBeInTheDocument()
  })

  it('renders "anonymous" when user is not logged in', () => {
    // If you want to test a "logged out" state, then you can mock the function again inside any test,
    // passing a falsy value to `getMockUser`, which will return a logged out user.
    useUser.mockReturnValue(getMockUser(false))
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
import { useUser, withUser } from 'next-firebase-auth'

// Import your mock User generator
import getMockUser from '../../utils/test-utils/get-mock-auth-user'

// Mock all of `next-firebase-auth`. This is *not* necessary if you set up manual mocks,
// because Jest will automatically mock the module
jest.mock('next-firebase-auth')

describe('UserDisplayName', () => {

  // Create a placeholder for your component that you want to test
  let UserDisplayName: ComponentType

  beforeEach(() => {
    // Mock the functions that your component uses, and import your component before each test.
    (useUser as jest.Mock).mockReturnValue(getMockUser())
    (withUser as jest.Mock).mockImplementation(() => (wrappedComponent: ComponentType) => wrappedComponent: ComponentType))
    UserDisplayName = require('./').default as ComponentType
  })

  afterAll(() => {
    // Reset the mocks so that they don't bleed into the next test suite.
    jest.resetAllMocks()
  })

  it('renders the logged in user\'s display name', () => {
    // The default value for the mocked implementation of `withUser` is a fully logged in and verified
    // user. Rendering your component directly with the setup above will result in a "logged in" user being
    // passed to your component.
    render(<UserDisplayName />)
    expect(screen.getByText(getMockUser().firebaseUser.displayName)).toBeInTheDocument()
  })

  it('renders "anonymous" when user is not logged in', () => {
    // If you want to test a "logged out" state, then you can mock the function again inside any test,
    // passing a falsy value to `getMockUser`, which will return a logged out user.
    (useUser as jest.Mock).mockReturnValue(getMockUser(false))
    render(<Header />)
    expect(screen.getByText('anonymous')).toBeInTheDocument()
  })
})
```
