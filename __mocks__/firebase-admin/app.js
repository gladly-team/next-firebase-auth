const firebaseAdminApp = jest.createMockFromModule('firebase-admin/app')

firebaseAdminApp.getApps = jest.fn(() => [])
firebaseAdminApp.getApp = jest.fn(() => ({
  applicationDefault: jest.fn(),
}))

module.exports = firebaseAdminApp
