/* eslint-disable global-require */
import index from 'src/index'

// These are exclusively for server-side use.
import setAuthCookies from 'src/setAuthCookies'
import unsetAuthCookies from 'src/unsetAuthCookies'

export default {
  ...index,
  setAuthCookies,
  unsetAuthCookies,
}
