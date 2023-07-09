/* eslint-disable @typescript-eslint/no-explicit-any */

const firebaseAuthMock: any = jest.createMockFromModule('firebase/auth')

const mockOnIdTokenChangedUnsubscribe = jest.fn()
const mockOnIdTokenChanged = jest.fn(() => mockOnIdTokenChangedUnsubscribe)
const mockSignOut = jest.fn(() => Promise.resolve())

firebaseAuthMock.onIdTokenChanged = mockOnIdTokenChanged
firebaseAuthMock.signOut = mockSignOut

const { FirebaseError } = jest.requireActual('firebase/app')
const firebaseAppMock: any = jest.createMockFromModule('firebase/app')
firebaseAppMock.getApps = jest.fn(() => [])

const firebaseAppMockWithErr = {
  ...firebaseAppMock,
  FirebaseError,
}

const mockInit = jest.fn(() => ({
  app: firebaseAppMockWithErr,
  auth: firebaseAuthMock,
}))

export default mockInit
