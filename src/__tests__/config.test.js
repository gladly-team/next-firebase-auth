import createMockConfig from 'src/testHelpers/createMockConfig'

jest.mock('src/isClientSide')

beforeEach(() => {
  // Default to client side context.
  const isClientSide = require('src/isClientSide').default
  isClientSide.mockReturnValue(true)
})

afterEach(() => {
  jest.resetModules()
})

describe('config', () => {
  it('[server-side] returns the set config', () => {
    expect.assertions(1)
    const isClientSide = require('src/isClientSide').default
    isClientSide.mockReturnValue(false)
    const { getConfig, setConfig } = require('src/config')
    const mockConfig = createMockConfig()
    setConfig(mockConfig)
    expect(getConfig()).toEqual(mockConfig)
  })

  it('[client-side] returns the set config with defaults', () => {
    expect.assertions(1)
    const isClientSide = require('src/isClientSide').default
    isClientSide.mockReturnValue(true)
    const { getConfig, setConfig } = require('src/config')
    const mockConfig = {
      ...createMockConfig(),
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
          signed: true,
        },
      },
    }
    setConfig(mockConfig)
    expect(getConfig()).toEqual(expectedConfig)
  })

  it('[client-side] does not throw if the user provides firebaseAdminInitConfig on the client side, as long as the private key is not set', () => {
    expect.assertions(1)
    const isClientSide = require('src/isClientSide').default
    isClientSide.mockReturnValue(true)
    const { setConfig } = require('src/config')
    const mockConfig = {
      ...createMockConfig(),
      firebaseAdminInitConfig: {
        credential: {
          projectId: 'abc',
          clientEmail: 'def',
          privateKey: undefined,
        },
        databaseURL: 'ghi',
      },
      cookies: undefined,
    }
    expect(() => {
      setConfig(mockConfig)
    }).not.toThrow()
  })

  it('[client-side] throws if the user provides firebaseAdminInitConfig.credential.privateKey on the client side', () => {
    expect.assertions(1)
    const isClientSide = require('src/isClientSide').default
    isClientSide.mockReturnValue(true)
    const { setConfig } = require('src/config')
    const mockConfig = {
      ...createMockConfig(),
      firebaseAdminInitConfig: {
        credential: {
          projectId: 'abc',
          clientEmail: 'def',
          privateKey: 'oops',
        },
        databaseURL: 'ghi',
      },
      cookies: undefined,
    }
    expect(() => {
      setConfig(mockConfig)
    }).toThrow(
      'Invalid next-firebase-auth options: The "firebaseAdminInitConfig" private key setting should not be available on the client side.'
    )
  })

  it('[client-side] throws if the user provides cookies.keys', () => {
    expect.assertions(1)
    const isClientSide = require('src/isClientSide').default
    isClientSide.mockReturnValue(true)
    const { setConfig } = require('src/config')
    const mockConfigDefault = createMockConfig()
    const mockConfig = {
      ...mockConfigDefault,
      firebaseAdminInitConfig: undefined,
      cookies: {
        ...mockConfigDefault.cookies,
        keys: ['some', 'keys'],
      },
    }
    expect(() => {
      setConfig(mockConfig)
    }).toThrow(
      'Invalid next-firebase-auth options: The "cookies.keys" setting should not be available on the client side.'
    )
  })

  it('[server-side] throws if the user does not provide cookies.cookieName', () => {
    expect.assertions(1)
    const isClientSide = require('src/isClientSide').default
    isClientSide.mockReturnValue(false)
    const { setConfig } = require('src/config')
    const mockConfigDefault = createMockConfig()
    const mockConfig = {
      ...mockConfigDefault,
      cookies: {
        ...mockConfigDefault.cookies,
        cookieName: undefined,
      },
    }
    expect(() => {
      setConfig(mockConfig)
    }).toThrow(
      'Invalid next-firebase-auth options: The "cookies.cookieName" setting is required on the server side.'
    )
  })

  it('[server-side] throws if the user does not provide cookies.keys but is using signed cookies', () => {
    expect.assertions(1)
    const isClientSide = require('src/isClientSide').default
    isClientSide.mockReturnValue(false)
    const { setConfig } = require('src/config')
    const mockConfigDefault = createMockConfig()
    const mockConfig = {
      ...mockConfigDefault,
      cookies: {
        ...mockConfigDefault.cookies,
        keys: undefined,
        cookieOptions: {
          ...mockConfigDefault.cookies.cookieOptions,
          signed: true,
        },
      },
    }
    expect(() => {
      setConfig(mockConfig)
    }).toThrow(
      'Invalid next-firebase-auth options: The "cookies.keys" setting must be set if "cookies.cookieOptions.signed" is true.'
    )
  })

  it('[server-side] throws if the user sets a maxAge of greater than two weeks', () => {
    expect.assertions(1)
    const isClientSide = require('src/isClientSide').default
    isClientSide.mockReturnValue(false)
    const { setConfig } = require('src/config')
    const mockConfigDefault = createMockConfig()
    const mockConfig = {
      ...mockConfigDefault,
      cookies: {
        ...mockConfigDefault.cookies,
        cookieOptions: {
          ...mockConfigDefault.cookies.cookieOptions,
          maxAge: 14 * 86400000 + 2, // two ms greater than 14 days
        },
      },
    }
    expect(() => {
      setConfig(mockConfig)
    }).toThrow(
      'Invalid next-firebase-auth options: The "cookies.maxAge" setting must be less than two weeks (1209600000 ms).'
    )
  })

  it('throws if the loginAPIEndpoint is not defined', () => {
    expect.assertions(1)
    const { setConfig } = require('src/config')
    const mockConfigDefault = createMockConfig()
    const mockConfig = {
      ...mockConfigDefault,
      firebaseAdminInitConfig: undefined, // for other config validation
      cookies: undefined, // for other config validation
      loginAPIEndpoint: undefined,
    }
    expect(() => {
      setConfig(mockConfig)
    }).toThrow(
      'Invalid next-firebase-auth options: The "loginAPIEndpoint" setting is required.'
    )
  })

  it('throws if the logoutAPIEndpoint is not defined', () => {
    expect.assertions(1)
    const { setConfig } = require('src/config')
    const mockConfigDefault = createMockConfig()
    const mockConfig = {
      ...mockConfigDefault,
      firebaseAdminInitConfig: undefined, // for other config validation
      cookies: undefined, // for other config validation
      logoutAPIEndpoint: undefined,
    }
    expect(() => {
      setConfig(mockConfig)
    }).toThrow(
      'Invalid next-firebase-auth options: The "logoutAPIEndpoint" setting is required.'
    )
  })
})
