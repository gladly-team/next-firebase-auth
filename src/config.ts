import * as Cookies from 'cookies'
import type { User } from 'firebase/auth'
import type { ParsedUrlQuery } from 'querystring'

import isClientSide from 'src/isClientSide'
import logDebug from 'src/logDebug'
import type { GetServerSidePropsContext } from 'next'

// TODO: move these types to other modules
interface AuthUser {
  id: string | null
  email: string | null
  emailVerified: boolean
  phoneNumber: string | null
  displayName: string | null
  photoURL: string | null
  claims: Record<string, string | boolean>
  getIdToken: (forceRefresh?: boolean) => Promise<string | null>
  clientInitialized: boolean
  firebaseUser: User | null
  signOut: () => Promise<void>
}

type URLResolveFunction = (obj: {
  ctx: GetServerSidePropsContext<ParsedUrlQuery>
  AuthUser: AuthUser
}) => string | RedirectObject

type RedirectObject = {
  destination: string | URLResolveFunction
  basePath: boolean
}

type PageURL = string | RedirectObject | URLResolveFunction

type OnErrorHandler = (error: Error) => void

// https://github.com/gladly-team/next-firebase-auth#config
export interface ConfigInput {
  /**
   * The redirect destination URL when redirecting to the login page.
   */
  authPageURL?: PageURL
  /**
   * The redirect destination URL when redirecting to the app.
   */
  appPageURL?: PageURL
  /**
   * The API endpoint to call on auth state change for an authenticated user.
   */
  loginAPIEndpoint?: string
  /**
   * The API endpoint to call on auth state change for a signed-out user.
   */
  logoutAPIEndpoint?: string
  /**
   * Handler called if there are unexpected errors while verifying the user's
   * ID token server-side.
   */
  onVerifyTokenError?: OnErrorHandler
  /**
   * Handler called if there are unexpected errors while refreshing the
   * user's ID token server-side.
   */
  onTokenRefreshError?: OnErrorHandler
  /**
   * A handler to call on auth state changes. More info:
   * https://github.com/gladly-team/next-firebase-auth#tokenchangedhandler
   */
  tokenChangedHandler?: (user: AuthUser) => void
  /**
   * Handler called if the login API endpoint returns a non-200 response.
   * Not used if a custom "tokenChangedHandler" is defined. If a handler is
   * not defined, this library will throw on any non-200 responses.
   */
  onLoginRequestError?: OnErrorHandler
  /**
   * Handler called if the logout API endpoint returns a non-200 response. Not
   * used if a custom "tokenChangedHandler" is defined. If a handler is not
   * defined, this library will throw on any non-200 responses.
   */
  onLogoutRequestError?: OnErrorHandler
  /**
   * Whether to use application default credentials with firebase-admin.
   */
  useFirebaseAdminDefaultCredential?: boolean
  /**
   * The config passed to the Firebase admin SDK's `initializeApp`. Not
   * required if your app manually is initializing the admin SDK elsewhere.
   */
  firebaseAdminInitConfig?: {
    credential: {
      projectId: string
      clientEmail: string
      privateKey: string
    }
    databaseURL?: string
  }
  /**
   * The Firebase auth emulator host address on the user's machine. Must match
   * the value of the `FIREBASE_AUTH_EMULATOR_HOST` environment variable.
   * https://firebase.google.com/docs/emulator-suite/connect_auth
   */
  firebaseAuthEmulatorHost?: string
  /**
   * The config passed to the Firebase client JS SDK's `initializeApp`.
   */
  firebaseClientInitConfig: {
    apiKey: string
    projectId?: string
    appId?: string
    // "PROJECT_ID.firebaseapp.com"
    authDomain?: string
    // "https://PROJECT_ID.firebaseio.com"
    databaseURL?: string
    // "PROJECT_ID.appspot.com"
    storageBucket?: string
    // "SENDER_ID"
    messagingSenderId?: string
    // "G-MEASUREMENT_ID"
    measurementId?: string
  }
  cookies: Omit<Cookies.Option & Cookies.SetOption, 'sameSite'> & {
    // The base name for the auth cookies.
    name: string
    sameSite: string
  }
  /**
   * When true, will log events.
   */
  debug?: boolean
}

let config: ConfigMerged

const ONE_WEEK_IN_MS = 7 * 60 * 60 * 24 * 1000
const TWO_WEEKS_IN_MS = 14 * 60 * 60 * 24 * 1000

const defaultConfig = {
  debug: false,
  // eslint-disable-next-line @typescript-eslint/no-empty-function, @typescript-eslint/no-unused-vars
  onVerifyTokenError: (_err: Error) => {},
  // eslint-disable-next-line @typescript-eslint/no-empty-function, @typescript-eslint/no-unused-vars
  onTokenRefreshError: (_err: Error) => {},
  cookies: {
    // Required to be provided by the user.
    // name: undefined,
    httpOnly: true,
    maxAge: ONE_WEEK_IN_MS,
    overwrite: true,
    path: '/',
    sameSite: 'strict',
    secure: true,
    signed: true,
  },
}

type ConfigDefault = typeof defaultConfig

// TODO: move to helper module

// Spread operator for types
// https://stackoverflow.com/a/49683575/1332513
type OptionalPropertyNames<T> = {
  // eslint-disable-next-line @typescript-eslint/ban-types
  [K in keyof T]-?: {} extends { [P in K]: T[K] } ? K : never
}[keyof T]

type SpreadProperties<L, R, K extends keyof L & keyof R> = {
  [P in K]: L[P] | Exclude<R[P], undefined>
}

type Id<T> = T extends infer U ? { [K in keyof U]: U[K] } : never

type SpreadTwo<L, R> = Id<
  Pick<L, Exclude<keyof L, keyof R>> &
    Pick<R, Exclude<keyof R, OptionalPropertyNames<R>>> &
    Pick<R, Exclude<OptionalPropertyNames<R>, keyof L>> &
    SpreadProperties<L, R, OptionalPropertyNames<R> & keyof L>
>

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type Spread<A extends readonly [...any]> = A extends [infer L, ...infer R]
  ? SpreadTwo<L, Spread<R>>
  : unknown

type ConfigMerged = Omit<Spread<[ConfigInput, ConfigDefault]>, 'cookies'> & {
  cookies: Spread<[ConfigInput['cookies'], ConfigDefault['cookies']]>
}

const validateConfig = (mergedConfig: ConfigMerged) => {
  const errorMessages = []

  // The config should have *either* a tokenChangedHandler *or* other
  // settings for login/logout.
  if (mergedConfig.tokenChangedHandler) {
    if (mergedConfig.loginAPIEndpoint) {
      errorMessages.push(
        'The "loginAPIEndpoint" setting should not be set if you are using a "tokenChangedHandler".'
      )
    }
    if (mergedConfig.logoutAPIEndpoint) {
      errorMessages.push(
        'The "logoutAPIEndpoint" setting should not be set if you are using a "tokenChangedHandler".'
      )
    }
    if (mergedConfig.onLoginRequestError) {
      errorMessages.push(
        'The "onLoginRequestError" setting should not be set if you are using a "tokenChangedHandler".'
      )
    }
    if (mergedConfig.onLogoutRequestError) {
      errorMessages.push(
        'The "onLogoutRequestError" setting should not be set if you are using a "tokenChangedHandler".'
      )
    }
  }

  // Require the public API key, which we use on the backend when
  // managing tokens.
  if (
    !(
      mergedConfig.firebaseClientInitConfig &&
      mergedConfig.firebaseClientInitConfig.apiKey
    )
  ) {
    errorMessages.push(
      `The "firebaseClientInitConfig.apiKey" value is required.`
    )
  }

  // Make sure the host address is set correctly.
  if (
    mergedConfig.firebaseAuthEmulatorHost &&
    mergedConfig.firebaseAuthEmulatorHost.startsWith('http')
  ) {
    errorMessages.push(
      'The firebaseAuthEmulatorHost should be set without a prefix (e.g., localhost:9099)'
    )
  }

  // Ensure error handlers are functions or undefined.
  const funcOrUndefArr = ['function', 'undefined']
  if (funcOrUndefArr.indexOf(typeof mergedConfig.onVerifyTokenError) < 0) {
    errorMessages.push(
      'Invalid next-firebase-auth options: The "onVerifyTokenError" setting must be a function.'
    )
  }
  if (funcOrUndefArr.indexOf(typeof mergedConfig.onTokenRefreshError) < 0) {
    errorMessages.push(
      'Invalid next-firebase-auth options: The "onTokenRefreshError" setting must be a function.'
    )
  }
  if (funcOrUndefArr.indexOf(typeof mergedConfig.onLoginRequestError) < 0) {
    errorMessages.push(
      'Invalid next-firebase-auth options: The "onLoginRequestError" setting must be a function.'
    )
  }
  if (funcOrUndefArr.indexOf(typeof mergedConfig.onLogoutRequestError) < 0) {
    errorMessages.push(
      'Invalid next-firebase-auth options: The "onLogoutRequestError" setting must be a function.'
    )
  }

  // We consider cookie keys undefined if the keys are an empty string,
  // empty array, or array of only undefined values.
  const { keys } = mergedConfig.cookies
  const areCookieKeysDefined = Array.isArray(keys)
    ? keys.length &&
      (keys.filter ? keys.filter((item) => item !== undefined).length : true)
    : !!keys

  // Validate config values that differ between client and server context.
  if (isClientSide()) {
    /**
     * START: config specific to client side
     */
    if (!mergedConfig.tokenChangedHandler) {
      if (!mergedConfig.loginAPIEndpoint) {
        errorMessages.push('The "loginAPIEndpoint" setting is required.')
      }
      if (!mergedConfig.logoutAPIEndpoint) {
        errorMessages.push('The "logoutAPIEndpoint" setting is required.')
      }
    }

    if (
      mergedConfig.firebaseAdminInitConfig &&
      mergedConfig.firebaseAdminInitConfig.credential &&
      mergedConfig.firebaseAdminInitConfig.credential.privateKey
    ) {
      errorMessages.push(
        'The "firebaseAdminInitConfig" private key setting should not be available on the client side.'
      )
    }
    if (areCookieKeysDefined) {
      errorMessages.push(
        'The "cookies.keys" setting should not be available on the client side.'
      )
    }
    /**
     * END: config specific to client side
     */
  } else {
    /**
     * START: config specific to server side
     */
    if (!mergedConfig.cookies.name) {
      errorMessages.push(
        'The "cookies.name" setting is required on the server side.'
      )
    }

    // Verify that the AUTH_EMULATOR_HOST_VARIABLE is set if the user has
    // provided the emulator host in the config.
    if (mergedConfig.firebaseAuthEmulatorHost) {
      if (!process.env.FIREBASE_AUTH_EMULATOR_HOST) {
        errorMessages.push(
          'The "FIREBASE_AUTH_EMULATOR_HOST" environment variable should be set if you are using the "firebaseAuthEmulatorHost" option'
        )
      } else if (
        process.env.FIREBASE_AUTH_EMULATOR_HOST !==
        mergedConfig.firebaseAuthEmulatorHost
      ) {
        errorMessages.push(
          'The "FIREBASE_AUTH_EMULATOR_HOST" environment variable should be the same as the host set in the config'
        )
      }
    }

    // Limit the max cookie age to two weeks for security. This matches
    // Firebase's limit for user identity cookies:
    // https://firebase.google.com/docs/auth/admin/manage-cookies
    // By default, the cookie will be refreshed each time the user loads
    // the client-side app.
    if (
      !mergedConfig.cookies.maxAge ||
      mergedConfig.cookies.maxAge > TWO_WEEKS_IN_MS
    ) {
      errorMessages.push(
        `The "cookies.maxAge" setting must be less than two weeks (${TWO_WEEKS_IN_MS} ms).`
      )
    }
    /**
     * END: config specific to server side
     */
  }

  return {
    isValid: errorMessages.length === 0,
    errors: errorMessages,
  }
}

// Replace private values with "hidden" for safer logging during
// debugging.
const replacePrivateValues = (unredactedConfig: ConfigInput) => {
  const redactedConfig = {
    ...unredactedConfig,
    cookies: {
      ...unredactedConfig.cookies,
      keys: ['hidden'],
    },
    ...(unredactedConfig.firebaseAdminInitConfig && {
      firebaseAdminInitConfig: {
        ...unredactedConfig.firebaseAdminInitConfig,
        ...(unredactedConfig.firebaseAdminInitConfig.credential && {
          credential: {
            ...unredactedConfig.firebaseAdminInitConfig.credential,
            privateKey: 'hidden',
            clientEmail: 'hidden',
          },
        }),
      },
    }),
  }
  return redactedConfig
}

export const setConfig = (userConfig: ConfigInput) => {
  logDebug(
    '[init] Setting config with provided value:',
    replacePrivateValues(userConfig)
  )

  const { cookies: cookieOptions, ...otherUserConfig } = userConfig

  // Merge the user's config with the default config, validate it,
  // and set it.
  const mergedConfig = {
    ...defaultConfig,
    ...otherUserConfig,
    cookies: {
      ...defaultConfig.cookies,
      ...(cookieOptions || {}),
    },
  }
  const { isValid, errors } = validateConfig(mergedConfig)
  if (!isValid) {
    throw new Error(`Invalid next-firebase-auth options: ${errors.join(' ')}`)
  }
  config = mergedConfig
}

export const getConfig = () => {
  if (!config) {
    throw new Error('next-firebase-auth must be initialized before rendering.')
  }
  return config
}
