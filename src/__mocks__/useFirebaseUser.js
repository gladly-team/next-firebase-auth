const mockUseFirebaseUser = jest.fn(() => ({
  user: undefined,
  claims: {},
  initialized: false,
}))

module.exports = mockUseFirebaseUser
