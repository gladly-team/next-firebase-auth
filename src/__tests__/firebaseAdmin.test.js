import * as admin from 'firebase-admin'
import { createMockFirebaseUserAdminSDK } from 'src/testHelpers/authUserInputs'
import createMockFetchResponse from 'src/testHelpers/createMockFetchResponse'

jest.mock('firebase-admin')

beforeEach(() => {
  // `fetch` is polyfilled by Next.js.
  global.fetch = jest.fn(() => Promise.resolve(createMockFetchResponse()))
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
})
