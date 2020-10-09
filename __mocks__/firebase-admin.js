const firebaseAdmin = jest.createMockFromModule('firebase-admin')

firebaseAdmin.auth = jest.fn(() => ({
  verifyIdToken: jest.fn(() => Promise.resolve(null)),
}))

firebaseAdmin.apps = jest.fn(() => [])

module.exports = firebaseAdmin
