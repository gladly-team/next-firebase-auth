/* eslint no-underscore-dangle: 0 */
import { User as FirebaseUser } from 'firebase/auth'
import { DecodedIdToken } from 'firebase-admin/auth'
import isClientSide from 'src/isClientSide'
import { Claims, filterStandardClaims } from 'src/claims'

interface UserDeserialized {
  id?: string
  claims?: object
  email?: string
  emailVerified: boolean
  phoneNumber?: string
  displayName?: string
  photoURL?: string
  clientInitialized: boolean
  _token?: string
  tenantId: string
}

export type UserSerialized = string

interface CreateUserInput {
  firebaseUserClientSDK?: FirebaseUser
  firebaseUserAdminSDK?: DecodedIdToken
  serializedUser?: UserSerialized
  clientInitialized?: boolean
  token?: string | null
  claims?: Claims
}

type getIdToken = (forceRefresh?: boolean) => Promise<string | null>

export interface User {
  id: string | null
  email: string | null
  emailVerified: boolean
  phoneNumber: string | null
  displayName: string | null
  photoURL: string | null
  claims: Record<string, string | boolean>
  tenantId: string | null
  getIdToken: (forceRefresh?: boolean) => Promise<string | null>
  clientInitialized: boolean
  firebaseUser: FirebaseUser | null
  signOut: () => Promise<void>
  serialize: (a?: { includeToken?: boolean }) => string
}

/**
 * Take a representation of a Firebase user from a maximum of one of:
 * the Firebase JS SDK, Firebase admin SDK, or serialized User instance.
 * Return a standardized User object.
 */
const createUser = ({
  firebaseUserClientSDK,
  firebaseUserAdminSDK,
  serializedUser,
  clientInitialized = false,
  token = null,
  claims,
}: CreateUserInput = {}): User => {
  // Ensure only one of the user input types is defined.
  const numUserInputsDefined = [
    firebaseUserClientSDK,
    firebaseUserAdminSDK,
    serializedUser,
  ].reduce((acc, item) => {
    if (item) {
      return acc + 1
    }
    return acc
  }, 0)
  if (numUserInputsDefined > 1) {
    throw new Error(
      'createUser cannot receive more than one of the following properties: "firebaseUserClientSDK", "firebaseUserAdminSDK", "serializedUser"'
    )
  }

  // The clientInitialized value should not be set server-side.
  if (clientInitialized && (firebaseUserAdminSDK || serializedUser)) {
    throw new Error(
      'The "clientInitialized" value can only be true when called with the "firebaseUserClientSDK" property or no user.'
    )
  }

  // The "claims" input should only be provided on the client side.
  // On the server side, we will get the claims from the user object.
  if (claims && (firebaseUserAdminSDK || serializedUser)) {
    throw new Error(
      'The "claims" value can only be set in conjunction with the "firebaseUserClientSDK" property.'
    )
  }

  // The token value should only be provided with the decoded admin value.
  if (token && !firebaseUserAdminSDK) {
    throw new Error(
      'The "token" value can only be set if the "firebaseUserAdminSDK" property is defined.'
    )
  }

  let customClaims = {}
  let userId: string | null = null
  let email: string | null = null
  let emailVerified = false
  let tenantId: string | null = null
  let phoneNumber: string | null = null
  let displayName: string | null = null
  let photoURL: string | null = null
  let getIdTokenFunc: getIdToken = async () => null

  // When not on the client side, the "signOut" method is a noop.
  // eslint-disable-next-line @typescript-eslint/no-empty-function
  let signOutFunc = async () => {}

  let tokenString: string | null = null // used for serialization
  if (firebaseUserClientSDK) {
    if (isClientSide()) {
      // eslint-disable-next-line global-require, @typescript-eslint/no-var-requires
      const { getApp } = require('firebase/app')
      // eslint-disable-next-line global-require,  @typescript-eslint/no-var-requires
      const { getAuth, signOut } = require('firebase/auth')

      signOutFunc = async () => signOut(getAuth(getApp()))
    }

    /**
     * Claims are injected client side through the onTokenChange Callback
     */
    customClaims = filterStandardClaims(claims)
    userId = firebaseUserClientSDK.uid
    email = firebaseUserClientSDK.email
    emailVerified = firebaseUserClientSDK.emailVerified
    phoneNumber = firebaseUserClientSDK.phoneNumber
    displayName = firebaseUserClientSDK.displayName
    photoURL = firebaseUserClientSDK.photoURL
    tenantId = firebaseUserClientSDK.tenantId

    /**
     * Returns a JSON Web Token (JWT) used to identify the user to a Firebase
     * service.
     *
     * Returns the current token if it has not expired. Otherwise, this will
     * refresh the token and return a new one.
     *
     * @param forceRefresh Force refresh regardless of token
     *     expiration.
     */
    getIdTokenFunc = async (forceRefresh?: boolean): Promise<string | null> =>
      firebaseUserClientSDK.getIdToken(forceRefresh)
    tokenString = null
  } else if (firebaseUserAdminSDK) {
    /**
     * firebaseUserAdminSDK is a DecodedIDToken obtained from the Firebase
     * admin app's `verifyIdToken`, which returns all the user's claims:
     * https://firebase.google.com/docs/auth/admin/custom-claims
     * In order for the claims to be consistent, we need to pass the
     * entire object as claims.
     */
    customClaims = filterStandardClaims(firebaseUserAdminSDK)
    userId = firebaseUserAdminSDK.uid
    email = firebaseUserAdminSDK.email || null
    emailVerified = firebaseUserAdminSDK.email_verified || false
    phoneNumber = firebaseUserAdminSDK.phone_number || null
    displayName = firebaseUserAdminSDK.name
    tenantId = firebaseUserAdminSDK.firebase
      ? firebaseUserAdminSDK.firebase.tenant || null
      : null
    photoURL = firebaseUserAdminSDK.picture || null
    getIdTokenFunc = async () => token
    tokenString = token
  } else if (serializedUser) {
    const deserializedUser: UserDeserialized = JSON.parse(
      serializedUser
    ) as UserDeserialized
    customClaims = deserializedUser.claims || {}
    userId = deserializedUser.id || null
    email = deserializedUser.email || null
    emailVerified = deserializedUser.emailVerified
    tenantId = deserializedUser.tenantId || null
    phoneNumber = deserializedUser.phoneNumber || null
    displayName = deserializedUser.displayName || null
    photoURL = deserializedUser.photoURL || null
    getIdTokenFunc = async () => deserializedUser._token || null
    tokenString = deserializedUser._token || null
  }
  return {
    id: userId,
    email,
    emailVerified,
    tenantId,
    phoneNumber,
    displayName,
    photoURL,
    claims: customClaims,
    // We want the "getIdToken" method to be isomorphic.
    // After the Firebase JS SDK has initialized on the client side, we
    // use the Firebase SDK's getIdToken method, which will handle refreshing
    // the token as needed.
    getIdToken: getIdTokenFunc,
    // clientInitialized is true if the user state is determined by
    // the Firebase JS SDK.
    clientInitialized,
    // The "firebaseUser" value is null if the Firebase JS SDK has not
    // initialized. Otherwise, it is the user value from the Firebase JS SDK.
    firebaseUser: firebaseUserClientSDK || null,
    // The "signOut" method is a noop when the Firebase JS SDK has not
    // initialized. Otherwise, it is the SDK's "signOut" method:
    // https://firebase.google.com/docs/reference/js/firebase.auth.Auth#signout
    signOut: signOutFunc,
    serialize: ({ includeToken = true } = {}) =>
      JSON.stringify({
        id: userId,
        claims: customClaims,
        email,
        emailVerified,
        tenantId,
        phoneNumber,
        displayName,
        photoURL,
        clientInitialized,
        ...(includeToken && { _token: tokenString }),
      }),
  }
}

export default createUser
