/* eslint-env jest */
import isClientSide from 'src/isClientSide'

const createMockConfig = ({ clientSide = isClientSide() } = {}) => ({
  debug: false,
  loginAPIEndpoint: 'https://example.com/api/login',
  logoutAPIEndpoint: 'https://example.com/api/logout',
  authPageURL: '/login',
  appPageURL: '/',
  firebaseAdminInitConfig: {
    credential: {
      projectId: 'my-example-app',
      clientEmail: 'my-example-app@example.com',
      privateKey: clientSide ? undefined : 'fakePrivateKey123',
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
    keys: clientSide ? [] : ['abc', 'def'],
    cookieOptions: {
      domain: undefined,
      httpOnly: true,
      maxAge: 172800, // two days
      overwrite: true,
      path: '/',
      sameSite: 'strict',
      secure: true,
      signed: true,
    },
  },
})

export default createMockConfig
