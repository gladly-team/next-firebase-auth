/**
 * Test of the claims filter function
 */
import { createMockDecodedIdTokenWithClaims } from 'src/testHelpers/authUserInputs'

describe('filterStandardClaims', () => {
  it('should filter out standard claims from an object', () => {
    expect.assertions(1)
    const customClaims = {
      foo: 'bar',
      has: 'cheese',
      likes: 'cats',
    }
    const { filterStandardClaims } = require('src/claims')
    const tokenWithClaims = createMockDecodedIdTokenWithClaims(customClaims)
    expect(filterStandardClaims(tokenWithClaims)).toEqual(customClaims)
  })
})
