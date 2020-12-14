const firebaseAppMock = jest.createMockFromModule('firebase')
firebaseAppMock.apps = []

const mockOnIdTokenChangedUnsubscribe = jest.fn()
const mockOnIdTokenChanged = jest.fn(() => mockOnIdTokenChangedUnsubscribe)
const mockSignOut = jest.fn(() => Promise.resolve())

firebaseAppMock.auth = jest.fn(() => ({
  onIdTokenChanged: mockOnIdTokenChanged,
  signOut: mockSignOut,
}))

module.exports = firebaseAppMock
