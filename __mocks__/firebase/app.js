const firebaseAppMock = jest.createMockFromModule('firebase')
firebaseAppMock.apps = []

firebaseAppMock.auth = jest.fn(() => ({
  signOut: jest.fn(() => Promise.resolve()),
}))

module.exports = firebaseAppMock
