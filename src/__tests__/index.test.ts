import { setConfig } from 'src/config'
import { setDebugEnabled } from 'src/logDebug'
import initFirebaseClientSDK from 'src/initFirebaseClientSDK'
import isClientSide from 'src/isClientSide'

jest.mock('src/config')
jest.mock('src/logDebug')
jest.mock('src/initFirebaseClientSDK')
jest.mock('src/isClientSide')

const mockIsClientSide = jest.mocked(isClientSide)

beforeEach(() => {
  mockIsClientSide.mockReturnValue(true)
})

afterEach(() => {
  jest.clearAllMocks()
})

describe('index.ts: init', () => {
  it('exports init', () => {
    expect.assertions(2)
    const index = require('src/index')
    expect(index.init).toBeDefined()
    expect(index.init).toEqual(expect.any(Function))
  })

  it('calls setDebugEnabled with true if config.debug is true', () => {
    expect.assertions(1)
    const index = require('src/index')
    index.init({ debug: true })
    expect(setDebugEnabled).toHaveBeenCalledWith(true)
  })

  it('calls setDebugEnabled with false if config.debug is truthy but non-true', () => {
    expect.assertions(1)
    const index = require('src/index')
    index.init({ debug: 'yes' })
    expect(setDebugEnabled).toHaveBeenCalledWith(false)
  })

  it('calls setDebugEnabled with false if config.debug is false', () => {
    expect.assertions(1)
    const index = require('src/index')
    index.init({ debug: false })
    expect(setDebugEnabled).toHaveBeenCalledWith(false)
  })

  it('calls setConfig with the provided config', () => {
    expect.assertions(1)
    const index = require('src/index')
    index.init({ some: 'config' })
    expect(setConfig).toHaveBeenCalledWith({ some: 'config' })
  })

  it('calls initFirebaseClientSDK if on the client side', () => {
    expect.assertions(1)
    mockIsClientSide.mockReturnValue(true)
    const index = require('src/index')
    index.init()
    expect(initFirebaseClientSDK).toHaveBeenCalled()
  })

  it('does not call initFirebaseClientSDK if on the server side', () => {
    expect.assertions(1)
    mockIsClientSide.mockReturnValue(false)
    const index = require('src/index')
    index.init()
    expect(initFirebaseClientSDK).not.toHaveBeenCalled()
  })
})

describe('index.ts: withUser', () => {
  it('exports withUser', () => {
    expect.assertions(2)
    const index = require('src/index')
    expect(index.withUser).toBeDefined()
    expect(index.withUser).toEqual(expect.any(Function))
  })
})

describe('index.ts: useUser', () => {
  it('exports useUser', () => {
    expect.assertions(2)
    const index = require('src/index')
    expect(index.useUser).toBeDefined()
    expect(index.useUser).toEqual(expect.any(Function))
  })
})

describe('index.ts: withUserSSR', () => {
  it('exports withUserSSR', () => {
    expect.assertions(2)
    const index = require('src/index')
    expect(index.withUserSSR).toBeDefined()
    expect(index.withUserSSR).toEqual(expect.any(Function))
  })

  it('throws if called on the client side', () => {
    expect.assertions(1)
    mockIsClientSide.mockReturnValue(true)
    const index = require('src/index')
    expect(() => {
      index.withUserSSR()
    }).toThrow('"withUserSSR" can only be called server-side.')
  })
})

describe('index.ts: withUserTokenSSR', () => {
  it('exports withUserTokenSSR', () => {
    expect.assertions(2)
    const index = require('src/index')
    expect(index.withUserTokenSSR).toBeDefined()
    expect(index.withUserTokenSSR).toEqual(expect.any(Function))
  })

  it('throws if called on the client side', () => {
    expect.assertions(1)
    mockIsClientSide.mockReturnValue(true)
    const index = require('src/index')
    expect(() => {
      index.withUserTokenSSR()
    }).toThrow('"withUserTokenSSR" can only be called server-side.')
  })
})

describe('index.ts: setAuthCookies', () => {
  it('exports setAuthCookies', () => {
    expect.assertions(2)
    const index = require('src/index')
    expect(index.setAuthCookies).toBeDefined()
    expect(index.setAuthCookies).toEqual(expect.any(Function))
  })

  it('throws if called on the client side', () => {
    expect.assertions(1)
    mockIsClientSide.mockReturnValue(true)
    const index = require('src/index')
    expect(() => {
      index.setAuthCookies()
    }).toThrow('"setAuthCookies" can only be called server-side.')
  })
})

describe('index.ts: unsetAuthCookies', () => {
  it('exports unsetAuthCookies', () => {
    expect.assertions(2)
    const index = require('src/index')
    expect(index.unsetAuthCookies).toBeDefined()
    expect(index.unsetAuthCookies).toEqual(expect.any(Function))
  })

  it('throws if called on the client side', () => {
    expect.assertions(1)
    mockIsClientSide.mockReturnValue(true)
    const index = require('src/index')
    expect(() => {
      index.unsetAuthCookies()
    }).toThrow('"unsetAuthCookies" can only be called server-side.')
  })
})

describe('index.ts: verifyIdToken', () => {
  it('exports verifyIdToken', () => {
    expect.assertions(2)
    const index = require('src/index')
    expect(index.verifyIdToken).toBeDefined()
    expect(index.verifyIdToken).toEqual(expect.any(Function))
  })

  it('throws if called on the client side', () => {
    expect.assertions(1)
    mockIsClientSide.mockReturnValue(true)
    const index = require('src/index')
    expect(() => {
      index.verifyIdToken()
    }).toThrow('"verifyIdToken" can only be called server-side.')
  })
})

describe('index.ts: AuthAction', () => {
  it('defines the expected constants', () => {
    expect.assertions(1)
    const index = require('src/index')
    expect(index.AuthAction).toEqual({
      RENDER: 'render',
      SHOW_LOADER: 'showLoader',
      RETURN_NULL: 'returnNull',
      REDIRECT_TO_LOGIN: 'redirectToLogin',
      REDIRECT_TO_APP: 'redirectToApp',
    })
  })
})

describe('index.ts: getUserFromCookies', () => {
  it('exports getUserFromCookies', () => {
    expect.assertions(2)
    const index = require('src/index')
    expect(index.getUserFromCookies).toBeDefined()
    expect(index.getUserFromCookies).toEqual(expect.any(Function))
  })

  it('throws if called on the client side', () => {
    expect.assertions(1)
    mockIsClientSide.mockReturnValue(true)
    const index = require('src/index')
    expect(() => {
      index.getUserFromCookies()
    }).toThrow('"getUserFromCookies" can only be called server-side.')
  })
})
