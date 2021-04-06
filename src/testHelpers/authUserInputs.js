export const createMockFirebaseUserClientSDK = () => ({
  uid: 'abc-123',
  email: 'abc@example.com',
  emailVerified: true,
  getIdToken: async () => 'my-id-token-abc-123',
  claims: {},
  // ... other properties
})

// https://firebase.google.com/docs/reference/admin/node/admin.auth.DecodedIdToken#uid
export const createMockFirebaseUserAdminSDK = () => ({
  uid: 'def-456',
  email: 'def@example.com',
  email_verified: true,
  iss: 'https://securetoken.google.com/my-cool-app',
  aud: 'my-cool-app',
  auth_time: 1540000000,
  user_id: 'def-456',
  sub: 'def-456',
  iat: 1540000000,
  exp: 1540000000,
  firebase: {},
  // ... other properties
})

// https://firebase.google.com/docs/reference/js/firebase.auth.IDTokenResult
export const createMockIdTokenResult = (claims = {}) => ({
  authTime: 1540000000,
  claims,
  expirationTime: 1540000000,
  issuedAtTime: 1540000000,
  signInProvider: 'google',
  signInSecondFactor: null,
  token: 'my-id-token-ghb-231',
})

export const createMockSerializedAuthUser = (claims = {}) =>
  JSON.stringify({
    id: 'ghi-789',
    claims,
    email: 'ghi@example.com',
    emailVerified: true,
    clientInitialized: false,
    _token: 'my-id-token-ghi-789',
  })
