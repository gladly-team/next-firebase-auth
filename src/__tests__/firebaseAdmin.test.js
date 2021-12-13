import { createMockFirebaseUserAdminSDK } from 'src/testHelpers/authUserInputs'
import createMockFetchResponse from 'src/testHelpers/createMockFetchResponse'
import createAuthUser from 'src/createAuthUser'
import { setConfig, getConfig } from 'src/config'
import createMockConfig from 'src/testHelpers/createMockConfig'
import getFirebaseAdminApp from 'src/initFirebaseAdminSDK'

// We're not mocking initFirebaseAdminSDK.js, instead just mocking
// the underyling Firebase admin app.
jest.mock('firebase-admin')

// stash and restore the system env vars
let env = null

beforeEach(() => {
  // `fetch` is polyfilled by Next.js.
  global.fetch = jest.fn(() => Promise.resolve(createMockFetchResponse()))

  const mockConfig = createMockConfig()
  setConfig({
    ...mockConfig,
    firebaseClientInitConfig: {
      ...mockConfig.firebaseClientInitConfig,
      apiKey: 'some-key',
    },
  })
  env = { ...process.env }
})

afterEach(() => {
  process.env = env
  env = null
})

const googleRefreshTokenEndpoint = 'https://securetoken.googleapis.com/v1/token'
const googleCustomTokenEndpoint =
  'https://identitytoolkit.googleapis.com/v1/accounts:signInWithCustomToken'

describe('verifyIdToken', () => {
  it('returns an AuthUser', async () => {
    expect.assertions(1)
    const { verifyIdToken } = require('src/firebaseAdmin')
    const mockFirebaseUser = createMockFirebaseUserAdminSDK()
    const expectedReturn = createAuthUser({
      firebaseUserAdminSDK: mockFirebaseUser,
      token: 'some-token',
    })
    const admin = getFirebaseAdminApp()
    admin.auth().verifyIdToken.mockResolvedValue(mockFirebaseUser)
    const response = await verifyIdToken('some-token')
    expect(response).toEqual({
      ...expectedReturn,
      getIdToken: expect.any(Function),
      serialize: expect.any(Function),
      signOut: expect.any(Function),
    })
  })

  it('returns an AuthUser with the same token when the token has not expired', async () => {
    expect.assertions(1)
    const { verifyIdToken } = require('src/firebaseAdmin')
    const mockFirebaseUser = createMockFirebaseUserAdminSDK()
    const admin = getFirebaseAdminApp()
    admin.auth().verifyIdToken.mockResolvedValue(mockFirebaseUser)
    const AuthUser = await verifyIdToken('some-token')
    const token = await AuthUser.getIdToken()
    expect(token).toEqual('some-token')
  })

  it('returns an AuthUser with a new token when the token is refreshed because of a Firebase auth/id-token-expired error', async () => {
    expect.assertions(1)
    const { verifyIdToken } = require('src/firebaseAdmin')

    // Mock the behavior of refreshing the token.
    global.fetch.mockImplementation(async (endpoint) => {
      if (endpoint.indexOf(googleRefreshTokenEndpoint) === 0) {
        return {
          ...createMockFetchResponse(),
          json: () => Promise.resolve({ id_token: 'a-new-token' }),
        }
      }
      // Incorrect endpoint. Return a 500.
      return { ...createMockFetchResponse(), ok: false, status: 500 }
    })

    // Mock that the original token is expired but a new token works.
    const expiredTokenErr = new Error(
      'The provided Firebase ID token is expired.'
    )
    expiredTokenErr.code = 'auth/id-token-expired'
    const mockFirebaseUser = createMockFirebaseUserAdminSDK()
    const admin = getFirebaseAdminApp()
    admin.auth().verifyIdToken.mockImplementation(async (token) => {
      if (token === 'some-token') {
        throw expiredTokenErr
      } else {
        return mockFirebaseUser
      }
    })
    const AuthUser = await verifyIdToken('some-token', 'my-refresh-token')
    const token = await AuthUser.getIdToken()
    expect(token).toEqual('a-new-token')
  })

  it('returns an AuthUser with a new token when the token is refreshed because of a Firebase auth/argument-error error', async () => {
    expect.assertions(1)
    const { verifyIdToken } = require('src/firebaseAdmin')

    // Mock the behavior of refreshing the token.
    global.fetch.mockImplementation(async (endpoint) => {
      if (endpoint.indexOf(googleRefreshTokenEndpoint) === 0) {
        return {
          ...createMockFetchResponse(),
          json: () => Promise.resolve({ id_token: 'a-new-token' }),
        }
      }
      // Incorrect endpoint. Return a 500.
      return { ...createMockFetchResponse(), ok: false, status: 500 }
    })

    // Mock that the original token is expired but a new token works.
    const expiredTokenErr = new Error(
      'Firebase ID token has "kid" claim which does not correspond to a known public key. Most likely the ID token is expired, so get a fresh token from your client app and try again.'
    )
    expiredTokenErr.code = 'auth/argument-error'
    const mockFirebaseUser = createMockFirebaseUserAdminSDK()
    const admin = getFirebaseAdminApp()
    admin.auth().verifyIdToken.mockImplementation(async (token) => {
      if (token === 'some-token') {
        throw expiredTokenErr
      } else {
        return mockFirebaseUser
      }
    })
    const AuthUser = await verifyIdToken('some-token', 'my-refresh-token')
    const token = await AuthUser.getIdToken()
    expect(token).toEqual('a-new-token')
  })

  it('calls the Google token refresh endpoint with the public Firebase API key as a query parameter value', async () => {
    expect.assertions(1)
    const { verifyIdToken } = require('src/firebaseAdmin')

    // Set the Firebase API key.
    const mockConfig = createMockConfig()
    setConfig({
      ...mockConfig,
      firebaseClientInitConfig: {
        ...mockConfig.firebaseClientInitConfig,
        apiKey: 'the-expected-api-key',
      },
    })

    // Mock that the original token is expired but a new token works.
    const expiredTokenErr = new Error(
      'The provided Firebase ID token is expired.'
    )
    expiredTokenErr.code = 'auth/id-token-expired'
    const mockFirebaseUser = createMockFirebaseUserAdminSDK()
    const admin = getFirebaseAdminApp()
    admin.auth().verifyIdToken.mockImplementation(async (token) => {
      if (token === 'some-token') {
        throw expiredTokenErr
      } else {
        return mockFirebaseUser
      }
    })
    await verifyIdToken('some-token', 'my-refresh-token')
    const calledEndpoint = global.fetch.mock.calls[0][0]
    const keyParam = new URL(calledEndpoint).searchParams.get('key')
    expect(keyParam).toEqual('the-expected-api-key')
  })

  it('passes the expected fetch options when refreshing the token', async () => {
    expect.assertions(1)
    const { verifyIdToken } = require('src/firebaseAdmin')

    // Mock that the original token is expired but a new token works.
    const expiredTokenErr = new Error(
      'The provided Firebase ID token is expired.'
    )
    expiredTokenErr.code = 'auth/id-token-expired'
    const mockFirebaseUser = createMockFirebaseUserAdminSDK()
    const admin = getFirebaseAdminApp()
    admin.auth().verifyIdToken.mockImplementation(async (token) => {
      if (token === 'some-token') {
        throw expiredTokenErr
      } else {
        return mockFirebaseUser
      }
    })
    await verifyIdToken('some-token', 'my-refresh-token')
    const fetchOptions = global.fetch.mock.calls[0][1]
    expect(fetchOptions).toEqual({
      body: 'grant_type=refresh_token&refresh_token=my-refresh-token',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      method: 'POST',
    })
  })

  it('returns an unauthenticated AuthUser if verifying the token fails with auth/invalid-user-token', async () => {
    expect.assertions(2)
    const { verifyIdToken } = require('src/firebaseAdmin')

    const expiredTokenErr = new Error('Mock error message.')
    expiredTokenErr.code = 'auth/invalid-user-token'
    const mockFirebaseUser = createMockFirebaseUserAdminSDK()
    const admin = getFirebaseAdminApp()
    admin.auth().verifyIdToken.mockImplementation(async (token) => {
      if (token === 'some-token') {
        throw expiredTokenErr
      } else {
        return mockFirebaseUser
      }
    })
    const AuthUser = await verifyIdToken('some-token', 'my-refresh-token')
    expect(AuthUser.id).toEqual(null)
    const token = await AuthUser.getIdToken()
    expect(token).toEqual(null)
  })

  it('returns an unauthenticated AuthUser if verifying the token fails with auth/user-token-expired', async () => {
    expect.assertions(2)
    const { verifyIdToken } = require('src/firebaseAdmin')

    const expiredTokenErr = new Error('Mock error message.')
    expiredTokenErr.code = 'auth/user-token-expired'
    const mockFirebaseUser = createMockFirebaseUserAdminSDK()
    const admin = getFirebaseAdminApp()
    admin.auth().verifyIdToken.mockImplementation(async (token) => {
      if (token === 'some-token') {
        throw expiredTokenErr
      } else {
        return mockFirebaseUser
      }
    })
    const AuthUser = await verifyIdToken('some-token', 'my-refresh-token')
    expect(AuthUser.id).toEqual(null)
    const token = await AuthUser.getIdToken()
    expect(token).toEqual(null)
  })

  it('returns an unauthenticated AuthUser if verifying the token fails with auth/user-disabled', async () => {
    expect.assertions(2)
    const { verifyIdToken } = require('src/firebaseAdmin')

    const expiredTokenErr = new Error('Mock error message.')
    expiredTokenErr.code = 'auth/user-disabled'
    const mockFirebaseUser = createMockFirebaseUserAdminSDK()
    const admin = getFirebaseAdminApp()
    admin.auth().verifyIdToken.mockImplementation(async (token) => {
      if (token === 'some-token') {
        throw expiredTokenErr
      } else {
        return mockFirebaseUser
      }
    })
    const AuthUser = await verifyIdToken('some-token', 'my-refresh-token')
    expect(AuthUser.id).toEqual(null)
    const token = await AuthUser.getIdToken()
    expect(token).toEqual(null)
  })

  it('returns an unauthenticated AuthUser if there is no refresh token and the id token has expired', async () => {
    expect.assertions(2)
    const { verifyIdToken } = require('src/firebaseAdmin')

    const expiredTokenErr = new Error('Mock error message.')
    expiredTokenErr.code = 'auth/id-token-expired'
    const mockFirebaseUser = createMockFirebaseUserAdminSDK()
    const admin = getFirebaseAdminApp()
    admin.auth().verifyIdToken.mockImplementation(async (token) => {
      if (token === 'some-token') {
        throw expiredTokenErr
      } else {
        return mockFirebaseUser
      }
    })
    const AuthUser = await verifyIdToken('some-token')
    expect(AuthUser.id).toEqual(null)
    const token = await AuthUser.getIdToken()
    expect(token).toEqual(null)
  })

  it('does not throw if there is an error refreshing the token; calls config.onTokenRefreshError with the error', async () => {
    expect.assertions(2)
    const { verifyIdToken } = require('src/firebaseAdmin')
    const { onTokenRefreshError } = getConfig()
    global.fetch.mockImplementation(async () => ({
      ...createMockFetchResponse(),
      ok: false,
      status: 500,
      json: () => Promise.resolve({ error: 'Something happened, sorry.' }),
    }))
    const expiredTokenErr = new Error(
      'The provided Firebase ID token is expired.'
    )
    expiredTokenErr.code = 'auth/id-token-expired'
    const mockFirebaseUser = createMockFirebaseUserAdminSDK()
    const admin = getFirebaseAdminApp()
    admin.auth().verifyIdToken.mockImplementation(async (token) => {
      if (token === 'some-token') {
        throw expiredTokenErr
      } else {
        return mockFirebaseUser
      }
    })
    await expect(
      verifyIdToken('some-token', 'my-refresh-token')
    ).resolves.not.toThrow()
    const expectedErr = new Error(
      'Problem refreshing token: {"error":"Something happened, sorry."}'
    )
    expect(onTokenRefreshError).toHaveBeenCalledWith(expectedErr)
  })

  it('awaits an async config.onTokenRefreshError callback', async () => {
    expect.assertions(2)

    const mockConfig = createMockConfig()
    let resolver
    let isResolved = false
    const prom = new Promise((resolve) => {
      resolver = resolve
    }).then(() => {
      isResolved = true
    })
    const onTokenRefreshErrorCustom = jest.fn(() => prom)
    setConfig({
      ...mockConfig,
      onTokenRefreshError: onTokenRefreshErrorCustom,
      firebaseClientInitConfig: {
        ...mockConfig.firebaseClientInitConfig,
        apiKey: 'some-key',
      },
    })

    const { verifyIdToken } = require('src/firebaseAdmin')
    global.fetch.mockImplementation(async () => ({
      ...createMockFetchResponse(),
      ok: false,
      status: 500,
      json: () => Promise.resolve({ error: 'Something happened, sorry.' }),
    }))
    const expiredTokenErr = new Error(
      'The provided Firebase ID token is expired.'
    )
    expiredTokenErr.code = 'auth/id-token-expired'
    const mockFirebaseUser = createMockFirebaseUserAdminSDK()
    const admin = getFirebaseAdminApp()
    admin.auth().verifyIdToken.mockImplementation(async (token) => {
      if (token === 'some-token') {
        throw expiredTokenErr
      } else {
        return mockFirebaseUser
      }
    })

    // Not awaiting verifyIdToken here. We'll rely on `expect.assertions`.
    // eslint-disable-next-line jest/valid-expect-in-promise
    verifyIdToken('some-token', 'my-refresh-token').then(() => {
      expect(isResolved).toBe(true)
    })
    expect(isResolved).toBe(false)
    resolver()
  })

  it('returns an unauthenticated AuthUser if there is an error refreshing the token', async () => {
    expect.assertions(2)
    const { verifyIdToken } = require('src/firebaseAdmin')
    global.fetch.mockImplementation(async () => ({
      ...createMockFetchResponse(),
      ok: false,
      status: 500,
      json: () => Promise.resolve({ error: 'Something happened, sorry.' }),
    }))
    const expiredTokenErr = new Error(
      'The provided Firebase ID token is expired.'
    )
    expiredTokenErr.code = 'auth/id-token-expired'
    const mockFirebaseUser = createMockFirebaseUserAdminSDK()
    const admin = getFirebaseAdminApp()
    admin.auth().verifyIdToken.mockImplementation(async (token) => {
      if (token === 'some-token') {
        throw expiredTokenErr
      } else {
        return mockFirebaseUser
      }
    })
    const AuthUser = await verifyIdToken('some-token', 'my-refresh-token')
    expect(AuthUser.id).toEqual(null)
    const token = await AuthUser.getIdToken()
    expect(token).toEqual(null)
  })

  it("does not throw if Firebase admin's verifyIdToken throws something other than an expired token error; calls config.onVerifyTokenError with the error", async () => {
    expect.assertions(2)
    const { verifyIdToken } = require('src/firebaseAdmin')
    const { onVerifyTokenError } = getConfig()
    global.fetch.mockImplementation(async (endpoint) => {
      if (endpoint.indexOf(googleRefreshTokenEndpoint) === 0) {
        return {
          ...createMockFetchResponse(),
          json: () => Promise.resolve({ id_token: 'a-new-token' }),
        }
      }
      // Mock a 500 response from Google token refresh.
      return { ...createMockFetchResponse(), ok: false, status: 500 }
    })
    const otherErr = new Error('The Firebase ID token has been revoked.')
    otherErr.code = 'auth/id-token-revoked' // a different error
    const admin = getFirebaseAdminApp()
    admin.auth().verifyIdToken.mockImplementation(async () => {
      throw otherErr
    })
    await expect(
      verifyIdToken('some-token', 'my-refresh-token')
    ).resolves.not.toThrow()
    expect(onVerifyTokenError).toHaveBeenCalledWith(otherErr)
  })

  it('awaits an async config.onVerifyTokenError callback', async () => {
    expect.assertions(2)

    const mockConfig = createMockConfig()
    let resolver
    let isResolved = false
    const prom = new Promise((resolve) => {
      resolver = resolve
    }).then(() => {
      isResolved = true
    })
    const onVerifyTokenErrorCustom = jest.fn(() => prom)
    setConfig({
      ...mockConfig,
      onVerifyTokenError: onVerifyTokenErrorCustom,
      firebaseClientInitConfig: {
        ...mockConfig.firebaseClientInitConfig,
        apiKey: 'some-key',
      },
    })

    const { verifyIdToken } = require('src/firebaseAdmin')
    global.fetch.mockImplementation(async (endpoint) => {
      if (endpoint.indexOf(googleRefreshTokenEndpoint) === 0) {
        return {
          ...createMockFetchResponse(),
          json: () => Promise.resolve({ id_token: 'a-new-token' }),
        }
      }
      // Mock a 500 response from Google token refresh.
      return { ...createMockFetchResponse(), ok: false, status: 500 }
    })
    const otherErr = new Error('The Firebase ID token has been revoked.')
    otherErr.code = 'auth/id-token-revoked' // a different error
    const admin = getFirebaseAdminApp()
    admin.auth().verifyIdToken.mockImplementation(async () => {
      throw otherErr
    })

    // Not awaiting verifyIdToken here. We'll rely on `expect.assertions`.
    // eslint-disable-next-line jest/valid-expect-in-promise
    verifyIdToken('some-token', 'my-refresh-token').then(() => {
      expect(isResolved).toBe(true)
    })
    expect(isResolved).toBe(false)
    resolver()
  })

  it("returns an unauthenticated AuthUser if Firebase admin's verifyIdToken throws something other than an expired token error", async () => {
    expect.assertions(2)
    const { verifyIdToken } = require('src/firebaseAdmin')
    global.fetch.mockImplementation(async (endpoint) => {
      if (endpoint.indexOf(googleRefreshTokenEndpoint) === 0) {
        return {
          ...createMockFetchResponse(),
          json: () => Promise.resolve({ id_token: 'a-new-token' }),
        }
      }
      // Mock a 500 response from Google token refresh.
      return { ...createMockFetchResponse(), ok: false, status: 500 }
    })
    const otherErr = new Error('The Firebase ID token has been revoked.')
    otherErr.code = 'auth/id-token-revoked' // a different error
    const admin = getFirebaseAdminApp()
    admin.auth().verifyIdToken.mockImplementation(async () => {
      throw otherErr
    })
    const AuthUser = await verifyIdToken('some-token', 'my-refresh-token')
    expect(AuthUser.id).toEqual(null)
    const token = await AuthUser.getIdToken()
    expect(token).toEqual(null)
  })

  it("does not throw if Firebase admin's verifyIdToken throws an error for the refreshed token; calls config.onVerifyTokenError with the error", async () => {
    expect.assertions(2)
    const { verifyIdToken } = require('src/firebaseAdmin')
    const { onVerifyTokenError } = getConfig()

    // Mock that verifyIdToken throws a "token expired" error even for
    // the refreshed token, for some reason.
    const expiredTokenErr = new Error(
      'The provided Firebase ID token is expired.'
    )
    expiredTokenErr.code = 'auth/id-token-expired'
    const admin = getFirebaseAdminApp()
    admin.auth().verifyIdToken.mockImplementation(async () => {
      throw expiredTokenErr
    })
    await expect(
      verifyIdToken('some-token', 'my-refresh-token')
    ).resolves.not.toThrow()
    expect(onVerifyTokenError).toHaveBeenCalledWith(expiredTokenErr)
  })

  it('awaits an async config.onVerifyTokenError callback if the refreshed token fails verification', async () => {
    expect.assertions(2)

    const mockConfig = createMockConfig()
    let resolver
    let isResolved = false
    const prom = new Promise((resolve) => {
      resolver = resolve
    }).then(() => {
      isResolved = true
    })
    const onVerifyTokenErrorCustom = jest.fn(() => prom)
    setConfig({
      ...mockConfig,
      onVerifyTokenError: onVerifyTokenErrorCustom,
      firebaseClientInitConfig: {
        ...mockConfig.firebaseClientInitConfig,
        apiKey: 'some-key',
      },
    })

    const { verifyIdToken } = require('src/firebaseAdmin')

    // Mock that verifyIdToken throws a "token expired" error even for
    // the refreshed token, for some reason.
    const expiredTokenErr = new Error(
      'The provided Firebase ID token is expired.'
    )
    expiredTokenErr.code = 'auth/id-token-expired'
    const admin = getFirebaseAdminApp()
    admin.auth().verifyIdToken.mockImplementation(async () => {
      throw expiredTokenErr
    })

    // Not awaiting verifyIdToken here. We'll rely on `expect.assertions`.
    // eslint-disable-next-line jest/valid-expect-in-promise
    verifyIdToken('some-token', 'my-refresh-token').then(() => {
      expect(isResolved).toBe(true)
    })
    expect(isResolved).toBe(false)
    resolver()
  })

  it("returns an unauthenticated AuthUser if Firebase admin's verifyIdToken throws an error for the refreshed token", async () => {
    expect.assertions(2)
    const { verifyIdToken } = require('src/firebaseAdmin')

    // Mock that verifyIdToken throws a "token expired" error even for
    // the refreshed token, for some reason.
    const expiredTokenErr = new Error(
      'The provided Firebase ID token is expired.'
    )
    expiredTokenErr.code = 'auth/id-token-expired'
    const admin = getFirebaseAdminApp()
    admin.auth().verifyIdToken.mockImplementation(async () => {
      throw expiredTokenErr
    })
    const AuthUser = await verifyIdToken('some-token', 'my-refresh-token')
    expect(AuthUser.id).toEqual(null)
    const token = await AuthUser.getIdToken()
    expect(token).toEqual(null)
  })
})

describe('getCustomIdAndRefreshTokens', () => {
  it("passes the Firebase user's ID (from verifyIdToken) to createCustomToken", async () => {
    expect.assertions(1)
    const { getCustomIdAndRefreshTokens } = require('src/firebaseAdmin')
    const mockFirebaseUser = createMockFirebaseUserAdminSDK()
    const admin = getFirebaseAdminApp()
    admin.auth().verifyIdToken.mockResolvedValue(mockFirebaseUser)
    admin.auth().createCustomToken.mockResolvedValue('my-custom-token')
    await getCustomIdAndRefreshTokens('some-token')
    expect(admin.auth().createCustomToken).toHaveBeenCalledWith(
      mockFirebaseUser.uid
    )
  })

  it('calls the public google endpoint if the firebaseAuthEmulatorHost is not set to get a custom token, including the public Firebase API key as a URL parameter', async () => {
    expect.assertions(1)
    const { getCustomIdAndRefreshTokens } = require('src/firebaseAdmin')

    // Set the Firebase API key.
    const expectedAPIKey = 'my-api-key!'
    const mockConfig = createMockConfig()
    setConfig({
      ...mockConfig,
      firebaseClientInitConfig: {
        ...mockConfig.firebaseClientInitConfig,
        apiKey: expectedAPIKey,
      },
    })

    const mockFirebaseUser = createMockFirebaseUserAdminSDK()
    const admin = getFirebaseAdminApp()
    admin.auth().verifyIdToken.mockResolvedValue(mockFirebaseUser)
    admin.auth().createCustomToken.mockResolvedValue('my-custom-token')
    await getCustomIdAndRefreshTokens('some-token')

    const endpoint = global.fetch.mock.calls[0][0]
    expect(endpoint).toEqual(
      `${googleCustomTokenEndpoint}?key=${expectedAPIKey}`
    )
  })

  it('calls the auth emulator endpoint if the firebaseAuthEmulatorHost is set to get a custom token, including the public Firebase API key as a URL parameter', async () => {
    process.env.FIREBASE_AUTH_EMULATOR_HOST = 'localhost:9099'
    const { getCustomIdAndRefreshTokens } = require('src/firebaseAdmin')

    // Set the Firebase API key.
    const expectedAPIKey = 'my-api-key!'
    const mockConfig = createMockConfig()
    setConfig({
      ...mockConfig,
      firebaseClientInitConfig: {
        ...mockConfig.firebaseClientInitConfig,
        apiKey: expectedAPIKey,
      },
      firebaseAuthEmulatorHost: 'localhost:9099',
    })

    const authEmulatorEndpoint =
      'http://localhost:9099/identitytoolkit.googleapis.com/v1/accounts:signInWithCustomToken'
    const mockFirebaseUser = createMockFirebaseUserAdminSDK()
    const admin = getFirebaseAdminApp()
    admin.auth().verifyIdToken.mockResolvedValue(mockFirebaseUser)
    admin.auth().createCustomToken.mockResolvedValue('my-custom-token')
    await getCustomIdAndRefreshTokens('some-token')

    const endpoint = global.fetch.mock.calls[0][0]
    expect(endpoint).toEqual(`${authEmulatorEndpoint}?key=${expectedAPIKey}`)
  })

  it('uses the expected fetch options when calling to get a custom token', async () => {
    expect.assertions(1)
    const { getCustomIdAndRefreshTokens } = require('src/firebaseAdmin')
    const mockFirebaseUser = createMockFirebaseUserAdminSDK()
    const admin = getFirebaseAdminApp()
    admin.auth().verifyIdToken.mockResolvedValue(mockFirebaseUser)
    admin.auth().createCustomToken.mockResolvedValue('my-custom-token')
    await getCustomIdAndRefreshTokens('some-token')
    const options = global.fetch.mock.calls[0][1]
    expect(options).toEqual({
      body: '{"token":"my-custom-token","returnSecureToken":true}',
      headers: {
        'Content-Type': 'application/json',
      },
      method: 'POST',
    })
  })

  it('returns the expected token values', async () => {
    expect.assertions(1)
    const { getCustomIdAndRefreshTokens } = require('src/firebaseAdmin')

    // Mock the behavior of getting a custom token.
    global.fetch.mockReturnValue({
      ...createMockFetchResponse(),
      json: () =>
        Promise.resolve({
          idToken: 'the-id-token',
          refreshToken: 'the-refresh-token',
        }),
    })

    const mockFirebaseUser = createMockFirebaseUserAdminSDK()
    const admin = getFirebaseAdminApp()
    admin.auth().verifyIdToken.mockResolvedValue(mockFirebaseUser)
    admin.auth().createCustomToken.mockResolvedValue('my-custom-token')
    const response = await getCustomIdAndRefreshTokens('some-token')

    expect(response).toMatchObject({
      idToken: 'the-id-token',
      refreshToken: 'the-refresh-token',
    })
  })

  it('returns the expected AuthUser value', async () => {
    expect.assertions(1)
    const { getCustomIdAndRefreshTokens } = require('src/firebaseAdmin')

    // Mock the behavior of getting a custom token.
    global.fetch.mockReturnValue({
      ...createMockFetchResponse(),
      json: () =>
        Promise.resolve({
          idToken: 'the-id-token',
          refreshToken: 'the-refresh-token',
        }),
    })

    const mockFirebaseUser = createMockFirebaseUserAdminSDK()
    const expectedAuthUser = createAuthUser({
      firebaseUserAdminSDK: mockFirebaseUser,
    })
    const admin = getFirebaseAdminApp()
    admin.auth().verifyIdToken.mockResolvedValue(mockFirebaseUser)
    admin.auth().createCustomToken.mockResolvedValue('my-custom-token')
    const response = await getCustomIdAndRefreshTokens('some-token')

    expect(response.AuthUser).toEqual({
      ...expectedAuthUser,
      getIdToken: expect.any(Function),
      serialize: expect.any(Function),
      signOut: expect.any(Function),
    })
  })

  it('throws if fetching a custom token fails', async () => {
    expect.assertions(1)
    const { getCustomIdAndRefreshTokens } = require('src/firebaseAdmin')

    // Mock the behavior of getting a custom token.
    global.fetch.mockReturnValue({
      ...createMockFetchResponse(),
      ok: false,
      status: 500,
      json: () =>
        Promise.resolve({
          error: 'Oh no.',
        }),
    })

    const mockFirebaseUser = createMockFirebaseUserAdminSDK()
    const admin = getFirebaseAdminApp()
    admin.auth().verifyIdToken.mockResolvedValue(mockFirebaseUser)
    admin.auth().createCustomToken.mockResolvedValue('my-custom-token')
    await expect(getCustomIdAndRefreshTokens('some-token')).rejects.toEqual(
      new Error('Problem getting a refresh token: {"error":"Oh no."}')
    )
  })
})
