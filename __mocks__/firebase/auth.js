const firebaseAuthMock = jest.createMockFromModule('firebase/auth')

const mockOnIdTokenChangedUnsubscribe = jest.fn()
const mockOnIdTokenChanged = jest.fn(() => mockOnIdTokenChangedUnsubscribe)
const mockSignOut = jest.fn(() => Promise.resolve())

firebaseAuthMock.onIdTokenChanged = mockOnIdTokenChanged
firebaseAuthMock.signOut = mockSignOut

module.exports = firebaseAuthMock
