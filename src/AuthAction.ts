// Different behaviors when the user's auth status is pending
// or mismatches the page requirements.

export enum AuthAction {
  RENDER = 'render',
  SHOW_LOADER = 'showLoader',
  RETURN_NULL = 'returnNull',
  REDIRECT_TO_LOGIN = 'redirectToLogin',
  REDIRECT_TO_APP = 'redirectToApp',
}
