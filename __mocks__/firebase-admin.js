const firebaseAdminMock = jest.createMockFromModule('firebase-admin')

const mockTenantValue = {
  createCustomToken: jest.fn(() => Promise.resolve(null)),
  verifyIdToken: jest.fn(() => Promise.resolve(null)),
}

const mockAuthForTenant = jest.fn(() => mockTenantValue)

const mockAuthValue = {
  ...mockTenantValue,
  tenantManager: () => ({
    authForTenant: mockAuthForTenant,
  }),
}

firebaseAdminMock.auth = jest.fn(() => mockAuthValue)

firebaseAdminMock.apps = []

module.exports = firebaseAdminMock
