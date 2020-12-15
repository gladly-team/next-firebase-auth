/* eslint-env jest */

// Create a mock AuthUser by passing mock input to the
// real createAuthUser module.

import { getMockFirebaseUserAdminSDK } from 'src/testHelpers/authUserInputs'

const createAuthUser = jest.requireActual('../createAuthUser').default

const createMockAuthUser = () =>
  createAuthUser({ firebaseUserAdminSDK: getMockFirebaseUserAdminSDK() })

export default createMockAuthUser
