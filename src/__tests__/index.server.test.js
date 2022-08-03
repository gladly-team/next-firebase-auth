import { setConfig } from 'src/config'
import { setDebugEnabled } from 'src/logDebug'
import setAuthCookies from 'src/setAuthCookies'
import unsetAuthCookies from 'src/unsetAuthCookies'
import withAuthUser from 'src/withAuthUser'
import useAuthUser from 'src/useAuthUser'
import withAuthUserTokenSSR from 'src/withAuthUserTokenSSR'
import initFirebaseAdminSDK from 'src/initFirebaseAdminSDK'
import { verifyIdToken } from 'src/firebaseAdmin'
import getUserFromCookies from 'src/getUserFromCookies'

jest.mock('src/config')
jest.mock('src/logDebug')
jest.mock('src/setAuthCookies')
jest.mock('src/unsetAuthCookies')
jest.mock('src/withAuthUser')
jest.mock('src/useAuthUser')
jest.mock('src/withAuthUserTokenSSR')
jest.mock('src/initFirebaseAdminSDK')
jest.mock('src/firebaseAdmin')
jest.mock('src/getUserFromCookies')

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

  it('calls setDebugEnabled with true if config.debug is true', () => {
    expect.assertions(1)
    const indexServer = require('src/index.server').default
    indexServer.init({ debug: true })
    expect(setDebugEnabled).toHaveBeenCalledWith(true)
  })

  it('calls setDebugEnabled with false if config.debug is truthy but non-true', () => {
    expect.assertions(1)
    const indexServer = require('src/index.server').default
    indexServer.init({ debug: 'yes' })
    expect(setDebugEnabled).toHaveBeenCalledWith(false)
  })

  it('calls setDebugEnabled with false if config.debug is false', () => {
    expect.assertions(1)
    const indexServer = require('src/index.server').default
    indexServer.init({ debug: false })
    expect(setDebugEnabled).toHaveBeenCalledWith(false)
  })

  it('calls setConfig with the provided config', () => {
    expect.assertions(1)
    const indexServer = require('src/index.server').default
    indexServer.init({ some: 'config' })
    expect(setConfig).toHaveBeenCalledWith({ some: 'config' })
  })

  // We only initialize the Firebase admin SDK as it's needed. See:
  // https://github.com/gladly-team/next-firebase-auth/issues/70
  it('does not call initFirebaseAdminSDK', () => {
    expect.assertions(1)
    const indexServer = require('src/index.server').default
    indexServer.init({ fake: 'config' })
    expect(initFirebaseAdminSDK).not.toHaveBeenCalled()
  })
})

describe('index.server.js: withAuthUser', () => {
  it('exports withAuthUser', () => {
    expect.assertions(2)
    const indexServer = require('src/index.server').default
    expect(indexServer.withAuthUser).toBeDefined()
    expect(indexServer.withAuthUser).toEqual(expect.any(Function))
  })

  it('calls the withAuthUser module', () => {
    expect.assertions(1)
    const indexServer = require('src/index.server').default
    indexServer.withAuthUser({ appPageURL: '/my-fake-app-page' })
    expect(withAuthUser).toHaveBeenCalledWith({
      appPageURL: '/my-fake-app-page',
    })
  })
})

describe('index.server.js: useAuthUser', () => {
  it('exports useAuthUser', () => {
    expect.assertions(2)
    const indexServer = require('src/index.server').default
    expect(indexServer.useAuthUser).toBeDefined()
    expect(indexServer.useAuthUser).toEqual(expect.any(Function))
  })

  it('calls the useAuthUser module', () => {
    expect.assertions(1)
    const indexServer = require('src/index.server').default
    indexServer.useAuthUser()
    expect(useAuthUser).toHaveBeenCalled()
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

describe('index.server.js: getUserFromCookies', () => {
  it('exports getUserFromCookies', () => {
    expect.assertions(2)
    const indexServer = require('src/index.server').default
    expect(indexServer.getUserFromCookies).toBeDefined()
    expect(indexServer.getUserFromCookies).toEqual(expect.any(Function))
  })

  it('exports the expected module', () => {
    expect.assertions(1)
    const indexServer = require('src/index.server').default
    expect(indexServer.getUserFromCookies).toEqual(getUserFromCookies)
  })
})
