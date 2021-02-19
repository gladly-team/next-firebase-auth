import setAuthCookies from 'src/setAuthCookies'
import unsetAuthCookies from 'src/unsetAuthCookies'
import withAuthUserTokenSSR from 'src/withAuthUserTokenSSR'
import initFirebaseAdminSDK from 'src/initFirebaseAdminSDK'
import { verifyIdToken } from 'src/firebaseAdmin'

jest.mock('src/index')
jest.mock('src/setAuthCookies')
jest.mock('src/unsetAuthCookies')
jest.mock('src/withAuthUserTokenSSR')
jest.mock('src/initFirebaseAdminSDK')
jest.mock('src/firebaseAdmin')

afterEach(() => {
  jest.clearAllMocks()
})

describe('index.server.js: init', () => {
  it('exports init', () => {
    expect.assertions(2)
    const indexServer = require('src/index.server').default
    expect(indexServer.init).toBeDefined()
    expect(indexServer.init).toEqual(expect.any(Function))
  })

  // We only initialize the Firebase admin SDK as it's needed. See:
  // https://github.com/gladly-team/next-firebase-auth/issues/70
  it('does not call initFirebaseAdminSDK', () => {
    expect.assertions(1)
    const indexServer = require('src/index.server').default
    indexServer.init({ fake: 'config' })
    expect(initFirebaseAdminSDK).not.toHaveBeenCalled()
  })

  it('calls index.js (client) init', () => {
    expect.assertions(1)
    const indexServer = require('src/index.server').default
    const index = require('src/index').default
    indexServer.init({ fake: 'config' })
    expect(index.init).toHaveBeenCalledWith({ fake: 'config' })
  })

  it('returns the value of the index.js (client) init', () => {
    expect.assertions(1)
    const indexServer = require('src/index.server').default
    const index = require('src/index').default
    index.init.mockReturnValueOnce({ some: 'response' })
    const response = indexServer.init({ fake: 'config' })
    expect(response).toEqual({ some: 'response' })
  })
})

describe('index.server.js: withAuthUser', () => {
  it('exports withAuthUser', () => {
    expect.assertions(2)
    const indexServer = require('src/index.server').default
    expect(indexServer.withAuthUser).toBeDefined()
    expect(indexServer.withAuthUser).toEqual(expect.any(Function))
  })

  it("matches index.js's withAuthUser", () => {
    expect.assertions(1)
    const indexServer = require('src/index.server').default
    const index = require('src/index').default
    expect(indexServer.withAuthUser).toEqual(index.withAuthUser)
  })
})

describe('index.server.js: useAuthUser', () => {
  it('exports useAuthUser', () => {
    expect.assertions(2)
    const indexServer = require('src/index.server').default
    expect(indexServer.useAuthUser).toBeDefined()
    expect(indexServer.useAuthUser).toEqual(expect.any(Function))
  })

  it("matches index.js's useAuthUser", () => {
    expect.assertions(1)
    const indexServer = require('src/index.server').default
    const index = require('src/index').default
    expect(indexServer.useAuthUser).toEqual(index.useAuthUser)
  })
})

describe('index.server.js: withAuthUserSSR', () => {
  it('exports withAuthUserSSR', () => {
    expect.assertions(2)
    const indexServer = require('src/index.server').default
    expect(indexServer.withAuthUserSSR).toBeDefined()
    expect(indexServer.withAuthUserSSR).toEqual(expect.any(Function))
  })

  it('calls the withAuthUserTokenSSR module with useToken=false', () => {
    expect.assertions(1)
    const indexServer = require('src/index.server').default
    indexServer.withAuthUserSSR({ some: 'options' })
    expect(withAuthUserTokenSSR).toHaveBeenCalledWith(
      { some: 'options' },
      { useToken: false }
    )
  })
})

describe('index.server.js: withAuthUserTokenSSR', () => {
  it('exports withAuthUserTokenSSR', () => {
    expect.assertions(2)
    const indexServer = require('src/index.server').default
    expect(indexServer.withAuthUserTokenSSR).toBeDefined()
    expect(indexServer.withAuthUserTokenSSR).toEqual(expect.any(Function))
  })

  it('calls the withAuthUserTokenSSR module with useToken=true', () => {
    expect.assertions(1)
    const indexServer = require('src/index.server').default
    indexServer.withAuthUserTokenSSR({ some: 'options' })
    expect(withAuthUserTokenSSR).toHaveBeenCalledWith(
      { some: 'options' },
      { useToken: true }
    )
  })
})

describe('index.server.js: setAuthCookies', () => {
  it('exports setAuthCookies', () => {
    expect.assertions(2)
    const indexServer = require('src/index.server').default
    expect(indexServer.setAuthCookies).toBeDefined()
    expect(indexServer.setAuthCookies).toEqual(expect.any(Function))
  })

  it('exports the expected module', () => {
    expect.assertions(1)
    const indexServer = require('src/index.server').default
    expect(indexServer.setAuthCookies).toEqual(setAuthCookies)
  })
})

describe('index.server.js: unsetAuthCookies', () => {
  it('exports unsetAuthCookies', () => {
    expect.assertions(2)
    const indexServer = require('src/index.server').default
    expect(indexServer.unsetAuthCookies).toBeDefined()
    expect(indexServer.unsetAuthCookies).toEqual(expect.any(Function))
  })

  it('exports the expected module', () => {
    expect.assertions(1)
    const indexServer = require('src/index.server').default
    expect(indexServer.unsetAuthCookies).toEqual(unsetAuthCookies)
  })
})

describe('index.server.js: verifyIdToken', () => {
  it('exports verifyIdToken', () => {
    expect.assertions(2)
    const indexServer = require('src/index.server').default
    expect(indexServer.verifyIdToken).toBeDefined()
    expect(indexServer.verifyIdToken).toEqual(expect.any(Function))
  })

  it('exports the expected module', () => {
    expect.assertions(1)
    const indexServer = require('src/index.server').default
    expect(indexServer.verifyIdToken).toEqual(verifyIdToken)
  })
})
