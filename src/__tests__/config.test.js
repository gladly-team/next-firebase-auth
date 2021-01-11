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

  it('throws if the loginAPIEndpoint is not defined', () => {
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

  it('throws if the logoutAPIEndpoint is not defined', () => {
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
})
