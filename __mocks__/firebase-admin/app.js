export {}

const firebaseAdminApp = jest.createMockFromModule('firebase-admin/app')

firebaseAdminApp.getApps = jest.fn(() => [])
firebaseAdminApp.getApp = jest.fn(() => undefined)

module.exports = firebaseAdminApp
