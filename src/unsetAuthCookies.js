import {
  getAuthUserCookieName,
  getAuthUserTokensCookieName,
} from 'src/authCookies'
import { getConfig } from 'src/config'
import { deleteCookie } from 'src/cookies'

const unsetAuthCookies = async (req, res) => {
  const { keys, cookieOptions } = getConfig().cookies
  deleteCookie(
    getAuthUserTokensCookieName(),
    { req, res },
    {
      keys,
      ...cookieOptions,
    }
  )
  deleteCookie(
    getAuthUserCookieName(),
    {
      req,
      res,
    },
    {
      keys,
      ...cookieOptions,
    }
  )
}

export default unsetAuthCookies
