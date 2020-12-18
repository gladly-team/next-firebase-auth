const firebaseAdminMock = jest.createMockFromModule('firebase-admin')

const mockAuthValue = {
  createCustomToken: jest.fn(() => Promise.resolve(null)),
  verifyIdToken: jest.fn(() => Promise.resolve(null)),
}
firebaseAdminMock.auth = jest.fn(() => mockAuthValue)

firebaseAdminMock.apps = []

module.exports = firebaseAdminMock
