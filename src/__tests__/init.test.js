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

describe('init', () => {
  it('returns the set config', () => {
    expect.assertions(1)
    const init = require('src/init').default
    const { getConfig } = require('src/init')
    const mockConfig = getMockFullUserConfig()
    init(mockConfig)
    expect(getConfig()).toEqual(mockConfig)
  })
})
