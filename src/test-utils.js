export const getMockConfig = () => ({
  loginRedirectURL: undefined,
  // Optional string: the URL to navigate to when the user
  // is alredy logged in but on an authentication page.
  appRedirectURL: undefined,
  // Optional object: the config passed to the Firebase
  // Node admin SDK's firebaseAdmin.initializeApp.
  // Not required if the app is initializing the admin SDK
  // elsewhere.
  firebaseAdminInitConfig: undefined,
  // Optional object: the config passed to the Firebase
  // client JS SDK firebase.initializeApp. Not required if
  // the app is initializing the JS SDK elsewhere.
  firebaseClientInitConfig: undefined,
  cookies: {
    // Required string. The base name for the auth cookies.
    cookieName: undefined,
    // Required string or array.
    keys: undefined,
    // Required object: options to pass to cookies.set.
    // https://github.com/pillarjs/cookies#cookiesset-name--value---options--
    // We'll default to stricter, more secure options.
    cookieOptions: {
      domain: undefined,
      httpOnly: true,
      maxAge: 604800000, // week
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
