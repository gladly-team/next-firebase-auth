/* eslint no-underscore-dangle: 0 */

/**
 * Take a representation of a Firebase user from one of: the Firebase JS SDK,
 * Firebase JS SDK, or serialized AuthUser instance. Return a standardized
 * AuthUser object.
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
  if (clientInitialized && !firebaseUserClientSDK) {
    throw new Error(
      'The "clientInitialized" value can only be true if the "firebaseUserClientSDK" property is defined.'
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
  const AuthUserBeforeSerialize = {
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
  }
  const AuthUser = {
    ...AuthUserBeforeSerialize,
    serialize: () =>
      JSON.stringify({
        id: userId,
        email,
        emailVerified,
        clientInitialized,
        _token: tokenString,
      }),
  }
  return AuthUser
}

/**
 * Take the user object from the Firebase admin SDK and return a
 * serializable object, AuthUserSerializable. This can be returned from
 * `getServerSideProps`. It can be passed to `createAuthUser` during render
 * to create an AuthUser object.
 * @param {Object} firebaseUser - A decoded user from the Firebase admin SDK
 * @return {Object|null} AuthUserSerializable - The user object.
 * @return {String|null} AuthUserSerializable.uid - The user's ID
 * @return {String|null} AuthUserSerializable.email - The user's email
 * @return {Boolean} AuthUserSerializable.emailVerified - Whether the user has
 *   verified their email
 * @return {String} AuthUserSerializable.token - The user's ID token
 */
export const createAuthUserSerializable = (firebaseUser, idToken = null) => {
  return {
    uid: firebaseUser && firebaseUser.uid ? firebaseUser.uid : null,
    email: firebaseUser && firebaseUser.email ? firebaseUser.email : null,
    emailVerified:
      firebaseUser && firebaseUser.email_verified
        ? firebaseUser.email_verified
        : false,
    // Provide this so the token can be available during SSR and
    // client-side renders prior to the Firebase JS SDK initializing.
    token: idToken,
  }
}

export default createAuthUser
