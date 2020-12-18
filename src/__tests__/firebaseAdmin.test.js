import * as admin from 'firebase-admin'
import { createMockFirebaseUserAdminSDK } from 'src/testHelpers/authUserInputs'
import createMockFetchResponse from 'src/testHelpers/createMockFetchResponse'

jest.mock('firebase-admin')

beforeEach(() => {
  // `fetch` is polyfilled by Next.js.
  global.fetch = jest.fn(() => Promise.resolve(createMockFetchResponse()))
  process.env.NEXT_PUBLIC_FIREBASE_PUBLIC_API_KEY = 'myPublicFirebaseAPIKey'
})

const googleRefreshTokenEndpoint = 'https://securetoken.googleapis.com/v1/token'

describe('verifyIdToken', () => {
  it('returns a Firebase admin user', async () => {
    const { verifyIdToken } = require('src/firebaseAdmin')
    const mockFirebaseUser = createMockFirebaseUserAdminSDK()
    admin.auth().verifyIdToken.mockResolvedValue(mockFirebaseUser)
    const response = await verifyIdToken('some-token')
    expect(response.user).toEqual(mockFirebaseUser)
  })

  it('returns the same token when it has not expired', async () => {
    const { verifyIdToken } = require('src/firebaseAdmin')
    const mockFirebaseUser = createMockFirebaseUserAdminSDK()
    admin.auth().verifyIdToken.mockResolvedValue(mockFirebaseUser)
    const response = await verifyIdToken('some-token')
    expect(response.token).toEqual('some-token')
  })

  it('returns a new token when it is refreshed', async () => {
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
    admin.auth().verifyIdToken.mockImplementation(async (token) => {
      if (token === 'some-token') {
        throw expiredTokenErr
      } else {
        return mockFirebaseUser
      }
    })
    const response = await verifyIdToken('some-token', 'my-refresh-token')
    expect(response.token).toEqual('a-new-token')
  })

  it('calls the Google token refresh endpoint with the public Firebase API key as a query parameter value', async () => {
    const { verifyIdToken } = require('src/firebaseAdmin')

    // Mock that the original token is expired but a new token works.
    const expiredTokenErr = new Error(
      'The provided Firebase ID token is expired.'
    )
    expiredTokenErr.code = 'auth/id-token-expired'
    const mockFirebaseUser = createMockFirebaseUserAdminSDK()
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
    expect(keyParam).toEqual('myPublicFirebaseAPIKey')
  })

  it('passes the expected fetch options when refreshing the token', async () => {
    const { verifyIdToken } = require('src/firebaseAdmin')

    // Mock that the original token is expired but a new token works.
    const expiredTokenErr = new Error(
      'The provided Firebase ID token is expired.'
    )
    expiredTokenErr.code = 'auth/id-token-expired'
    const mockFirebaseUser = createMockFirebaseUserAdminSDK()
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

  it('throws if there is an error refreshing the token', async () => {
    const { verifyIdToken } = require('src/firebaseAdmin')
    global.fetch.mockImplementation(async () => ({
      ...createMockFetchResponse(),
      ok: false,
      status: 500,
      json: () => Promise.resolve({ error: 'Something happened, sorry.' }),
    }))

    // Mock that the original token is expired but a new token
    // would work.
    const expiredTokenErr = new Error(
      'The provided Firebase ID token is expired.'
    )
    expiredTokenErr.code = 'auth/id-token-expired'
    const mockFirebaseUser = createMockFirebaseUserAdminSDK()
    admin.auth().verifyIdToken.mockImplementation(async (token) => {
      if (token === 'some-token') {
        throw expiredTokenErr
      } else {
        return mockFirebaseUser
      }
    })
    await expect(
      verifyIdToken('some-token', 'my-refresh-token')
    ).rejects.toEqual(
      new Error(
        'Problem refreshing token: {"error":"Something happened, sorry."}'
      )
    )
  })

  it("throws if Firebase admin's verifyIdToken throws something other than an expired token error", async () => {
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
    const otherErr = new Error('The Firebase ID token has been revoked.')
    otherErr.code = 'auth/id-token-revoked' // a different error
    admin.auth().verifyIdToken.mockImplementation(async () => {
      throw otherErr
    })
    await expect(
      verifyIdToken('some-token', 'my-refresh-token')
    ).rejects.toEqual(otherErr)
  })

  it("throws if Firebase admin's verifyIdToken throws an expired token error for the refreshed token", async () => {
    const { verifyIdToken } = require('src/firebaseAdmin')

    // Mock that verifyIdToken throws a "token expired" error even for
    // the refreshed token, for some reason.
    const expiredTokenErr = new Error(
      'The provided Firebase ID token is expired.'
    )
    expiredTokenErr.code = 'auth/id-token-expired'
    admin.auth().verifyIdToken.mockImplementation(async () => {
      throw expiredTokenErr
    })
    await expect(
      verifyIdToken('some-token', 'my-refresh-token')
    ).rejects.toEqual(expiredTokenErr)
  })
})

// Test:
// * passes the Firebase user's ID (from verifyIdToken) to createCustomToken
// TODO
