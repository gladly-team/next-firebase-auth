/* eslint-env jest */

export const getMockConfig = () => ({
  debug: false,
  loginRedirectURL: undefined, // TODO
  appRedirectURL: undefined, // TODO
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

/**
 * Return a mock HTTP request object for testing. It is an
 * incomplete set of values.
 * @return {Object}
 */
export const getMockReq = () => ({
  readable: true,
  socket: {},
  connection: {},
  httpVersionMajor: 1,
  httpVersionMinor: 1,
  httpVersion: '1.1',
  complete: true,
  headers: {
    host: 'example.com',
    connection: 'keep-alive',
    'cache-control': 'max-age=0',
    'upgrade-insecure-requests': '1',
    'user-agent':
      'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_4) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/83.0.4103.23 Safari/537.36',
    accept:
      'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.9',
    'sec-fetch-site': 'same-origin',
    'sec-fetch-mode': 'navigate',
    'sec-fetch-user': '?1',
    'sec-fetch-dest': 'document',
    referer: 'https://example.com/some-page/',
    'accept-encoding': 'gzip, deflate, br',
    'accept-language': 'en-US,en;q=0.9,es;q=0.8,es-419;q=0.7',
    cookie: 'someCookie=foo; somethingElse=bar',
  },
  rawHeaders: {
    // stuff here
  },
  trailers: {},
  rawTrailers: {},
  aborted: false,
  upgrade: false,
  url: '/some-page/',
  method: 'GET',
  statusCode: null,
  statusMessage: null,
  client: {
    // stuff here
  },
})

/**
 * Return a mock HTTP response object for testing. It is an
 * incomplete set of values.
 * @return {Object}
 */
export const getMockRes = () => {
  const mockRes = {
    output: {},
    outputEncodings: {},
    outputCallbacks: {},
    outputSize: 123,
    writable: true,
    chunkedEncoding: false,
    shouldKeepAlive: true,
    useChunkedEncodingByDefault: true,
    sendDate: true,
    finished: false,
    socket: {},
    connection: {},
    statusCode: 200,
    locals: {},
    flush: jest.fn(),
    write: jest.fn(),
    end: jest.fn(),
    on: jest.fn(),
    writeHead: jest.fn(),
  }
  mockRes.json = jest.fn(() => mockRes)
  mockRes.status = jest.fn(() => mockRes)
  return mockRes
}
