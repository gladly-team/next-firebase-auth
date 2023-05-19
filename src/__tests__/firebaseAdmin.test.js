import { getAuth } from 'firebase-admin/auth'
import { createMockFirebaseUserAdminSDK } from 'src/testHelpers/authUserInputs'
import createMockFetchResponse from 'src/testHelpers/createMockFetchResponse'
import createAuthUser from 'src/createAuthUser'
import { setConfig, getConfig } from 'src/config'
import createMockConfig from 'src/testHelpers/createMockConfig'
import initFirebaseAdminSDK from 'src/initFirebaseAdminSDK'
import logDebug from 'src/logDebug'

jest.mock('firebase-admin/auth')
jest.mock('src/initFirebaseAdminSDK')
jest.mock('src/logDebug')

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
  jest.clearAllMocks()
})

const googleRefreshTokenEndpoint = 'https://securetoken.googleapis.com/v1/token'
const googleCustomTokenEndpoint =
  'https://identitytoolkit.googleapis.com/v1/accounts:signInWithCustomToken'

/* BEGIN: verifyIdToken tests */
describe('verifyIdToken', () => {
  it('calls initFirebaseAdminSDK', async () => {
    expect.assertions(1)
    const { verifyIdToken } = require('src/firebaseAdmin')
    const mockFirebaseUser = createMockFirebaseUserAdminSDK()
    const firebaseAdminAuth = getAuth()
    firebaseAdminAuth.verifyIdToken.mockResolvedValue(mockFirebaseUser)
    await verifyIdToken('some-token')
    expect(initFirebaseAdminSDK).toHaveBeenCalled()
  })

  it('returns an AuthUser', async () => {
    expect.assertions(1)
    const { verifyIdToken } = require('src/firebaseAdmin')
    const mockFirebaseUser = createMockFirebaseUserAdminSDK()
    const expectedReturn = createAuthUser({
      firebaseUserAdminSDK: mockFirebaseUser,
      token: 'some-token',
    })
    const firebaseAdminAuth = getAuth()
    firebaseAdminAuth.verifyIdToken.mockResolvedValue(mockFirebaseUser)
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
    const firebaseAdminAuth = getAuth()
    firebaseAdminAuth.verifyIdToken.mockResolvedValue(mockFirebaseUser)
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
    const firebaseAdminAuth = getAuth()
    firebaseAdminAuth.verifyIdToken.mockImplementation(async (token) => {
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
    const firebaseAdminAuth = getAuth()
    firebaseAdminAuth.verifyIdToken.mockImplementation(async (token) => {
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

  // https://github.com/gladly-team/next-firebase-auth/issues/531
  it('calls onVerifyTokenError when an auth/argument-error occurs and is not resolvable because there is no refresh token', async () => {
    expect.assertions(1)
    const { verifyIdToken } = require('src/firebaseAdmin')
    const { onVerifyTokenError } = getConfig()
    // Mock that the original token is expired but a new token works.
    const expiredTokenErr = new Error(
      'Firebase ID token has "kid" claim which does not correspond to a known public key. Most likely the ID token is expired, so get a fresh token from your client app and try again.'
    )
    expiredTokenErr.code = 'auth/argument-error'
    const firebaseAdminAuth = getAuth()
    firebaseAdminAuth.verifyIdToken.mockImplementation(async () => {
      throw expiredTokenErr
    })
    await verifyIdToken('some-token')
    expect(onVerifyTokenError).toHaveBeenCalledWith(expiredTokenErr)
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
    const firebaseAdminAuth = getAuth()
    firebaseAdminAuth.verifyIdToken.mockImplementation(async (token) => {
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
    const firebaseAdminAuth = getAuth()
    firebaseAdminAuth.verifyIdToken.mockImplementation(async (token) => {
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
    const firebaseAdminAuth = getAuth()
    firebaseAdminAuth.verifyIdToken.mockImplementation(async (token) => {
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
    const firebaseAdminAuth = getAuth()
    firebaseAdminAuth.verifyIdToken.mockImplementation(async (token) => {
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
    const firebaseAdminAuth = getAuth()
    firebaseAdminAuth.verifyIdToken.mockImplementation(async (token) => {
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
    const firebaseAdminAuth = getAuth()
    firebaseAdminAuth.verifyIdToken.mockImplementation(async (token) => {
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
    const firebaseAdminAuth = getAuth()
    firebaseAdminAuth.verifyIdToken.mockImplementation(async (token) => {
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
    const firebaseAdminAuth = getAuth()
    firebaseAdminAuth.verifyIdToken.mockImplementation(async (token) => {
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
    const firebaseAdminAuth = getAuth()
    firebaseAdminAuth.verifyIdToken.mockImplementation(async (token) => {
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
    const firebaseAdminAuth = getAuth()
    firebaseAdminAuth.verifyIdToken.mockImplementation(async () => {
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
    const firebaseAdminAuth = getAuth()
    firebaseAdminAuth.verifyIdToken.mockImplementation(async () => {
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
    const firebaseAdminAuth = getAuth()
    firebaseAdminAuth.verifyIdToken.mockImplementation(async () => {
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
    const firebaseAdminAuth = getAuth()
    firebaseAdminAuth.verifyIdToken.mockImplementation(async () => {
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
    const firebaseAdminAuth = getAuth()
    firebaseAdminAuth.verifyIdToken.mockImplementation(async () => {
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
    const firebaseAdminAuth = getAuth()
    firebaseAdminAuth.verifyIdToken.mockImplementation(async () => {
      throw expiredTokenErr
    })
    const AuthUser = await verifyIdToken('some-token', 'my-refresh-token')
    expect(AuthUser.id).toEqual(null)
    const token = await AuthUser.getIdToken()
    expect(token).toEqual(null)
  })

  it('logs debugging logs as expected for an authed user', async () => {
    expect.assertions(2)
    const { verifyIdToken } = require('src/firebaseAdmin')
    const mockFirebaseUser = createMockFirebaseUserAdminSDK()
    const firebaseAdminAuth = getAuth()
    firebaseAdminAuth.verifyIdToken.mockResolvedValue(mockFirebaseUser)

    logDebug.mockClear()
    await verifyIdToken('some-token')
    expect(logDebug).toHaveBeenCalledWith(
      '[verifyIdToken] Successfully verified the ID token. The user is authenticated.'
    )
    expect(logDebug).toHaveBeenCalledTimes(1)
  })

  it('logs debugging logs as expected if verifying the token fails with auth/invalid-user-token', async () => {
    expect.assertions(2)
    const { verifyIdToken } = require('src/firebaseAdmin')

    const expiredTokenErr = new Error('Mock error message.')
    expiredTokenErr.code = 'auth/invalid-user-token'
    const mockFirebaseUser = createMockFirebaseUserAdminSDK()
    const firebaseAdminAuth = getAuth()
    firebaseAdminAuth.verifyIdToken.mockImplementation(async (token) => {
      if (token === 'some-token') {
        throw expiredTokenErr
      } else {
        return mockFirebaseUser
      }
    })
    logDebug.mockClear()
    await verifyIdToken('some-token', 'my-refresh-token')
    expect(logDebug).toHaveBeenCalledWith(
      '[verifyIdToken] Error verifying the ID token: auth/invalid-user-token. The user will be unauthenticated.'
    )
    expect(logDebug).toHaveBeenCalledTimes(1)
  })

  it('logs debugging logs as expected if verifying the token fails with auth/user-token-expired', async () => {
    expect.assertions(2)
    const { verifyIdToken } = require('src/firebaseAdmin')

    const expiredTokenErr = new Error('Mock error message.')
    expiredTokenErr.code = 'auth/user-token-expired'
    const mockFirebaseUser = createMockFirebaseUserAdminSDK()
    const firebaseAdminAuth = getAuth()
    firebaseAdminAuth.verifyIdToken.mockImplementation(async (token) => {
      if (token === 'some-token') {
        throw expiredTokenErr
      } else {
        return mockFirebaseUser
      }
    })
    logDebug.mockClear()
    await verifyIdToken('some-token', 'my-refresh-token')
    expect(logDebug).toHaveBeenCalledWith(
      '[verifyIdToken] Error verifying the ID token: auth/user-token-expired. The user will be unauthenticated.'
    )
    expect(logDebug).toHaveBeenCalledTimes(1)
  })

  it('logs debugging logs as expected if verifying the token fails with auth/user-disabled', async () => {
    expect.assertions(2)
    const { verifyIdToken } = require('src/firebaseAdmin')

    const expiredTokenErr = new Error('Mock error message.')
    expiredTokenErr.code = 'auth/user-disabled'
    const mockFirebaseUser = createMockFirebaseUserAdminSDK()
    const firebaseAdminAuth = getAuth()
    firebaseAdminAuth.verifyIdToken.mockImplementation(async (token) => {
      if (token === 'some-token') {
        throw expiredTokenErr
      } else {
        return mockFirebaseUser
      }
    })
    logDebug.mockClear()
    await verifyIdToken('some-token', 'my-refresh-token')
    expect(logDebug).toHaveBeenCalledWith(
      '[verifyIdToken] Error verifying the ID token: auth/user-disabled. The user will be unauthenticated.'
    )
    expect(logDebug).toHaveBeenCalledTimes(1)
  })

  it('logs debugging logs as expected when the token is successfully refreshed because of a Firebase auth/argument-error error', async () => {
    expect.assertions(4)
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
    const firebaseAdminAuth = getAuth()
    firebaseAdminAuth.verifyIdToken.mockImplementation(async (token) => {
      if (token === 'some-token') {
        throw expiredTokenErr
      } else {
        return mockFirebaseUser
      }
    })
    logDebug.mockClear()
    await verifyIdToken('some-token', 'my-refresh-token')
    expect(logDebug).toHaveBeenCalledWith(
      '[verifyIdToken] The ID token is expired (error code auth/argument-error). Attempting to refresh the ID token.'
    )
    expect(logDebug).toHaveBeenCalledWith(
      '[verifyIdToken] Successfully refreshed the ID token.'
    )
    expect(logDebug).toHaveBeenCalledWith(
      '[verifyIdToken] Successfully verified the ID token. The user is authenticated.'
    )
    expect(logDebug).toHaveBeenCalledTimes(3)
  })

  it('logs debugging logs as expected when there is an error refreshing the token', async () => {
    expect.assertions(3)
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
    const firebaseAdminAuth = getAuth()
    firebaseAdminAuth.verifyIdToken.mockImplementation(async (token) => {
      if (token === 'some-token') {
        throw expiredTokenErr
      } else {
        return mockFirebaseUser
      }
    })
    logDebug.mockClear()
    await verifyIdToken('some-token', 'my-refresh-token')
    expect(logDebug).toHaveBeenCalledWith(
      '[verifyIdToken] The ID token is expired (error code auth/id-token-expired). Attempting to refresh the ID token.'
    )
    expect(logDebug).toHaveBeenCalledWith(
      '[verifyIdToken] Failed to refresh the ID token. The user will be unauthenticated.'
    )
    expect(logDebug).toHaveBeenCalledTimes(2)
  })

  it("logs debugging logs as expected when Firebase admin's verifyIdToken throws an unhandled error code", async () => {
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
    otherErr.code = 'auth/some-unexpected-error' // a different error
    const firebaseAdminAuth = getAuth()
    firebaseAdminAuth.verifyIdToken.mockImplementation(async () => {
      throw otherErr
    })
    logDebug.mockClear()
    await verifyIdToken('some-token', 'my-refresh-token')
    expect(logDebug).toHaveBeenCalledWith(
      '[verifyIdToken] Error verifying the ID token: auth/some-unexpected-error. The user will be unauthenticated.'
    )
    expect(logDebug).toHaveBeenCalledTimes(1)
  })

  it('throws a helpful error if `fetch` is not defined', async () => {
    expect.assertions(1)
    delete global.fetch // no fetch
    const { verifyIdToken } = require('src/firebaseAdmin')
    const mockFirebaseUser = createMockFirebaseUserAdminSDK()
    const firebaseAdminAuth = getAuth()
    firebaseAdminAuth.verifyIdToken.mockResolvedValue(mockFirebaseUser)
    await expect(verifyIdToken('some-token')).rejects.toThrow(
      'A `fetch` global is required when using next-firebase-auth. See documentation on setting up a `fetch` polyfill.'
    )
  })
})
/* END: verifyIdToken tests */

/* BEGIN: getCustomIdAndRefreshTokens tests */
describe('getCustomIdAndRefreshTokens', () => {
  it('calls initFirebaseAdminSDK', async () => {
    expect.assertions(1)
    const { getCustomIdAndRefreshTokens } = require('src/firebaseAdmin')
    global.fetch.mockReturnValue({
      ...createMockFetchResponse(),
      json: () =>
        Promise.resolve({
          idToken: 'the-id-token',
          refreshToken: 'the-refresh-token',
        }),
    })
    const mockFirebaseUser = createMockFirebaseUserAdminSDK()
    const firebaseAdminAuth = getAuth()
    firebaseAdminAuth.verifyIdToken.mockResolvedValue(mockFirebaseUser)
    firebaseAdminAuth.createCustomToken.mockResolvedValue('my-custom-token')
    await getCustomIdAndRefreshTokens('some-token')
    expect(initFirebaseAdminSDK).toHaveBeenCalled()
  })

  it("passes the Firebase user's ID (from verifyIdToken) to createCustomToken", async () => {
    expect.assertions(1)
    const { getCustomIdAndRefreshTokens } = require('src/firebaseAdmin')
    const mockFirebaseUser = createMockFirebaseUserAdminSDK()
    const firebaseAdminAuth = getAuth()
    firebaseAdminAuth.verifyIdToken.mockResolvedValue(mockFirebaseUser)
    firebaseAdminAuth.createCustomToken.mockResolvedValue('my-custom-token')
    await getCustomIdAndRefreshTokens('some-token')
    expect(firebaseAdminAuth.createCustomToken).toHaveBeenCalledWith(
      mockFirebaseUser.uid
    )
  })

  it('calls the public Google endpoint if the firebaseAuthEmulatorHost is not set to get a custom token, including the public Firebase API key as a URL parameter', async () => {
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
    const firebaseAdminAuth = getAuth()
    firebaseAdminAuth.verifyIdToken.mockResolvedValue(mockFirebaseUser)
    firebaseAdminAuth.createCustomToken.mockResolvedValue('my-custom-token')
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
    const firebaseAdminAuth = getAuth()
    firebaseAdminAuth.verifyIdToken.mockResolvedValue(mockFirebaseUser)
    firebaseAdminAuth.createCustomToken.mockResolvedValue('my-custom-token')
    await getCustomIdAndRefreshTokens('some-token')

    const endpoint = global.fetch.mock.calls[0][0]
    expect(endpoint).toEqual(`${authEmulatorEndpoint}?key=${expectedAPIKey}`)
  })

  it('uses the expected fetch options when calling to get a custom token', async () => {
    expect.assertions(1)
    const { getCustomIdAndRefreshTokens } = require('src/firebaseAdmin')
    const mockFirebaseUser = createMockFirebaseUserAdminSDK()
    const firebaseAdminAuth = getAuth()
    firebaseAdminAuth.verifyIdToken.mockResolvedValue(mockFirebaseUser)
    firebaseAdminAuth.createCustomToken.mockResolvedValue('my-custom-token')
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
    const firebaseAdminAuth = getAuth()
    firebaseAdminAuth.verifyIdToken.mockResolvedValue(mockFirebaseUser)
    firebaseAdminAuth.createCustomToken.mockResolvedValue('my-custom-token')
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
    const firebaseAdminAuth = getAuth()
    firebaseAdminAuth.verifyIdToken.mockResolvedValue(mockFirebaseUser)
    firebaseAdminAuth.createCustomToken.mockResolvedValue('my-custom-token')
    const response = await getCustomIdAndRefreshTokens('some-token')

    expect(response.AuthUser).toEqual({
      ...expectedAuthUser,
      getIdToken: expect.any(Function),
      serialize: expect.any(Function),
      signOut: expect.any(Function),
    })
  })

  it('throws if the ID token is not verifiable (there is no user ID)', async () => {
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

    // Mock that the ID token is invalid.
    const expiredTokenErr = new Error('Mock error message.')
    expiredTokenErr.code = 'auth/invalid-user-token'
    const firebaseAdminAuth = getAuth()
    firebaseAdminAuth.verifyIdToken.mockImplementation(() => expiredTokenErr)

    firebaseAdminAuth.createCustomToken.mockResolvedValue('my-custom-token')
    await expect(getCustomIdAndRefreshTokens('some-token')).rejects.toThrow(
      'Failed to verify the ID token.'
    )
  })

  // https://github.com/gladly-team/next-firebase-auth/issues/531
  it('throws if fetching a refresh token fails', async () => {
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
    const firebaseAdminAuth = getAuth()
    firebaseAdminAuth.verifyIdToken.mockResolvedValue(mockFirebaseUser)
    firebaseAdminAuth.createCustomToken.mockResolvedValue('my-custom-token')
    await expect(getCustomIdAndRefreshTokens('some-token')).rejects.toEqual(
      new Error('Problem getting a refresh token: {"error":"Oh no."}')
    )
  })

  it('logs debugging logs as expected', async () => {
    expect.assertions(3)
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
    const firebaseAdminAuth = getAuth()
    firebaseAdminAuth.verifyIdToken.mockResolvedValue(mockFirebaseUser)
    firebaseAdminAuth.createCustomToken.mockResolvedValue('my-custom-token')

    logDebug.mockClear()
    await getCustomIdAndRefreshTokens('some-token')
    expect(logDebug).toHaveBeenCalledWith(
      '[setAuthCookies] Getting a refresh token from the ID token.'
    )
    expect(logDebug).toHaveBeenCalledWith(
      '[verifyIdToken] Successfully verified the ID token. The user is authenticated.'
    )
    expect(logDebug).toHaveBeenCalledTimes(2)
  })

  it('logs debugging logs as expected when failing to get a refresh token', async () => {
    expect.assertions(4)
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
    const firebaseAdminAuth = getAuth()
    firebaseAdminAuth.verifyIdToken.mockResolvedValue(mockFirebaseUser)
    firebaseAdminAuth.createCustomToken.mockResolvedValue('my-custom-token')

    logDebug.mockClear()
    try {
      await getCustomIdAndRefreshTokens('some-token')

      // We expect this to throw.
      // eslint-disable-next-line no-empty
    } catch (e) {}
    expect(logDebug).toHaveBeenCalledWith(
      '[setAuthCookies] Getting a refresh token from the ID token.'
    )
    expect(logDebug).toHaveBeenCalledWith(
      '[verifyIdToken] Successfully verified the ID token. The user is authenticated.'
    )
    expect(logDebug).toHaveBeenCalledWith(
      '[setAuthCookies] Failed to get a refresh token from the ID token.'
    )
    expect(logDebug).toHaveBeenCalledTimes(3)
  })

  it('throws a helpful error if `fetch` is not defined', async () => {
    expect.assertions(1)
    const { getCustomIdAndRefreshTokens } = require('src/firebaseAdmin')

    delete global.fetch

    const firebaseAdminAuth = getAuth()
    firebaseAdminAuth.verifyIdToken.mockResolvedValue(
      createMockFirebaseUserAdminSDK()
    )
    firebaseAdminAuth.createCustomToken.mockResolvedValue('my-custom-token')
    await expect(getCustomIdAndRefreshTokens('some-token')).rejects.toThrow(
      'A `fetch` global is required when using next-firebase-auth. See documentation on setting up a `fetch` polyfill.'
    )
  })
})
/* END: getCustomIdAndRefreshTokens tests */
