import { NextApiRequest, NextApiResponse } from 'next'
import {
  getAuthUserCookieName,
  getAuthUserTokensCookieName,
} from 'src/authCookies'
import { getConfig } from 'src/config'
import { deleteCookie } from 'src/cookies'
import logDebug from 'src/logDebug'

export type UnsetAuthCookies = (
  req: NextApiRequest,
  res: NextApiResponse
) => Promise<void>

const unsetAuthCookies: UnsetAuthCookies = async (
  req: NextApiRequest,
  res: NextApiResponse
) => {
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
  logDebug('[unsetAuthCookies] Unset auth cookies.')
}

export default unsetAuthCookies
