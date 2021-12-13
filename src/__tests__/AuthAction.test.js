describe('index.js: AuthAction', () => {
  it('defines the expected constants', () => {
    expect.assertions(1)
    const AuthAction = require('src/AuthAction').default
    expect(AuthAction).toEqual({
      RENDER: 'render',
      SHOW_LOADER: 'showLoader',
      RETURN_NULL: 'returnNull',
      REDIRECT_TO_LOGIN: 'redirectToLogin',
      REDIRECT_TO_APP: 'redirectToApp',
    })
  })
})
