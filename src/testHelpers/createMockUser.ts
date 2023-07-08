/* eslint-env jest */

// Create a mock AuthUser by passing mock input to the
// real createAuthUser module.

import { createMockFirebaseUserAdminSDK } from 'src/testHelpers/userInputs'

const createAuthUser = jest.requireActual('../createUser').default

const createMockUser = () =>
  createAuthUser({ firebaseUserAdminSDK: createMockFirebaseUserAdminSDK() })

export default createMockUser
