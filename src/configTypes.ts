import * as Cookies from 'cookies'
import { PageURL } from './redirectTypes'
import { AuthUser } from './createAuthUser'
import { Spread } from './Spread'

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

const ONE_WEEK_IN_MS = 7 * 60 * 60 * 24 * 1000

export const defaultConfig = {
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

export type ConfigDefault = typeof defaultConfig

export type ConfigMerged = Omit<
  Spread<[ConfigInput, ConfigDefault]>,
  'cookies'
> & {
  cookies: Spread<[ConfigInput['cookies'], ConfigDefault['cookies']]>
}
