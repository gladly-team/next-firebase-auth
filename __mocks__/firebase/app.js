export {}

const { FirebaseError } = jest.requireActual('firebase/app')

const firebaseAppMock = jest.createMockFromModule('firebase/app')

firebaseAppMock.getApps = jest.fn(() => [])

module.exports = {
  ...firebaseAppMock,
  FirebaseError,
}
