import * as Cookies from 'cookies'
import type Firebase from 'firebase'
import type {
  GetServerSidePropsContext,
  GetServerSidePropsResult,
  NextApiRequest,
  NextApiResponse,
} from 'next'
import type { ComponentType } from 'react'
import type { ParsedUrlQuery } from 'querystring'

export type SSRPropsContext<Q extends ParsedUrlQuery = ParsedUrlQuery> =
  GetServerSidePropsContext<Q>
  & { AuthUser: AuthUser };

export type SSRPropGetter<P extends { [key: string]: any } = { [key: string]: any },
  Q extends ParsedUrlQuery = ParsedUrlQuery> = (
  context: SSRPropsContext<Q>,
) => Promise<GetServerSidePropsResult<P>>

export enum AuthAction {
  RENDER = 'render',
  SHOW_LOADER = 'showLoader',
  RETURN_NULL = 'returnNull',
  REDIRECT_TO_LOGIN = 'redirectToLogin',
  REDIRECT_TO_APP = 'redirectToApp'
}

export interface AuthUser {
  id: string | null;
  email: string | null;
  emailVerified: boolean;
  getIdToken: () => Promise<string | null>;
  clientInitialized: boolean;
  firebaseUser: Firebase.User | null;
  signOut: () => Promise<void>;
}

interface AuthUserContext extends AuthUser {
  serialize: (opts?: { includeToken?: boolean }) => string;
}

interface InitConfig {
  authPageURL?: string;
  appPageURL?: string;
  loginAPIEndpoint?: string;
  logoutAPIEndpoint?: string;
  tokenChangedHandler?: (user: AuthUser) => void;
  firebaseAdminInitConfig?: {
    credential: {
      projectId: string;
      clientEmail: string;
      privateKey: string;
    };
    databaseURL: string;
  };
  firebaseAuthEmulatorHost?: string;
  firebaseClientInitConfig: {
    apiKey: string;
    authDomain?: string;
    databaseURL?: string;
    projectId?: string;
  };
  cookies: Cookies.Option & Cookies.SetOption & {
    name: string;
  };
}

export const init: (config: InitConfig) => void

export const setAuthCookies: (req: NextApiRequest, res: NextApiResponse) => Promise<{
  idToken: string;
  refreshToken: string;
  AuthUser: AuthUser;
}>

export const unsetAuthCookies: (req: NextApiRequest, res: NextApiResponse) => Promise<void>

export const useAuthUser: () => AuthUserContext

export const verifyIdToken: (token: string) => Promise<AuthUser>

export const withAuthUser: <P = {}>(options?: {
  whenAuthed?: AuthAction.RENDER | AuthAction.REDIRECT_TO_APP;
  whenUnauthedBeforeInit?: AuthAction.RENDER | AuthAction.REDIRECT_TO_LOGIN | AuthAction.SHOW_LOADER | AuthAction.RETURN_NULL;
  whenUnauthedAfterInit?: AuthAction.RENDER | AuthAction.REDIRECT_TO_LOGIN;
  appPageURL?: string;
  authPageURL?: string;
  LoaderComponent?: ComponentType | null;
}) => (component: ComponentType<P>) => ComponentType<P>

export const withAuthUserTokenSSR: (
  options?: {
    whenAuthed?: AuthAction.RENDER | AuthAction.REDIRECT_TO_APP;
    whenUnauthed?: AuthAction.RENDER | AuthAction.REDIRECT_TO_LOGIN;
    appPageURL?: string;
    authPageURL?: string;
  }
) => (propGetter?: SSRPropGetter) => ReturnType<SSRPropGetter>

export const withAuthUserSSR: (options?: {
  whenAuthed?: AuthAction.RENDER | AuthAction.REDIRECT_TO_APP;
  whenUnauthed?: AuthAction.RENDER | AuthAction.REDIRECT_TO_LOGIN;
  appPageURL?: string;
  authPageURL?: string;
}) => (propGetter?: SSRPropGetter) => ReturnType<SSRPropGetter>
