// Allow importing firebase-admin as wildcard.
/* eslint-disable no-import-assign */

import * as admin from 'firebase-admin'
import { setConfig } from 'src/config'
import createMockConfig from 'src/testHelpers/createMockConfig'

jest.mock('firebase-admin')
jest.mock('src/config')

beforeEach(() => {
  const mockConfig = createMockConfig({ clientSide: false })
  setConfig(mockConfig)

  admin.credential.cert.mockImplementation((obj) => ({
    ...obj,
    _mockFirebaseCert: true,
  }))
  admin.apps = []
})

afterEach(() => {
  jest.clearAllMocks()
})

describe('initFirebaseAdminSDK', () => {
  it('calls admin.initializeApp with the expected values', () => {
    expect.assertions(1)
    const initFirebaseAdminSDK = require('src/initFirebaseAdminSDK').default
    initFirebaseAdminSDK()
    expect(admin.initializeApp).toHaveBeenCalledWith({
      credential: {
        _mockFirebaseCert: true,
        clientEmail: 'my-example-app@example.com',
        privateKey: 'fakePrivateKey123',
        projectId: 'my-example-app',
      },
      databaseURL: 'https://my-example-app.firebaseio.com',
    })
  })

  it('returns the admin app', () => {
    expect.assertions(1)
    const initFirebaseAdminSDK = require('src/initFirebaseAdminSDK').default
    const response = initFirebaseAdminSDK()
    expect(response).toEqual(admin)
  })

  it('does not call admin.initializeApp if Firebase already has an initialized app', () => {
    expect.assertions(1)
    admin.apps = [{ some: 'app' }]
    const initFirebaseAdminSDK = require('src/initFirebaseAdminSDK').default
    initFirebaseAdminSDK()
    expect(admin.initializeApp).not.toHaveBeenCalled()
  })

  it('throws if config.firebaseAdminInitConfig is not set and no app is initialized', () => {
    expect.assertions(1)
    const mockConfig = createMockConfig({ clientSide: false })
    setConfig({
      ...mockConfig,
      firebaseAdminInitConfig: undefined,
    })
    const initFirebaseAdminSDK = require('src/initFirebaseAdminSDK').default
    expect(() => {
      initFirebaseAdminSDK()
    }).toThrow(
      'If not initializing the Firebase admin SDK elsewhere, you must provide "firebaseAdminInitConfig" to next-firebase-auth.'
    )
  })

  it('does not throw if config.firebaseAdminInitConfig is not set but a Firebase app is already initialized', () => {
    expect.assertions(1)
    const mockConfig = createMockConfig({ clientSide: false })
    setConfig({
      ...mockConfig,
      firebaseAdminInitConfig: undefined,
    })
    admin.apps = [{ some: 'app' }]
    const initFirebaseAdminSDK = require('src/initFirebaseAdminSDK').default
    expect(() => {
      initFirebaseAdminSDK()
    }).not.toThrow()
  })
})
