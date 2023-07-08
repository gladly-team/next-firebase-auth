/* eslint-env jest */

// Create a mock AuthUser by passing mock input to the
// real createAuthUser module.

import { createMockFirebaseUserAdminSDK } from 'src/testHelpers/authUserInputs'

const createAuthUser = jest.requireActual('../createUser').default

const createMockAuthUser = () =>
  createAuthUser({ firebaseUserAdminSDK: createMockFirebaseUserAdminSDK() })

export default createMockAuthUser
