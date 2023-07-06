import { getApps, initializeApp } from 'firebase/app'
import { getAuth, connectAuthEmulator } from 'firebase/auth'
import { setConfig } from 'src/config'
import createMockConfig from 'src/testHelpers/createMockConfig'
import logDebug from 'src/logDebug'
import { ConfigInput } from 'src/configTypes'

jest.mock('firebase/app')
jest.mock('firebase/auth')
jest.mock('src/config')
jest.mock('src/logDebug')

const mockGetApps = getApps as jest.Mock
const mockInitializeApp = initializeApp as jest.Mock
const mockGetAuth = getAuth as jest.Mock

beforeEach(() => {
  const mockConfig = createMockConfig()
  setConfig(mockConfig)

  mockGetApps.mockReturnValue([])
})

afterEach(() => {
  jest.clearAllMocks()
})

describe('initFirebaseClientSDK', () => {
  it('calls firebase.initializeApp with the expected values', () => {
    expect.assertions(1)
    const initFirebaseClientSDK = require('src/initFirebaseClientSDK').default
    initFirebaseClientSDK()
    expect(mockInitializeApp).toHaveBeenCalledWith({
      apiKey: 'fakeAPIKey123',
      authDomain: 'my-example-app.firebaseapp.com',
      databaseURL: 'https://my-example-app.firebaseio.com',
      projectId: 'my-example-app-id',
    })
  })

  it('does not call firebase.initializeApp if Firebase already has an initialized app', () => {
    expect.assertions(1)
    mockGetApps.mockReturnValue([{ some: 'app' }])
    const initFirebaseClientSDK = require('src/initFirebaseClientSDK').default
    initFirebaseClientSDK()
    expect(mockInitializeApp).not.toHaveBeenCalled()
  })

  it('throws if config.firebaseClientInitConfig is not set and no app is initialized', () => {
    expect.assertions(1)
    const mockConfig = createMockConfig()
    setConfig({
      ...mockConfig,
      firebaseClientInitConfig:
        undefined as unknown as ConfigInput['firebaseClientInitConfig'],
    })
    const initFirebaseClientSDK = require('src/initFirebaseClientSDK').default
    expect(() => {
      initFirebaseClientSDK()
    }).toThrow(
      'If not initializing the Firebase JS SDK elsewhere, you must provide "firebaseClientInitConfig" to next-firebase-auth.'
    )
  })

  it('does not throw if config.firebaseClientInitConfig is not set but a Firebase app is already initialized', () => {
    expect.assertions(1)
    const mockConfig = createMockConfig()
    setConfig({
      ...mockConfig,
      firebaseClientInitConfig:
        undefined as unknown as ConfigInput['firebaseClientInitConfig'],
    })
    mockGetApps.mockReturnValue([{ some: 'app' }])
    const initFirebaseClientSDK = require('src/initFirebaseClientSDK').default
    expect(() => {
      initFirebaseClientSDK()
    }).not.toThrow()
  })

  it('initializes the client-side auth emulator if config.firebaseAuthEmulatorHost is set', () => {
    expect.assertions(1)
    const mockConfig = createMockConfig()
    setConfig({
      ...mockConfig,
      firebaseAuthEmulatorHost: 'localhost:9099',
    })
    mockGetApps.mockReturnValue([{ some: 'app' }])
    mockGetAuth.mockReturnValue('mockAuth')
    const initFirebaseClientSDK = require('src/initFirebaseClientSDK').default

    initFirebaseClientSDK()
    expect(connectAuthEmulator).toHaveBeenCalledWith(
      'mockAuth',
      'http://localhost:9099'
    )
  })

  it('does not initialize the client-side auth emulator if config.firebaseAuthEmulatorHost is not set', () => {
    expect.assertions(1)
    mockGetApps.mockReturnValue([{ some: 'app' }])
    const initFirebaseClientSDK = require('src/initFirebaseClientSDK').default

    initFirebaseClientSDK()
    expect(connectAuthEmulator).not.toHaveBeenCalled()
  })

  it('calls logDebug when initializing', () => {
    expect.assertions(1)
    const initFirebaseClientSDK = require('src/initFirebaseClientSDK').default
    initFirebaseClientSDK()
    expect(logDebug).toHaveBeenCalledWith(
      '[init] Initialized the Firebase JS SDK.'
    )
  })

  it('calls logDebug when not initializing', () => {
    expect.assertions(1)
    mockGetApps.mockReturnValue([{ some: 'app' }])
    const initFirebaseClientSDK = require('src/initFirebaseClientSDK').default
    initFirebaseClientSDK()
    expect(logDebug).toHaveBeenCalledWith(
      '[init] Did not initialize the Firebase JS SDK because an app already exists.'
    )
  })
})
