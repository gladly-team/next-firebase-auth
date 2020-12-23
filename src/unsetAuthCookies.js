import {
  getAuthUserCookieName,
  getAuthUserTokensCookieName,
} from 'src/authCookies'
import { getConfig } from 'src/config'
import { deleteCookie } from 'src/cookies'

const unsetAuthCookies = async (req, res) => {
  // Pick a subset of the config.cookies options to
  // pass to deleteCookie.
  const cookieOptions = (({
    domain,
    httpOnly,
    keys,
    maxAge,
    overwrite,
    path,
    sameSite,
    secure,
    signed,
  }) => ({
    domain,
    httpOnly,
    keys,
    maxAge,
    overwrite,
    path,
    sameSite,
    secure,
    signed,
  }))(getConfig().cookies)
  deleteCookie(getAuthUserTokensCookieName(), { req, res }, cookieOptions)
  deleteCookie(
    getAuthUserCookieName(),
    {
      req,
      res,
    },
    cookieOptions
  )
}

export default unsetAuthCookies
