export {}

const { Auth } = require('firebase-admin/auth')

const firebaseAdminAuthMock: jest.Mocked<typeof Auth> =
  jest.createMockFromModule('firebase-admin/auth')

const auth = {
  createCustomToken: jest.fn(async () => null) as jest.Mock,
  verifyIdToken: jest.fn(async () => null) as jest.Mock,
}

firebaseAdminAuthMock.getAuth = jest.fn(() => auth)

module.exports = firebaseAdminAuthMock
