import * as Cookies from 'cookies'
import type { User } from 'firebase/auth'
import type {
  GetServerSideProps,
  GetServerSidePropsContext,
  GetServerSidePropsResult,
  NextApiRequest,
  NextApiResponse,
  PreviewData,
} from 'next'
import type { ComponentType } from 'react'
import type { ParsedUrlQuery } from 'querystring'

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type Dictionary<T = any> = Record<string, T>

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
  firebaseUser: User | null
  signOut: () => Promise<void>
}

export type SSRPropsContext<
  Q extends ParsedUrlQuery = ParsedUrlQuery,
  D extends PreviewData = PreviewData
> = GetServerSidePropsContext<Q, D> & { AuthUser: AuthUser }

export type SSRPropGetter<
  P extends Dictionary = Dictionary,
  Q extends ParsedUrlQuery = ParsedUrlQuery,
  D extends PreviewData = PreviewData
> = (context: SSRPropsContext<Q, D>) => Promise<GetServerSidePropsResult<P>>

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
    databaseURL?: string
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

export const getUserFromCookies: (options: {
  req?: NextApiRequest
  includeToken?: boolean
  authCookieValue?: string
  authCookieSigValue?: string
}) => Promise<AuthUser>

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

type GetServerSidePropsAuthWrapper = (options?: {
  whenAuthed?: AuthAction.RENDER | AuthAction.REDIRECT_TO_APP
  whenUnauthed?: AuthAction.RENDER | AuthAction.REDIRECT_TO_LOGIN
  appPageURL?: PageURL
  authPageURL?: PageURL
}) => <
  P extends Dictionary = Dictionary,
  Q extends ParsedUrlQuery = ParsedUrlQuery,
  D extends PreviewData = PreviewData
>(
  propGetter?: SSRPropGetter<P, Q, D>
) => GetServerSideProps<P, Q, D>

export const withAuthUserTokenSSR: GetServerSidePropsAuthWrapper

export const withAuthUserSSR: GetServerSidePropsAuthWrapper
