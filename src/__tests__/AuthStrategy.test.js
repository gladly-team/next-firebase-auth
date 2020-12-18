describe('index.js: AuthStrategy', () => {
  it('defines the expected constants', () => {
    expect.assertions(1)
    const AuthStrategy = require('src/AuthStrategy').default
    expect(AuthStrategy).toEqual({
      RENDER: 'render',
      SHOW_LOADER: 'showLoader',
      RETURN_NULL: 'returnNull',
      REDIRECT_TO_LOGIN: 'redirectToLogin',
      REDIRECT_TO_APP: 'redirectToApp',
    })
  })
})
