describe('createAuthUser', () => {
  it('returns the expected data for an unauthenticated user', () => {
    expect.assertions(1)
    const createAuthUser = require('src/createAuthUser').default
    expect(createAuthUser()).toEqual({
      clientInitialized: false,
      email: null,
      emailVerified: false,
      getIdToken: expect.any(Function),
      id: null,
    })
  })
})
