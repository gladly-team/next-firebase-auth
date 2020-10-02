afterEach(() => {
  jest.resetModules()
})

const getMockFullUserConfig = () => ({
  onAuthStateChanged: () => {},
  loginRedirectURL: '/auth',
  appRedirectURL: '/foo',
  firebaseAdminInitConfig: {
    some: 'thing',
  },
  firebaseClientInitConfig: {
    another: 'thing',
  },
  cookies: {
    cookieName: 'myAppAuth',
    keys: ['abc', 'def'],
    cookieOptions: {
      domain: undefined,
      httpOnly: true,
      maxAge: 604800000, // week
      overwrite: true,
      path: '/subpath/',
      sameSite: 'lax',
      secure: true,
    },
  },
})

describe('config', () => {
  it('returns the set config', () => {
    expect.assertions(1)
    const { getConfig, setConfig } = require('src/config')
    const mockConfig = getMockFullUserConfig()
    setConfig(mockConfig)
    expect(getConfig()).toEqual(mockConfig)
  })
})
