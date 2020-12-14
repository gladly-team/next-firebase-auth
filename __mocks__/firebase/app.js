const firebaseAppMock = jest.createMockFromModule('firebase')
firebaseAppMock.apps = []

const mockSignOut = jest.fn(() => Promise.resolve())

firebaseAppMock.auth = jest.fn(() => ({
  signOut: mockSignOut,
}))

module.exports = firebaseAppMock
