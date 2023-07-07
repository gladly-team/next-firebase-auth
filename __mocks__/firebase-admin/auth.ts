export {}

const { Auth } = jest.requireActual('firebase-admin/auth')

const firebaseAdminAuth: jest.Mocked<typeof Auth> = jest.createMockFromModule(
  'firebase-admin/auth'
)

const mockTenantValue = {
  createCustomToken: jest.fn(() => Promise.resolve(null)),
  verifyIdToken: jest.fn(() => Promise.resolve(null)),
  getUser: jest.fn(() => Promise.resolve(null)) as jest.Mock,
}

const mockAuthForTenant = jest.fn(() => mockTenantValue) as jest.Mock

const auth = {
  createCustomToken: jest.fn(async () => null) as jest.Mock,
  verifyIdToken: jest.fn(async () => null) as jest.Mock,
  getUser: jest.fn(() => Promise.resolve(null)) as jest.Mock,
  tenantManager: jest.fn(() => ({
    authForTenant: mockAuthForTenant,
  })) as jest.Mock,
}

firebaseAdminAuth.getAuth = jest.fn(() => auth)

module.exports = firebaseAdminAuth
