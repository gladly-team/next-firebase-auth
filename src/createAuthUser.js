/* eslint no-underscore-dangle: 0 */
import isClientSide from 'src/isClientSide'
import { filterStandardClaims } from 'src/claims'

/**
 * Take a representation of a Firebase user from a maximum of one of:
 * the Firebase JS SDK, Firebase admin SDK, or serialized AuthUser instance.
 * Return a standardized AuthUser object.
 *
 * @param {Object} params
 * @param {Object|undefined} params.firebaseUserClientSDK - The Firebase
 *   user returned from the Firebase JS SDK.
 * @param {Object|undefined} params.firebaseUserAdminSDK - The Firebase
 *   user returned from the Firebase admin SDK.
 * @param {String|undefined} params.serializedAuthUser - The string of
 *   a serialized AuthUser, previously returned from an AuthUser instance's
 *   serialize method.
 *
 * @return {Object|null} AuthUser - The user object.
 * @return {Boolean} AuthUser.clientInitialized - This will be true if the
 *   Firebase JS SDK has initialized, meaning we know the AuthUser value
 *   is from the source of truth. Defaults to false.
 * @return {Object} AuthUser - The authenticated user's info.
 * @return {String|null} AuthUser.id - The user's ID
 * @return {String|null} AuthUser.email - The user's email
 * @return {Boolean} AuthUser.emailVerified - Whether the user has verified their email
 * @return {Object} AuthUser.claims - All the claims for the current user
 * @return {Function} AuthUser.getIdToken - An asynchronous function that
 *   resolves to the Firebase user's ID token string, or null if the user is
 *   not authenticated or we do not have access to a token.
 * @return {Boolean} AuthUser.clientInitialized - Whether the client-side
 *   Firebase JS SDK has initialized.
 * @return {Function} AuthUser.serialize - An function that returns a
 *   serialized version of AuthUser.
 *  @return {Object|null} AuthUser.firebaseUser - null if the Firebase JS SDK has not
 *   initialized. Otherwise, it is the user value from the Firebase JS SDK.
 * @return {Function} AuthUser.signOut - An asynchronous function that, after the
 *   client side Firebase SDK has initialized, signs the user out. In other
 *   contexts, it is a noop.

 */
const createAuthUser = ({
  firebaseUserClientSDK,
  firebaseUserAdminSDK,
  serializedAuthUser,
  clientInitialized = false,
  token = null,
  claims,
} = {}) => {
  // Ensure only one of the user input types is defined.
  const numUserInputsDefined = [
    firebaseUserClientSDK,
    firebaseUserAdminSDK,
    serializedAuthUser,
  ].reduce((acc, item) => {
    if (item) {
      return acc + 1
    }
    return acc
  }, 0)
  if (numUserInputsDefined > 1) {
    throw new Error(
      'createAuthUser cannot receive more than one of the following properties: "firebaseUserClientSDK", "firebaseUserAdminSDK", "serializedAuthUser"'
    )
  }

  // The clientInitialized value should not be set server-side.
  if (clientInitialized && (firebaseUserAdminSDK || serializedAuthUser)) {
    throw new Error(
      'The "clientInitialized" value can only be true when called with the "firebaseUserClientSDK" property or no user.'
    )
  }

  // The "claims" input should only be provided on the client side.
  // On the server side, we will get the claims from the user object.
  if (claims && (firebaseUserAdminSDK || serializedAuthUser)) {
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
  let userId = null
  let email = null
  let emailVerified = false
  let phoneNumber = null
  let displayName = null
  let photoURL = null
  let getIdTokenFunc = async () => null

  // When not on the client side, the "signOut" method is a noop.
  let firebase
  if (isClientSide()) {
    // eslint-disable-next-line global-require
    require('firebase/auth')
    // eslint-disable-next-line global-require
    firebase = require('firebase/app').default
  }
  let signOut = async () => {}

  let tokenString = null // used for serialization
  if (firebaseUserClientSDK) {
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
    getIdTokenFunc = async (forceRefresh) =>
      firebaseUserClientSDK.getIdToken(forceRefresh)
    signOut = async () => firebase.auth().signOut()
    tokenString = null
  } else if (firebaseUserAdminSDK) {
    /**
     * firebaseUserAdminSDK is a DecodedIDToken obtained from
     * admin.auth().verifyIdToken which returns all the user's claims
     * https://firebase.google.com/docs/auth/admin/custom-claims
     * In order for the claims to be consistent, we need to pass the
     * entire adminSDK object as claims
     */
    customClaims = filterStandardClaims(firebaseUserAdminSDK)
    userId = firebaseUserAdminSDK.uid
    email = firebaseUserAdminSDK.email
    emailVerified = firebaseUserAdminSDK.email_verified
    phoneNumber = firebaseUserAdminSDK.phone_number
    displayName = firebaseUserAdminSDK.name
    photoURL = firebaseUserAdminSDK.picture
    getIdTokenFunc = async () => token
    tokenString = token
  } else if (serializedAuthUser) {
    const deserializedUser = JSON.parse(serializedAuthUser)
    customClaims = deserializedUser.claims
    userId = deserializedUser.id
    email = deserializedUser.email
    emailVerified = deserializedUser.emailVerified
    phoneNumber = deserializedUser.phoneNumber
    displayName = deserializedUser.displayName
    photoURL = deserializedUser.photoURL
    getIdTokenFunc = async () => deserializedUser._token || null
    tokenString = deserializedUser._token
  }
  return {
    id: userId,
    email,
    emailVerified,
    phoneNumber,
    displayName,
    photoURL,
    claims: customClaims,
    // We want the "getIdToken" method to be isomorphic.
    // When `user` is an AuthUserSerializable object, we take the token
    // value and return it from this method.
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
    signOut,
    serialize: ({ includeToken = true } = {}) =>
      JSON.stringify({
        id: userId,
        claims: customClaims,
        email,
        emailVerified,
        phoneNumber,
        displayName,
        photoURL,
        clientInitialized,
        ...(includeToken && { _token: tokenString }),
      }),
  }
}

export default createAuthUser
