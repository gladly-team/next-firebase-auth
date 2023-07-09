/* eslint-env jest */

// Create a mock user by passing mock input to the real createUser module.

import { createMockFirebaseUserAdminSDK } from 'src/testHelpers/userInputs'

const createUser = jest.requireActual('../createUser').default

const createMockUser = () =>
  createUser({ firebaseUserAdminSDK: createMockFirebaseUserAdminSDK() })

export default createMockUser
