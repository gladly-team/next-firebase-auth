/**
 * @jest-environment node
 */

import isClientSide from 'src/isClientSide'

// Note the jest-environment docstring at the top of this file.
describe('isClientSide in a server-side environment', () => {
  it('returns false', () => {
    expect.assertions(1)
    expect(isClientSide()).toBe(false)
  })
})
