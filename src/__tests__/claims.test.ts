/**
 * Test of the claims filter function
 */
import { createMockFirebaseUserAdminSDK } from 'src/testHelpers/authUserInputs'

describe('filterStandardClaims', () => {
  it('should filter out standard claims from an object', () => {
    expect.assertions(1)
    const customClaims = {
      foo: 'bar',
      has: 'cheese',
      likes: 'cats',
    }
    const { filterStandardClaims } = require('src/claims')
    const tokenWithClaims = {
      ...createMockFirebaseUserAdminSDK(),
      ...customClaims,
    }
    expect(filterStandardClaims(tokenWithClaims)).toEqual(customClaims)
  })
})
