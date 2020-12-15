const mockUseFirebaseUser = jest.fn(() => ({
  user: undefined,
  initialized: false,
}))

module.exports = mockUseFirebaseUser
