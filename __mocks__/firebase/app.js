const firebaseAppMock = jest.createMockFromModule('firebase/app')

firebaseAppMock.getApps = jest.fn(() => [])

module.exports = firebaseAppMock
