// FIXME: refactor

import Cookies from 'cookies'
import { encodeBase64, decodeBase64 } from 'src/encoding'

const serialize = (val) => encodeBase64(val)
const deserialize = (val) => decodeBase64(val)

const createCookieMgr = (req, res) => {
  // TODO: use user config
  // An array is useful for rotating secrets without invalidating old sessions.
  // The first will be used to sign cookies, and the rest to validate them.
  const sessionSecrets = [
    process.env.SESSION_SECRET_CURRENT,
    process.env.SESSION_SECRET_PREVIOUS,
  ]

  // https://github.com/pillarjs/cookies
  const cookies = Cookies(req, res, {
    keys: sessionSecrets,
    // Recommended: set other options, such as "secure", "sameSite", etc.
    // https://github.com/pillarjs/cookies#readme
  })
  return cookies
}

export const getCookie = (cookieName, { req, res }) => {
  const cookies = createCookieMgr(req, res)
  try {
    return JSON.parse(
      deserialize(
        cookies.get(cookieName, {
          signed: true,
        })
      )
    )
  } catch (e) {
    return undefined
  }
}

export const setCookie = (cookieName, cookieVal, { req, res }) => {
  const cookies = createCookieMgr(req, res)
  let serializedVal
  // If the value is not defined, set the value to undefined
  // so that the cookie will be deleted.
  if (cookieVal == null) {
    serializedVal = undefined
  } else {
    serializedVal = serialize(cookieVal)
  }

  // TODO: user config options
  cookies.set(cookieName, serializedVal, {
    httpOnly: true,
    maxAge: 604800000, // week
    overwrite: true,
  })
}
