export const getMockConfig = () => ({
  // loginRedirectURL: undefined, // TODO
  // appRedirectURL: undefined, // TODO
  firebaseAdminInitConfig: {
    credential: {
      projectId: 'my-example-app',
      clientEmail: 'my-example-app@example.com',
      privateKey: 'fakePrivateKey123',
    },
    databaseURL: 'https://my-example-app.firebaseio.com',
  },
  firebaseClientInitConfig: {
    apiKey: 'fakeAPIKey123',
    authDomain: 'my-example-app.firebaseapp.com',
    databaseURL: 'https://my-example-app.firebaseio.com',
    projectId: 'my-example-app-id',
  },
  cookies: {
    cookieName: 'someExample',
    keys: ['abc', 'def'],
    cookieOptions: {
      httpOnly: true,
      maxAge: 172800, // two days
      overwrite: true,
      path: '/',
      sameSite: 'strict',
      secure: true,
    },
  },
})

export const getMockFirebaseUserClientSDK = () => ({
  uid: 'abc-123',
  email: 'abc@example.com',
  emailVerified: true,
  getIdToken: async () => 'my-id-token-abc-123',
  // ... other properties
})

// https://firebase.google.com/docs/reference/admin/node/admin.auth.DecodedIdToken#uid
export const getMockFirebaseUserAdminSDK = () => ({
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

export const getMockSerializedAuthUser = () =>
  JSON.stringify({
    id: 'ghi-789',
    email: 'ghi@example.com',
    emailVerified: true,
    clientInitialized: false,
    _token: 'my-id-token-ghi-789',
  })
