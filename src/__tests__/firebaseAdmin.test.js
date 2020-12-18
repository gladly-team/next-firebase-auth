import * as admin from 'firebase-admin'
import { createMockFirebaseUserAdminSDK } from 'src/testHelpers/authUserInputs'

jest.mock('firebase-admin')

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
})
