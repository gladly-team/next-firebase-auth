const firebaseAppMock = jest.createMockFromModule('firebase')
firebaseAppMock.apps = []
module.exports = firebaseAppMock
