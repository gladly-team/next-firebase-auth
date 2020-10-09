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
  it('[server-side] returns the set config', () => {
    expect.assertions(1)
    const isClientSide = require('src/isClientSide').default
    isClientSide.mockReturnValue(false)
    const { getConfig, setConfig } = require('src/config')
    const mockConfig = getMockFullUserConfig()
    setConfig(mockConfig)
    expect(getConfig()).toEqual(mockConfig)
  })

  it('[client-side] returns the set config with defaults', () => {
    expect.assertions(1)
    const isClientSide = require('src/isClientSide').default
    isClientSide.mockReturnValue(true)
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

  it('[client-side] throws if the user provides firebaseAdminInitConfig on the client side', () => {
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

  it('[client-side] throws if the user provides cookies.keys', () => {
    expect.assertions(1)
    const isClientSide = require('src/isClientSide').default
    isClientSide.mockReturnValue(true)
    const { setConfig } = require('src/config')
    const config = getMockFullUserConfig()
    const mockConfig = {
      ...config,
      firebaseAdminInitConfig: undefined,
      cookies: {
        ...config.cookies,
        keys: ['some', 'keys'],
      },
    }
    expect(() => {
      setConfig(mockConfig)
    }).toThrow(
      'The "cookies.keys" setting should not be available on the client side.'
    )
  })

  it('[server-side] throws if the user does not provide cookies.cookieName', () => {
    expect.assertions(1)
    const isClientSide = require('src/isClientSide').default
    isClientSide.mockReturnValue(false)
    const { setConfig } = require('src/config')
    const config = getMockFullUserConfig()
    const mockConfig = {
      ...config,
      cookies: {
        ...config.cookies,
        cookieName: undefined,
      },
    }
    expect(() => {
      setConfig(mockConfig)
    }).toThrow(
      'The "cookies.cookieName" setting is required on the server side.'
    )
  })
})
