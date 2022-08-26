const firebaseAdminAuth = jest.createMockFromModule('firebase-admin/auth')

const auth = {
  createCustomToken: jest.fn(async () => null),
  verifyIdToken: jest.fn(async () => null),
}

firebaseAdminAuth.getAuth = jest.fn(() => auth)

module.exports = firebaseAdminAuth
