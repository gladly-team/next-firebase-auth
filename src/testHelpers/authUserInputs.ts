import { DecodedIdToken } from 'firebase-admin/auth'
import { User } from 'firebase/auth'

export const createMockFirebaseUserClientSDK = ({
  tenantId = null,
}: { tenantId?: string | null } = {}) => {
  const mockUser = {
    uid: 'abc-123',
    email: 'abc@example.com',
    emailVerified: true,
    phoneNumber: '+1800-123-4567',
    displayName: 'Abc Cdf',
    photoURL: 'https://abc.googleusercontent.com/cdf/profile_photo.png',
    getIdToken: async () => 'my-id-token-abc-123',
    claims: {},
    tenantId,
    // ... other properties
  } as unknown as User
  return mockUser
}

// https://firebase.google.com/docs/reference/admin/node/firebase-admin.auth.decodedidtoken
export const createMockFirebaseUserAdminSDK = ({
  tenant = null,
}: { tenant?: string | null } = {}) => {
  const mockUser = {
    uid: 'def-456',
    email: 'def@example.com',
    email_verified: true,
    phone_number: '+1800-234-5678',
    name: 'Def Ghi',
    picture: 'https://def.googleusercontent.com/ghi/profile_photo.png',
    iss: 'https://securetoken.google.com/my-cool-app',
    aud: 'my-cool-app',
    auth_time: 1540000000,
    user_id: 'def-456',
    sub: 'def-456',
    iat: 1540000000,
    exp: 1540000000,
    firebase: {
      tenant,
    },
    // ... other properties
  } as unknown as DecodedIdToken
  return mockUser
}

// https://firebase.google.com/docs/reference/admin/node/firebase-admin.auth.userrecord
export const createMockFirebaseUserRecord = () => ({
  customClaims: {},
  disabled: false,
  displayName: 'Ghi Jkl',
  email: '',
  emailVerified: false,
  metadata: {
    creationTime: '2019-01-01T00:00:00.000Z',
    lastSignInTime: '2019-01-01T00:00:00.000Z',
  },
  phoneNumber: '',
  photoURL: '',
  providerData: [],
  tokensValidAfterTime: '2019-01-01T00:00:00.000Z',
  uid: 'ghi-789',
  // ... other properties
})

// https://firebase.google.com/docs/reference/js/firebase.auth.IDTokenResult
export const createMockIdTokenResult = ({ claims = {} } = {}) => ({
  authTime: 1540000000,
  claims,
  expirationTime: 1540000000,
  issuedAtTime: 1540000000,
  signInProvider: 'google',
  signInSecondFactor: null,
  token: 'my-id-token-ghb-231',
})

export const createMockSerializedAuthUser = ({
  claims = {},
  tenantId = null,
}: { claims?: Record<string, unknown>; tenantId?: string | null } = {}) =>
  JSON.stringify({
    id: 'ghi-789',
    claims,
    email: 'ghi@example.com',
    emailVerified: true,
    tenantId,
    phoneNumber: '+1800-345-6789',
    displayName: 'Ghi Jkl',
    photoURL: 'https://ghi.googleusercontent.com/jkl/profile_photo.png',
    clientInitialized: false,
    _token: 'my-id-token-ghi-789',
  })
