import {
  getAuthUserCookieName,
  getAuthUserTokensCookieName,
} from 'src/authCookies'
import { setCookie } from 'src/cookies'

const unsetAuthCookies = async (req, res) => {
  // Setting the value to undefined will unset the cookie.
  setCookie(getAuthUserTokensCookieName(), undefined, { req, res })
  setCookie(getAuthUserCookieName(), undefined, {
    req,
    res,
  })
}

export default unsetAuthCookies
