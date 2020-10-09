import * as admin from 'firebase-admin'
import { setConfig } from 'src/config'
import { getMockConfig } from 'src/test-utils'

jest.mock('firebase-admin')
jest.mock('src/config')

beforeEach(() => {
  const mockConfig = getMockConfig()
  setConfig(mockConfig)

  admin.credential.cert.mockImplementation((obj) => ({
    ...obj,
    _mockFirebaseCert: true,
  }))
})

describe('initFirebaseAdminSDK', () => {
  it('calls admin.initializeApp with the expected values.', () => {
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
})
