export {}

// Avoid using jest.requireActual for firebase-admin/auth as it causes issues
// with firebase-admin v13+ due to dependencies like 'jose' that don't work
// well in Jest's Node environment. Instead, create a manual mock.
const firebaseAdminAuth = {
  getAuth: jest.fn(),
}

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
