/**
 * @jest-environment jsdom
 */

import isClientSide from 'src/isClientSide'

// Note the jest-environment docstring at the top of this file.
describe('isClientSide in a client-side environment', () => {
  it('returns true', () => {
    expect.assertions(1)
    expect(isClientSide()).toBe(true)
  })
})
