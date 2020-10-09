const firebaseAdminMock = jest.createMockFromModule('firebase-admin')

firebaseAdminMock.auth = jest.fn(() => ({
  verifyIdToken: jest.fn(() => Promise.resolve(null)),
}))

firebaseAdminMock.apps = []

module.exports = firebaseAdminMock
