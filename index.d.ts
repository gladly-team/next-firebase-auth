import * as Cookies from 'cookies'
import type Firebase from 'firebase'
import * as firebaseAdmin from 'firebase-admin'
import type {
  GetServerSidePropsContext,
  GetServerSidePropsResult,
  NextApiRequest,
  NextApiResponse,
} from 'next'
import type { ComponentType } from 'react'
import type { ParsedUrlQuery } from 'querystring'

export enum AuthAction {
  RENDER = 'render',
  SHOW_LOADER = 'showLoader',
  RETURN_NULL = 'returnNull',
  REDIRECT_TO_LOGIN = 'redirectToLogin',
  REDIRECT_TO_APP = 'redirectToApp',
}

export interface AuthUser {
  id: string | null
  email: string | null
  emailVerified: boolean
  phoneNumber: string | null
  displayName: string | null
  photoURL: string | null
  claims: Record<string, string | boolean>
  getIdToken: (forceRefresh?: boolean) => Promise<string | null>
  clientInitialized: boolean
  firebaseUser: Firebase.User | null
  signOut: () => Promise<void>
}

export type SSRPropsContext<Q extends ParsedUrlQuery = ParsedUrlQuery> =
  GetServerSidePropsContext<Q> & { AuthUser: AuthUser }

export type SSRPropGetter<
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  P extends { [key: string]: any } = { [key: string]: any },
  Q extends ParsedUrlQuery = ParsedUrlQuery
> = (context: SSRPropsContext<Q>) => Promise<GetServerSidePropsResult<P>>

interface AuthUserContext extends AuthUser {
  serialize: (opts?: { includeToken?: boolean }) => string
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

interface InitConfig {
  authPageURL?: PageURL
  appPageURL?: PageURL
  loginAPIEndpoint?: string
  logoutAPIEndpoint?: string
  onVerifyTokenError?: (error: unknown) => void
  onTokenRefreshError?: (error: unknown) => void
  tokenChangedHandler?: (user: AuthUser) => void
  onLoginRequestError?: (error: unknown) => void
  onLogoutRequestError?: (error: unknown) => void
  useFirebaseAdminDefaultCredential?: boolean
  firebaseAdminInitConfig?: {
    credential: {
      projectId: string
      clientEmail: string
      privateKey: string
    }
    databaseURL: string
  }
  firebaseAuthEmulatorHost?: string
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
  cookies: Cookies.Option &
    Cookies.SetOption & {
      name: string
    }
  debug?: boolean
}

export const init: (config: InitConfig) => void

// We construct an interface for the `firebase-admin` module because
// it's not clear how to get the typing for the top-level admin export.
// If there's a proper way to get the type, we should use it/
// https://firebase.google.com/docs/reference/admin/node/admin
// We extend from the App interface, which is similar but:
// * it contains a "delete" method
// * it does not contain an "app" or "credential" property
// https://firebase.google.com/docs/reference/admin/node/admin.app.App-1
interface FirebaseAdminType extends firebaseAdmin.app.App {
  app: firebaseAdmin.app.App
  delete: undefined
  credential: firebaseAdmin.credential.Credential
}

export const getFirebaseAdmin: () => FirebaseAdminType

export const setAuthCookies: (
  req: NextApiRequest,
  res: NextApiResponse
) => Promise<{
  idToken: string
  refreshToken: string
  AuthUser: AuthUser
}>

export const unsetAuthCookies: (
  req: NextApiRequest,
  res: NextApiResponse
) => Promise<void>

export const useAuthUser: () => AuthUserContext

export const verifyIdToken: (token: string) => Promise<AuthUser>

export const withAuthUser: <P = unknown>(options?: {
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
}) => (component: ComponentType<P>) => ComponentType<P>

export const withAuthUserTokenSSR: (options?: {
  whenAuthed?: AuthAction.RENDER | AuthAction.REDIRECT_TO_APP
  whenUnauthed?: AuthAction.RENDER | AuthAction.REDIRECT_TO_LOGIN
  appPageURL?: PageURL
  authPageURL?: PageURL
}) => (propGetter?: SSRPropGetter) => ReturnType<SSRPropGetter>

export const withAuthUserSSR: (options?: {
  whenAuthed?: AuthAction.RENDER | AuthAction.REDIRECT_TO_APP
  whenUnauthed?: AuthAction.RENDER | AuthAction.REDIRECT_TO_LOGIN
  appPageURL?: PageURL
  authPageURL?: PageURL
}) => (propGetter?: SSRPropGetter) => ReturnType<SSRPropGetter>
