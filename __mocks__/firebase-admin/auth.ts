export {}

const { Auth } = jest.requireActual('firebase-admin/auth')

const firebaseAdminAuthMock: jest.Mocked<typeof Auth> =
  jest.createMockFromModule('firebase-admin/auth')

const auth = {
  createCustomToken: jest.fn(async () => null) as jest.Mock,
  verifyIdToken: jest.fn(async () => null) as jest.Mock,
  getUser: jest.fn(() => Promise.resolve(null)) as jest.Mock,
}

firebaseAdminAuthMock.getAuth = jest.fn(() => auth)

module.exports = firebaseAdminAuthMock
