import setAuthCookies from 'src/setAuthCookies'
import unsetAuthCookies from 'src/unsetAuthCookies'
import withAuthUserTokenSSR from 'src/withAuthUserTokenSSR'
import initFirebaseAdminSDK from 'src/initFirebaseAdminSDK'

jest.mock('src/index')
jest.mock('src/setAuthCookies')
jest.mock('src/unsetAuthCookies')
jest.mock('src/withAuthUserTokenSSR')
jest.mock('src/initFirebaseAdminSDK')

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
})

describe('index.server.js: withAuthUserTokenSSR', () => {
  it('exports withAuthUserTokenSSR', () => {
    expect.assertions(2)
    const indexServer = require('src/index.server').default
    expect(indexServer.withAuthUserTokenSSR).toBeDefined()
    expect(indexServer.withAuthUserTokenSSR).toEqual(expect.any(Function))
  })

  it('exports the expected module', () => {
    expect.assertions(1)
    const indexServer = require('src/index.server').default
    expect(indexServer.withAuthUserTokenSSR).toEqual(withAuthUserTokenSSR)
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
