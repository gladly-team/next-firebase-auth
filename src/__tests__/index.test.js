import { setConfig } from 'src/config'
import { setDebugEnabled } from 'src/logDebug'
import initFirebaseClientSDK from 'src/initFirebaseClientSDK'
import isClientSide from 'src/isClientSide'

jest.mock('src/config')
jest.mock('src/logDebug')
jest.mock('src/initFirebaseClientSDK')
jest.mock('src/isClientSide')

beforeEach(() => {
  isClientSide.mockReturnValue(true)
})

afterEach(() => {
  jest.clearAllMocks()
})

describe('index.js: init', () => {
  it('exports init', () => {
    expect.assertions(2)
    const index = require('src/index').default
    expect(index.init).toBeDefined()
    expect(index.init).toEqual(expect.any(Function))
  })

  it('calls setDebugEnabled with true if config.debug is true', () => {
    expect.assertions(1)
    const index = require('src/index').default
    index.init({ debug: true })
    expect(setDebugEnabled).toHaveBeenCalledWith(true)
  })

  it('calls setDebugEnabled with false if config.debug is truthy but non-true', () => {
    expect.assertions(1)
    const index = require('src/index').default
    index.init({ debug: 'yes' })
    expect(setDebugEnabled).toHaveBeenCalledWith(false)
  })

  it('calls setDebugEnabled with false if config.debug is false', () => {
    expect.assertions(1)
    const index = require('src/index').default
    index.init({ debug: false })
    expect(setDebugEnabled).toHaveBeenCalledWith(false)
  })

  it('calls setConfig with the provided config', () => {
    expect.assertions(1)
    const index = require('src/index').default
    index.init({ some: 'config' })
    expect(setConfig).toHaveBeenCalledWith({ some: 'config' })
  })

  it('calls initFirebaseClientSDK if on the client side', () => {
    expect.assertions(1)
    isClientSide.mockReturnValue(true)
    const index = require('src/index').default
    index.init()
    expect(initFirebaseClientSDK).toHaveBeenCalled()
  })

  it('does not call initFirebaseClientSDK if on the server side', () => {
    expect.assertions(1)
    isClientSide.mockReturnValue(false)
    const index = require('src/index').default
    index.init()
    expect(initFirebaseClientSDK).not.toHaveBeenCalled()
  })
})

describe('index.js: withAuthUser', () => {
  it('exports withAuthUser', () => {
    expect.assertions(2)
    const index = require('src/index').default
    expect(index.withAuthUser).toBeDefined()
    expect(index.withAuthUser).toEqual(expect.any(Function))
  })
})

describe('index.js: useAuthUser', () => {
  it('exports useAuthUser', () => {
    expect.assertions(2)
    const index = require('src/index').default
    expect(index.useAuthUser).toBeDefined()
    expect(index.useAuthUser).toEqual(expect.any(Function))
  })
})

describe('index.js: withAuthUserSSR', () => {
  it('exports withAuthUserSSR', () => {
    expect.assertions(2)
    const index = require('src/index').default
    expect(index.withAuthUserSSR).toBeDefined()
    expect(index.withAuthUserSSR).toEqual(expect.any(Function))
  })

  it('throws if called on the client side', () => {
    expect.assertions(1)
    isClientSide.mockReturnValue(true)
    const index = require('src/index').default
    expect(() => {
      index.withAuthUserSSR()
    }).toThrow('"withAuthUserSSR" can only be called server-side.')
  })
})

describe('index.js: withAuthUserTokenSSR', () => {
  it('exports withAuthUserTokenSSR', () => {
    expect.assertions(2)
    const index = require('src/index').default
    expect(index.withAuthUserTokenSSR).toBeDefined()
    expect(index.withAuthUserTokenSSR).toEqual(expect.any(Function))
  })

  it('throws if called on the client side', () => {
    expect.assertions(1)
    isClientSide.mockReturnValue(true)
    const index = require('src/index').default
    expect(() => {
      index.withAuthUserTokenSSR()
    }).toThrow('"withAuthUserTokenSSR" can only be called server-side.')
  })
})

describe('index.js: setAuthCookies', () => {
  it('exports setAuthCookies', () => {
    expect.assertions(2)
    const index = require('src/index').default
    expect(index.setAuthCookies).toBeDefined()
    expect(index.setAuthCookies).toEqual(expect.any(Function))
  })

  it('throws if called on the client side', () => {
    expect.assertions(1)
    isClientSide.mockReturnValue(true)
    const index = require('src/index').default
    expect(() => {
      index.setAuthCookies()
    }).toThrow('"setAuthCookies" can only be called server-side.')
  })
})

describe('index.js: unsetAuthCookies', () => {
  it('exports unsetAuthCookies', () => {
    expect.assertions(2)
    const index = require('src/index').default
    expect(index.unsetAuthCookies).toBeDefined()
    expect(index.unsetAuthCookies).toEqual(expect.any(Function))
  })

  it('throws if called on the client side', () => {
    expect.assertions(1)
    isClientSide.mockReturnValue(true)
    const index = require('src/index').default
    expect(() => {
      index.unsetAuthCookies()
    }).toThrow('"unsetAuthCookies" can only be called server-side.')
  })
})

describe('index.js: verifyIdToken', () => {
  it('exports verifyIdToken', () => {
    expect.assertions(2)
    const index = require('src/index').default
    expect(index.verifyIdToken).toBeDefined()
    expect(index.verifyIdToken).toEqual(expect.any(Function))
  })

  it('throws if called on the client side', () => {
    expect.assertions(1)
    isClientSide.mockReturnValue(true)
    const index = require('src/index').default
    expect(() => {
      index.verifyIdToken()
    }).toThrow('"verifyIdToken" can only be called server-side.')
  })
})

describe('index.js: getFirebaseAdmin', () => {
  it('exports getFirebaseAdmin', () => {
    expect.assertions(2)
    const index = require('src/index').default
    expect(index.getFirebaseAdmin).toBeDefined()
    expect(index.getFirebaseAdmin).toEqual(expect.any(Function))
  })

  it('throws if called on the client side', () => {
    expect.assertions(1)
    isClientSide.mockReturnValue(true)
    const index = require('src/index').default
    expect(() => {
      index.getFirebaseAdmin()
    }).toThrow('"getFirebaseAdmin" can only be called server-side.')
  })
})

describe('index.js: AuthAction', () => {
  it('defines the expected constants', () => {
    expect.assertions(1)
    const index = require('src/index').default
    expect(index.AuthAction).toEqual({
      RENDER: 'render',
      SHOW_LOADER: 'showLoader',
      RETURN_NULL: 'returnNull',
      REDIRECT_TO_LOGIN: 'redirectToLogin',
      REDIRECT_TO_APP: 'redirectToApp',
    })
  })
})
