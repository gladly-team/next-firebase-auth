/* eslint no-underscore-dangle: 0 */
import logDebug from 'src/logDebug'

/**
 * Take a representation of a Firebase user from a maximum of one of:
 * the Firebase JS SDK, Firebase admin SDK, or serialized AuthUser instance.
 * Return a standardized AuthUser object. If no Firebase user info is provided,
 * return null (unauthenticated) user info.
 * from client-side Firebase JS SDK) and return an AuthUser object.
 * @param {Object} params
 * @return {Object|undefined} params.firebaseUserClientSDK - The Firebase
 *   user returned from the Firebase JS SDK.
 * @return {Object|undefined} params.firebaseUserAdminSDK - The Firebase
 *   user returned from the Firebase admin SDK.
 * @return {String|undefined} params.serializedAuthUser - The string of
 *   a serialized AuthUser, previously returned from an AuthUser instance's
 *   serialize method.
 * @return {Object|null} AuthUser - The user object.
 * @param {Boolean} clientInitialized - This should be true if the
 *   Firebase JS SDK has initialized, meaning we know the AuthUser value
 *   is from the source of truth. Defaults to false.
 * @return {Object|null} AuthUser - The authenticated user's info.
 * @return {String|null} AuthUser.id - The user's ID
 * @return {String|null} AuthUser.email - The user's email
 * @return {Boolean} AuthUser.emailVerified - Whether the user has verified their email
 * @return {Function} AuthUser.getIdToken - An asynchronous function that
 *   resolves to the Firebase user's ID token string, or null if the user is
 *   not authenticated or we do not have access to a token.
 * @return {Boolean} AuthUser.clientInitialized - Whether the client-side
 *   Firebase JS SDK has initialized.
 * @return {Function} AuthUser.serialize - An function that returns a
 *   serialized version of AuthUser.
 */
const createAuthUser = ({
  firebaseUserClientSDK,
  firebaseUserAdminSDK,
  serializedAuthUser,
  clientInitialized = false,
  token = null,
} = {}) => {
  logDebug('Called createAuthUser with arguments:', {
    firebaseUserClientSDK,
    firebaseUserAdminSDK,
    serializedAuthUser,
    clientInitialized,
    token,
  })
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

  // The token value should only be provided with the decoded admin value.
  if (token && !firebaseUserAdminSDK) {
    throw new Error(
      'The "token" value can only be set if the "firebaseUserAdminSDK" property is defined.'
    )
  }

  let userId = null
  let email = null
  let emailVerified = false
  let getIdTokenFunc = async () => null
  let tokenString = null // used for serialization
  if (firebaseUserClientSDK) {
    userId = firebaseUserClientSDK.uid
    email = firebaseUserClientSDK.email
    emailVerified = firebaseUserClientSDK.emailVerified
    getIdTokenFunc = async () => firebaseUserClientSDK.getIdToken()
    tokenString = null
  } else if (firebaseUserAdminSDK) {
    userId = firebaseUserAdminSDK.uid
    email = firebaseUserAdminSDK.email
    emailVerified = firebaseUserAdminSDK.email_verified
    getIdTokenFunc = async () => token
    tokenString = token
  } else if (serializedAuthUser) {
    const deserializedUser = JSON.parse(serializedAuthUser)
    userId = deserializedUser.id
    email = deserializedUser.email
    emailVerified = deserializedUser.emailVerified
    getIdTokenFunc = async () => deserializedUser._token || null
    tokenString = deserializedUser._token
  }
  return {
    id: userId,
    email,
    emailVerified,
    // We want this method to be isomorphic.
    // When `user` is an AuthUserSerializable object, take the token value
    // and return it from this method.
    // After the Firebase JS SDK has initialized on the client side, use the
    // Firebase SDK's getIdToKen method, which will handle refreshing the token
    // as needed.
    getIdToken: getIdTokenFunc,
    // clientInitialized is true if the user state is determined by
    // the Firebase JS SDK.
    clientInitialized,
    // firebaseUser is null if the Firebase JS SDK has not initialized.
    // Otherwise, it is the user value from the Firebase JS SDK.
    firebaseUser: firebaseUserClientSDK || null,
    serialize: () =>
      JSON.stringify({
        id: userId,
        email,
        emailVerified,
        clientInitialized,
        _token: tokenString,
      }),
  }
}

export default createAuthUser
