import createMockConfig from 'src/testHelpers/createMockConfig'

jest.mock('src/isClientSide')
jest.mock('src/logDebug')

// stash and restore the system env vars
let env = null

beforeEach(() => {
  // Default to client side context.
  const isClientSide = require('src/isClientSide').default
  isClientSide.mockReturnValue(true)
  env = { ...process.env }
})

afterEach(() => {
  jest.resetModules()
  process.env = env
  env = null
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
      cookies: undefined,
    }
    const expectedConfig = {
      ...mockConfig,
      // Default cookies values.
      cookies: {
        name: undefined,
        keys: undefined,
        domain: undefined,
        httpOnly: true,
        maxAge: 604800000, // week
        overwrite: true,
        path: '/',
        sameSite: 'strict',
        secure: true,
        signed: true,
      },
    }
    setConfig(mockConfig)
    expect(getConfig()).toEqual(expectedConfig)
  })

  it('[client-side] throws if the user does not define the firebaseClientInitConfig', () => {
    expect.assertions(1)
    const isClientSide = require('src/isClientSide').default
    isClientSide.mockReturnValue(true)
    const { setConfig } = require('src/config')
    const mockConfig = {
      ...createMockConfig(),
      firebaseClientInitConfig: undefined,
    }
    expect(() => {
      setConfig(mockConfig)
    }).toThrow(
      'Invalid next-firebase-auth options: The "firebaseClientInitConfig.apiKey" value is required.'
    )
  })

  it('[client-side] throws if the user provides firebaseClientInitConfig without an API key', () => {
    expect.assertions(1)
    const isClientSide = require('src/isClientSide').default
    isClientSide.mockReturnValue(true)
    const { setConfig } = require('src/config')
    const mockConfig = {
      ...createMockConfig(),
      firebaseClientInitConfig: {
        apiKey: undefined,
      },
    }
    expect(() => {
      setConfig(mockConfig)
    }).toThrow(
      'Invalid next-firebase-auth options: The "firebaseClientInitConfig.apiKey" value is required.'
    )
  })

  it('[server-side] throws if the user does not define the firebaseClientInitConfig', () => {
    expect.assertions(1)
    const isClientSide = require('src/isClientSide').default
    isClientSide.mockReturnValue(false)
    const { setConfig } = require('src/config')
    const mockConfig = {
      ...createMockConfig(),
      firebaseClientInitConfig: undefined,
    }
    expect(() => {
      setConfig(mockConfig)
    }).toThrow(
      'Invalid next-firebase-auth options: The "firebaseClientInitConfig.apiKey" value is required.'
    )
  })

  it('[server-side] throws if the user provides firebaseClientInitConfig without an API key', () => {
    expect.assertions(1)
    const isClientSide = require('src/isClientSide').default
    isClientSide.mockReturnValue(false)
    const { setConfig } = require('src/config')
    const mockConfig = {
      ...createMockConfig(),
      firebaseClientInitConfig: {
        firebaseClientInitConfig: {
          apiKey: undefined,
        },
      },
    }
    expect(() => {
      setConfig(mockConfig)
    }).toThrow(
      'Invalid next-firebase-auth options: The "firebaseClientInitConfig.apiKey" value is required.'
    )
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
    }
    expect(() => {
      setConfig(mockConfig)
    }).toThrow(
      'Invalid next-firebase-auth options: The "firebaseAdminInitConfig" private key setting should not be available on the client side.'
    )
  })

  it('[client-side] throws if the user provides a cookies.keys value', () => {
    expect.assertions(1)
    const isClientSide = require('src/isClientSide').default
    isClientSide.mockReturnValue(true)
    const { setConfig } = require('src/config')
    const mockConfigDefault = createMockConfig()
    const mockConfig = {
      ...mockConfigDefault,
      cookies: {
        ...mockConfigDefault.cookies,
        keys: 'thing',
      },
    }
    expect(() => {
      setConfig(mockConfig)
    }).toThrow(
      'Invalid next-firebase-auth options: The "cookies.keys" setting should not be available on the client side.'
    )
  })

  it('[client-side] throws if the user provides a cookies.keys array', () => {
    expect.assertions(1)
    const isClientSide = require('src/isClientSide').default
    isClientSide.mockReturnValue(true)
    const { setConfig } = require('src/config')
    const mockConfigDefault = createMockConfig()
    const mockConfig = {
      ...mockConfigDefault,
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

  it('[client-side] does not throw if the user provides an undefined cookies.keys value', () => {
    expect.assertions(1)
    const isClientSide = require('src/isClientSide').default
    isClientSide.mockReturnValue(true)
    const { setConfig } = require('src/config')
    const mockConfigDefault = createMockConfig()
    const mockConfig = {
      ...mockConfigDefault,
      cookies: {
        ...mockConfigDefault.cookies,
        keys: undefined,
      },
    }
    expect(() => {
      setConfig(mockConfig)
    }).not.toThrow()
  })

  it('[client-side] does not throw if the user provides an empty cookies.keys array', () => {
    expect.assertions(1)
    const isClientSide = require('src/isClientSide').default
    isClientSide.mockReturnValue(true)
    const { setConfig } = require('src/config')
    const mockConfigDefault = createMockConfig()
    const mockConfig = {
      ...mockConfigDefault,
      cookies: {
        ...mockConfigDefault.cookies,
        keys: [],
      },
    }
    expect(() => {
      setConfig(mockConfig)
    }).not.toThrow()
  })

  it('[client-side] does not throw if the user provides a cookies.keys array with only undefined values', () => {
    expect.assertions(1)
    const isClientSide = require('src/isClientSide').default
    isClientSide.mockReturnValue(true)
    const { setConfig } = require('src/config')
    const mockConfigDefault = createMockConfig()
    const mockConfig = {
      ...mockConfigDefault,
      cookies: {
        ...mockConfigDefault.cookies,
        keys: [undefined, undefined],
      },
    }
    expect(() => {
      setConfig(mockConfig)
    }).not.toThrow()
  })

  it('[server-side] throws if the user does not provide cookies.name', () => {
    expect.assertions(1)
    const isClientSide = require('src/isClientSide').default
    isClientSide.mockReturnValue(false)
    const { setConfig } = require('src/config')
    const mockConfigDefault = createMockConfig()
    const mockConfig = {
      ...mockConfigDefault,
      cookies: {
        ...mockConfigDefault.cookies,
        name: undefined,
      },
    }
    expect(() => {
      setConfig(mockConfig)
    }).toThrow(
      'Invalid next-firebase-auth options: The "cookies.name" setting is required on the server side.'
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
        signed: true,
      },
    }
    expect(() => {
      setConfig(mockConfig)
    }).toThrow(
      'Invalid next-firebase-auth options: The "cookies.keys" setting must be set if "cookies.signed" is true.'
    )
  })

  it('[server-side] throws if the user provides an empty cookies.keys array but is using signed cookies', () => {
    expect.assertions(1)
    const isClientSide = require('src/isClientSide').default
    isClientSide.mockReturnValue(false)
    const { setConfig } = require('src/config')
    const mockConfigDefault = createMockConfig()
    const mockConfig = {
      ...mockConfigDefault,
      cookies: {
        ...mockConfigDefault.cookies,
        keys: [],
        signed: true,
      },
    }
    expect(() => {
      setConfig(mockConfig)
    }).toThrow(
      'Invalid next-firebase-auth options: The "cookies.keys" setting must be set if "cookies.signed" is true.'
    )
  })

  it('[server-side] throws if the user provides an cookies.keys array with only undefined values but is using signed cookies', () => {
    expect.assertions(1)
    const isClientSide = require('src/isClientSide').default
    isClientSide.mockReturnValue(false)
    const { setConfig } = require('src/config')
    const mockConfigDefault = createMockConfig()
    const mockConfig = {
      ...mockConfigDefault,
      cookies: {
        ...mockConfigDefault.cookies,
        keys: [undefined, undefined],
        signed: true,
      },
    }
    expect(() => {
      setConfig(mockConfig)
    }).toThrow(
      'Invalid next-firebase-auth options: The "cookies.keys" setting must be set if "cookies.signed" is true.'
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
        maxAge: 14 * 86400000 + 2, // two ms greater than 14 days
      },
    }
    expect(() => {
      setConfig(mockConfig)
    }).toThrow(
      'Invalid next-firebase-auth options: The "cookies.maxAge" setting must be less than two weeks (1209600000 ms).'
    )
  })

  it('throws if the tokenChangedHandler and loginAPIEndpoint are not defined', () => {
    expect.assertions(1)
    const { setConfig } = require('src/config')
    const mockConfigDefault = createMockConfig()
    const mockConfig = {
      ...mockConfigDefault,
      loginAPIEndpoint: undefined,
    }
    expect(() => {
      setConfig(mockConfig)
    }).toThrow(
      'Invalid next-firebase-auth options: The "loginAPIEndpoint" setting is required.'
    )
  })

  it('throws if the tokenChangedHandler and logoutAPIEndpoint are not defined', () => {
    expect.assertions(1)
    const { setConfig } = require('src/config')
    const mockConfigDefault = createMockConfig()
    const mockConfig = {
      ...mockConfigDefault,
      logoutAPIEndpoint: undefined,
    }
    expect(() => {
      setConfig(mockConfig)
    }).toThrow(
      'Invalid next-firebase-auth options: The "logoutAPIEndpoint" setting is required.'
    )
  })

  it('throws if both the tokenChangedHandler and loginAPIEndpoint are defined', () => {
    expect.assertions(1)
    const { setConfig } = require('src/config')
    const mockConfigDefault = createMockConfig()
    const mockConfig = {
      ...mockConfigDefault,
      tokenChangedHandler: async (token) => token,
    }
    expect(() => {
      setConfig(mockConfig)
    }).toThrow(
      'The "loginAPIEndpoint" setting should not be set if you are using a "tokenChangedHandler".'
    )
  })

  it('throws if both the tokenChangedHandler and logoutAPIEndpoint are defined', () => {
    expect.assertions(1)
    const { setConfig } = require('src/config')
    const mockConfigDefault = createMockConfig()
    const mockConfig = {
      ...mockConfigDefault,
      tokenChangedHandler: async (token) => token,
    }
    expect(() => {
      setConfig(mockConfig)
    }).toThrow(
      'The "logoutAPIEndpoint" setting should not be set if you are using a "tokenChangedHandler".'
    )
  })

  it('throws if both the tokenChangedHandler and onLoginRequestError are defined', () => {
    expect.assertions(1)
    const { setConfig } = require('src/config')
    const mockConfigDefault = createMockConfig()
    const mockConfig = {
      ...mockConfigDefault,
      loginAPIEndpoint: undefined,
      logoutAPIEndpoint: undefined,
      onLoginRequestError: () => {},
      tokenChangedHandler: async (token) => token,
    }
    expect(() => {
      setConfig(mockConfig)
    }).toThrow(
      'The "onLoginRequestError" setting should not be set if you are using a "tokenChangedHandler".'
    )
  })

  it('throws if both the tokenChangedHandler and onLogoutRequestError are defined', () => {
    expect.assertions(1)
    const { setConfig } = require('src/config')
    const mockConfigDefault = createMockConfig()
    const mockConfig = {
      ...mockConfigDefault,
      loginAPIEndpoint: undefined,
      logoutAPIEndpoint: undefined,
      onLogoutRequestError: () => {},
      tokenChangedHandler: async (token) => token,
    }
    expect(() => {
      setConfig(mockConfig)
    }).toThrow(
      'The "onLogoutRequestError" setting should not be set if you are using a "tokenChangedHandler".'
    )
  })

  it('throws if onLoginRequestError is not a function', () => {
    expect.assertions(1)
    const { setConfig } = require('src/config')
    const mockConfigDefault = createMockConfig()
    const mockConfig = {
      ...mockConfigDefault,
      onLoginRequestError: 'no errors please',
    }
    expect(() => {
      setConfig(mockConfig)
    }).toThrow(
      'Invalid next-firebase-auth options: The "onLoginRequestError" setting must be a function.'
    )
  })

  it('throws if onLogoutRequestError is not a function', () => {
    expect.assertions(1)
    const { setConfig } = require('src/config')
    const mockConfigDefault = createMockConfig()
    const mockConfig = {
      ...mockConfigDefault,
      onLogoutRequestError: 'no errors please',
    }
    expect(() => {
      setConfig(mockConfig)
    }).toThrow(
      'Invalid next-firebase-auth options: The "onLogoutRequestError" setting must be a function.'
    )
  })

  it('throws if the config.firebaseAuthEmulator has a http or https prefix', () => {
    expect.assertions(1)
    const { setConfig } = require('src/config')
    const mockConfigDefault = createMockConfig()
    const mockConfig = {
      ...mockConfigDefault,
      firebaseAuthEmulatorHost: 'http://localhost:9099',
    }
    expect(() => {
      setConfig(mockConfig)
    }).toThrow(
      'Invalid next-firebase-auth options: The firebaseAuthEmulatorHost should be set without a prefix (e.g., localhost:9099)'
    )
  })

  it('[server-side] throws if config.firebaseAuthEmulatorHost is set, but not the FIREBASE_AUTH_EMULATOR_HOST env var', () => {
    expect.assertions(1)
    const isClientSide = require('src/isClientSide').default
    isClientSide.mockReturnValue(false)
    const { setConfig } = require('src/config')
    const mockConfigDefault = createMockConfig()
    const mockConfig = {
      ...mockConfigDefault,
      firebaseAuthEmulatorHost: 'localhost:9099',
    }
    expect(() => {
      setConfig(mockConfig)
    }).toThrow(
      'The "FIREBASE_AUTH_EMULATOR_HOST" environment variable should be set if you are using the "firebaseAuthEmulatorHost" option'
    )
  })

  it('[server-side] throws if the FIREBASE_AUTH_EMULATOR_HOST env var differs from the one set in the config', () => {
    expect.assertions(1)
    const isClientSide = require('src/isClientSide').default
    isClientSide.mockReturnValue(false)
    const { setConfig } = require('src/config')
    const mockConfigDefault = createMockConfig()
    const mockConfig = {
      ...mockConfigDefault,
      firebaseAuthEmulatorHost: 'localhost:9099',
    }
    process.env.FIREBASE_AUTH_EMULATOR_HOST = 'localhost:8088'
    expect(() => {
      setConfig(mockConfig)
    }).toThrow(
      'The "FIREBASE_AUTH_EMULATOR_HOST" environment variable should be the same as the host set in the config'
    )
  })

  it('[server-side] should not throw if the FIREBASE_AUTH_EMULATOR_HOST env variable is set and matches the one set in the config', () => {
    expect.assertions(1)
    const isClientSide = require('src/isClientSide').default
    isClientSide.mockReturnValue(false)
    const { setConfig } = require('src/config')
    const mockConfigDefault = createMockConfig()
    const mockConfig = {
      ...mockConfigDefault,
      firebaseAuthEmulatorHost: 'localhost:9099',
    }
    process.env.FIREBASE_AUTH_EMULATOR_HOST = 'localhost:9099'
    expect(() => {
      setConfig(mockConfig)
    }).not.toThrow()
  })

  it('does not throw if onVerifyTokenError is undefined', () => {
    expect.assertions(1)
    const { setConfig } = require('src/config')
    const mockConfigDefault = createMockConfig()
    const mockConfig = {
      ...mockConfigDefault,
      onVerifyTokenError: undefined,
    }
    expect(() => {
      setConfig(mockConfig)
    }).not.toThrow()
  })

  it('defaults onVerifyTokenError to a function', () => {
    expect.assertions(1)
    const { getConfig, setConfig } = require('src/config')
    const mockConfigDefault = createMockConfig()
    delete mockConfigDefault.onVerifyTokenError
    setConfig(mockConfigDefault)
    const config = getConfig()
    expect(typeof config.onVerifyTokenError).toEqual('function')
  })

  it('throws if onVerifyTokenError is not a function', () => {
    expect.assertions(1)
    const { setConfig } = require('src/config')
    const mockConfigDefault = createMockConfig()
    const mockConfig = {
      ...mockConfigDefault,
      onVerifyTokenError: 'no errors please',
    }
    expect(() => {
      setConfig(mockConfig)
    }).toThrow(
      'Invalid next-firebase-auth options: The "onVerifyTokenError" setting must be a function.'
    )
  })

  it('does not throw if onTokenRefreshError is undefined', () => {
    expect.assertions(1)
    const { setConfig } = require('src/config')
    const mockConfigDefault = createMockConfig()
    const mockConfig = {
      ...mockConfigDefault,
      onTokenRefreshError: undefined,
    }
    expect(() => {
      setConfig(mockConfig)
    }).not.toThrow()
  })

  it('defaults onTokenRefreshError to a function', () => {
    expect.assertions(1)
    const { getConfig, setConfig } = require('src/config')
    const mockConfigDefault = createMockConfig()
    delete mockConfigDefault.onTokenRefreshError
    setConfig(mockConfigDefault)
    const config = getConfig()
    expect(typeof config.onTokenRefreshError).toEqual('function')
  })

  it('throws if onTokenRefreshError is not a function', () => {
    expect.assertions(1)
    const { setConfig } = require('src/config')
    const mockConfigDefault = createMockConfig()
    const mockConfig = {
      ...mockConfigDefault,
      onTokenRefreshError: false,
    }
    expect(() => {
      setConfig(mockConfig)
    }).toThrow(
      'Invalid next-firebase-auth options: The "onTokenRefreshError" setting must be a function.'
    )
  })
})

describe('config: debug logging', () => {
  it('[server-side] logs the config for debugging', () => {
    expect.assertions(1)
    const logDebug = require('src/logDebug').default
    const isClientSide = require('src/isClientSide').default
    isClientSide.mockReturnValue(false)
    const { setConfig } = require('src/config')
    const mockConfig = createMockConfig()
    setConfig(mockConfig)
    const expectedConfig = {
      ...mockConfig,
      onVerifyTokenError: expect.any(Function),
      onTokenRefreshError: expect.any(Function),
      cookies: {
        ...mockConfig.cookies,
        keys: ['hidden'],
      },
      firebaseAdminInitConfig: {
        ...mockConfig.firebaseAdminInitConfig,
        credential: {
          ...mockConfig.firebaseAdminInitConfig.credential,
          privateKey: 'hidden',
          clientEmail: 'hidden',
        },
      },
    }
    expect(logDebug).toHaveBeenCalledWith(
      'Setting config with provided value:',
      expectedConfig
    )
  })

  // For usage with the useFirebaseAdminDefaultCredential setting:
  // https://github.com/gladly-team/next-firebase-auth/issues/434
  it('[server-side] does not throw an error if the firebaseAdminInitConfig is not set', () => {
    expect.assertions(1)
    const isClientSide = require('src/isClientSide').default
    isClientSide.mockReturnValue(false)
    const { setConfig } = require('src/config')
    const mockConfig = {
      ...createMockConfig(),
      firebaseAdminInitConfig: undefined,
      useFirebaseAdminDefaultCredential: true,
    }
    expect(() => {
      setConfig(mockConfig)
    }).not.toThrow()
  })

  it('[server-side] ignores an unset firebaseAdminInitConfig value when logging for debugging', () => {
    expect.assertions(1)
    const logDebug = require('src/logDebug').default
    const isClientSide = require('src/isClientSide').default
    isClientSide.mockReturnValue(false)
    const { setConfig } = require('src/config')
    const mockConfig = {
      ...createMockConfig(),
      firebaseAdminInitConfig: undefined,
      useFirebaseAdminDefaultCredential: true,
    }
    setConfig(mockConfig)
    const expectedConfig = {
      ...mockConfig,
      onVerifyTokenError: expect.any(Function),
      onTokenRefreshError: expect.any(Function),
      cookies: {
        ...mockConfig.cookies,
        keys: ['hidden'],
      },
      firebaseAdminInitConfig: undefined,
    }
    expect(logDebug).toHaveBeenCalledWith(
      'Setting config with provided value:',
      expectedConfig
    )
  })

  it('[server-side] ignores an unset firebaseAdminInitConfig.credential value when logging for debugging', () => {
    expect.assertions(1)
    const logDebug = require('src/logDebug').default
    const isClientSide = require('src/isClientSide').default
    isClientSide.mockReturnValue(false)
    const { setConfig } = require('src/config')
    const mockConfig = {
      ...createMockConfig(),
      firebaseAdminInitConfig: {
        databaseURL: 'some-database-url-here',
      },
      useFirebaseAdminDefaultCredential: true,
    }
    setConfig(mockConfig)
    const expectedConfig = {
      ...mockConfig,
      onVerifyTokenError: expect.any(Function),
      onTokenRefreshError: expect.any(Function),
      cookies: {
        ...mockConfig.cookies,
        keys: ['hidden'],
      },
      firebaseAdminInitConfig: {
        databaseURL: 'some-database-url-here',
      },
    }
    expect(logDebug).toHaveBeenCalledWith(
      'Setting config with provided value:',
      expectedConfig
    )
  })
})
