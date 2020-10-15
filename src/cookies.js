// https://github.com/pillarjs/cookies
import Cookies from 'cookies'
import { encodeBase64, decodeBase64 } from 'src/encoding'

const createCookieMgr = ({ req, res }, { keys, secure } = {}) => {
  // https://github.com/pillarjs/cookies
  const cookies = Cookies(req, res, {
    keys,
    secure,
  })
  return cookies
}

export const getCookie = (
  cookieName,
  { req, res },
  { keys, secure, signed } = {}
) => {
  // TODO: test
  if (signed && !keys) {
    throw new Error(
      'The "keys" value must be provided when using signed cookies.'
    )
  }

  const cookies = createCookieMgr({ req, res }, { keys, secure })
  try {
    // https://github.com/pillarjs/cookies#cookiesget-name--options--
    const cookieVal = cookies.get(cookieName, { signed })
    return cookieVal ? decodeBase64(cookieVal) : undefined
  } catch (e) {
    // eslint-disable-next-line no-console
    console.error(e)
    return undefined
  }
}

export const setCookie = (
  cookieName,
  cookieVal,
  { req, res },
  {
    keys,
    domain,
    httpOnly,
    maxAge,
    overwrite,
    path,
    sameSite,
    secure,
    signed,
  } = {}
) => {
  // TODO: probably cap maxAge to two weeks to enforce security.

  // TODO: test
  if (signed && !keys) {
    throw new Error(
      'The "keys" value must be provided when using signed cookies.'
    )
  }

  const cookies = createCookieMgr({ req, res }, { keys, secure })

  // If the value is not defined, set the value to undefined
  // so that the cookie will be deleted.
  const valToSet = cookieVal == null ? undefined : encodeBase64(cookieVal)

  // https://github.com/pillarjs/cookies#cookiesset-name--value---options--
  cookies.set(cookieName, valToSet, {
    domain,
    httpOnly,
    maxAge,
    overwrite,
    path,
    sameSite,
    secure,
    signed,
  })
}
