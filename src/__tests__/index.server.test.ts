import { setConfig } from 'src/config'
import { setDebugEnabled } from 'src/logDebug'
import setAuthCookies from 'src/setAuthCookies'
import unsetAuthCookies from 'src/unsetAuthCookies'
import withUser from 'src/withUser'
import useUser from 'src/useUser'
import withUserTokenSSR from 'src/withUserTokenSSR'
import initFirebaseAdminSDK from 'src/initFirebaseAdminSDK'
import { verifyIdToken } from 'src/firebaseAdmin'
import getUserFromCookies from 'src/getUserFromCookies'

jest.mock('src/config')
jest.mock('src/logDebug')
jest.mock('src/setAuthCookies')
jest.mock('src/unsetAuthCookies')
jest.mock('src/withUser')
jest.mock('src/useUser')
jest.mock('src/withUserTokenSSR')
jest.mock('src/initFirebaseAdminSDK')
jest.mock('src/firebaseAdmin')
jest.mock('src/getUserFromCookies')

afterEach(() => {
  jest.clearAllMocks()
})

describe('index.server.ts: init', () => {
  it('exports init', () => {
    expect.assertions(2)
    const indexServer = require('src/index.server')
    expect(indexServer.init).toBeDefined()
    expect(indexServer.init).toEqual(expect.any(Function))
  })

  it('calls setDebugEnabled with true if config.debug is true', () => {
    expect.assertions(1)
    const indexServer = require('src/index.server')
    indexServer.init({ debug: true })
    expect(setDebugEnabled).toHaveBeenCalledWith(true)
  })

  it('calls setDebugEnabled with false if config.debug is truthy but non-true', () => {
    expect.assertions(1)
    const indexServer = require('src/index.server')
    indexServer.init({ debug: 'yes' })
    expect(setDebugEnabled).toHaveBeenCalledWith(false)
  })

  it('calls setDebugEnabled with false if config.debug is false', () => {
    expect.assertions(1)
    const indexServer = require('src/index.server')
    indexServer.init({ debug: false })
    expect(setDebugEnabled).toHaveBeenCalledWith(false)
  })

  it('calls setConfig with the provided config', () => {
    expect.assertions(1)
    const indexServer = require('src/index.server')
    indexServer.init({ some: 'config' })
    expect(setConfig).toHaveBeenCalledWith({ some: 'config' })
  })

  // We only initialize the Firebase admin SDK as it's needed. See:
  // https://github.com/gladly-team/next-firebase-auth/issues/70
  it('does not call initFirebaseAdminSDK', () => {
    expect.assertions(1)
    const indexServer = require('src/index.server')
    indexServer.init({ fake: 'config' })
    expect(initFirebaseAdminSDK).not.toHaveBeenCalled()
  })
})

describe('index.server.js: withUser', () => {
  it('exports withUser', () => {
    expect.assertions(2)
    const indexServer = require('src/index.server')
    expect(indexServer.withUser).toBeDefined()
    expect(indexServer.withUser).toEqual(expect.any(Function))
  })

  it('calls the withUser module', () => {
    expect.assertions(1)
    const indexServer = require('src/index.server')
    indexServer.withUser({ appPageURL: '/my-fake-app-page' })
    expect(withUser).toHaveBeenCalledWith({
      appPageURL: '/my-fake-app-page',
    })
  })
})

describe('index.server.js: useUser', () => {
  it('exports useUser', () => {
    expect.assertions(2)
    const indexServer = require('src/index.server')
    expect(indexServer.useUser).toBeDefined()
    expect(indexServer.useUser).toEqual(expect.any(Function))
  })

  it('calls the useUser module', () => {
    expect.assertions(1)
    const indexServer = require('src/index.server')
    indexServer.useUser()
    expect(useUser).toHaveBeenCalled()
  })
})

describe('index.server.js: withUserSSR', () => {
  it('exports withUserSSR', () => {
    expect.assertions(2)
    const indexServer = require('src/index.server')
    expect(indexServer.withUserSSR).toBeDefined()
    expect(indexServer.withUserSSR).toEqual(expect.any(Function))
  })

  it('calls the withUserTokenSSR module with useToken=false', () => {
    expect.assertions(1)
    const indexServer = require('src/index.server')
    indexServer.withUserSSR({ some: 'options' })
    expect(withUserTokenSSR).toHaveBeenCalledWith(
      { some: 'options' },
      { useToken: false }
    )
  })
})

describe('index.server.js: withUserTokenSSR', () => {
  it('exports withUserTokenSSR', () => {
    expect.assertions(2)
    const indexServer = require('src/index.server')
    expect(indexServer.withUserTokenSSR).toBeDefined()
    expect(indexServer.withUserTokenSSR).toEqual(expect.any(Function))
  })

  it('calls the withUserTokenSSR module with useToken=true', () => {
    expect.assertions(1)
    const indexServer = require('src/index.server')
    indexServer.withUserTokenSSR({ some: 'options' })
    expect(withUserTokenSSR).toHaveBeenCalledWith(
      { some: 'options' },
      { useToken: true }
    )
  })
})

describe('index.server.js: setAuthCookies', () => {
  it('exports setAuthCookies', () => {
    expect.assertions(2)
    const indexServer = require('src/index.server')
    expect(indexServer.setAuthCookies).toBeDefined()
    expect(indexServer.setAuthCookies).toEqual(expect.any(Function))
  })

  it('exports the expected module', () => {
    expect.assertions(1)
    const indexServer = require('src/index.server')
    expect(indexServer.setAuthCookies).toEqual(setAuthCookies)
  })
})

describe('index.server.js: unsetAuthCookies', () => {
  it('exports unsetAuthCookies', () => {
    expect.assertions(2)
    const indexServer = require('src/index.server')
    expect(indexServer.unsetAuthCookies).toBeDefined()
    expect(indexServer.unsetAuthCookies).toEqual(expect.any(Function))
  })

  it('exports the expected module', () => {
    expect.assertions(1)
    const indexServer = require('src/index.server')
    expect(indexServer.unsetAuthCookies).toEqual(unsetAuthCookies)
  })
})

describe('index.server.js: verifyIdToken', () => {
  it('exports verifyIdToken', () => {
    expect.assertions(2)
    const indexServer = require('src/index.server')
    expect(indexServer.verifyIdToken).toBeDefined()
    expect(indexServer.verifyIdToken).toEqual(expect.any(Function))
  })

  it('exports the expected module', () => {
    expect.assertions(1)
    const indexServer = require('src/index.server')
    expect(indexServer.verifyIdToken).toEqual(verifyIdToken)
  })
})

describe('index.server.js: getUserFromCookies', () => {
  it('exports getUserFromCookies', () => {
    expect.assertions(2)
    const indexServer = require('src/index.server')
    expect(indexServer.getUserFromCookies).toBeDefined()
    expect(indexServer.getUserFromCookies).toEqual(expect.any(Function))
  })

  it('exports the expected module', () => {
    expect.assertions(1)
    const indexServer = require('src/index.server')
    expect(indexServer.getUserFromCookies).toEqual(getUserFromCookies)
  })
})
