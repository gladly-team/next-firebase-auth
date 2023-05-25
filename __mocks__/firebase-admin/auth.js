const firebaseAdminAuth = jest.createMockFromModule('firebase-admin/auth')

const mockTenantValue = {
  createCustomToken: jest.fn(() => Promise.resolve(null)),
  verifyIdToken: jest.fn(() => Promise.resolve(null)),
}

const mockAuthForTenant = jest.fn(() => mockTenantValue)

const auth = {
  createCustomToken: jest.fn(async () => null),
  verifyIdToken: jest.fn(async () => null),
  tenantManager: jest.fn(() => ({
    authForTenant: mockAuthForTenant,
  })),
}

firebaseAdminAuth.getAuth = jest.fn(() => auth)

module.exports = firebaseAdminAuth
