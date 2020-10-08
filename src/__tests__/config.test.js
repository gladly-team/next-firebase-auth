jest.mock('src/isClientSide')

beforeEach(() => {
  // Default to client side context.
  const isClientSide = require('src/isClientSide').default
  isClientSide.mockReturnValue(true)
})

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
  it('returns the set config [server-side]', () => {
    expect.assertions(1)
    const isClientSide = require('src/isClientSide').default
    isClientSide.mockReturnValue(false)
    const { getConfig, setConfig } = require('src/config')
    const mockConfig = getMockFullUserConfig()
    setConfig(mockConfig)
    expect(getConfig()).toEqual(mockConfig)
  })

  it('returns the set config with defaults [client-side]', () => {
    expect.assertions(1)
    const isClientSide = require('src/isClientSide').default
    isClientSide.mockReturnValue(false)
    const { getConfig, setConfig } = require('src/config')
    const mockConfig = {
      ...getMockFullUserConfig(),
      firebaseAdminInitConfig: undefined,
      cookies: undefined,
    }
    const expectedConfig = {
      ...mockConfig,
      // Default cookies values.
      cookies: {
        cookieName: undefined,
        keys: undefined,
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
    }
    setConfig(mockConfig)
    expect(getConfig()).toEqual(expectedConfig)
  })

  it('throws if the user provides firebaseAdminInitConfig on the client side', () => {
    expect.assertions(1)
    const isClientSide = require('src/isClientSide').default
    isClientSide.mockReturnValue(true)
    const { setConfig } = require('src/config')
    const mockConfig = {
      ...getMockFullUserConfig(),
      firebaseAdminInitConfig: { some: 'stuff' },
      cookies: undefined,
    }
    expect(() => {
      setConfig(mockConfig)
    }).toThrow(
      'The "firebaseAdminInitConfig" setting should not be available on the client side.'
    )
  })

  it('throws if the user provides cookies.keys on the client side', () => {
    expect.assertions(1)
    const isClientSide = require('src/isClientSide').default
    isClientSide.mockReturnValue(true)
    const { setConfig } = require('src/config')
    const mockConfig = {
      ...getMockFullUserConfig(),
      firebaseAdminInitConfig: undefined,
      cookies: {
        keys: ['some', 'keys'],
      },
    }
    expect(() => {
      setConfig(mockConfig)
    }).toThrow(
      'The "cookies.keys" setting should not be available on the client side.'
    )
  })
})
