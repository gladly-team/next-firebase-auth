// https://github.com/pillarjs/cookies
import Cookies from 'cookies'
import { encodeBase64, decodeBase64 } from 'src/encoding'

const createCookieMgr = ({ req, res }, { keys, secure } = {}) => {
  if (secure && !keys) {
    throw new Error('cookies.keys must be set to use signed cookies.')
  }

  // https://github.com/pillarjs/cookies
  const cookies = Cookies(req, res, {
    keys,
    secure: true,
  })
  return cookies
}

export const getCookie = (cookieName, { req, res }, { keys } = {}) => {
  const cookies = createCookieMgr({ req, res }, { keys })
  try {
    const cookieVal = cookies.get(cookieName, {
      // FIXME: use user config
      // signed: true,
    })
    return cookieVal ? decodeBase64(cookieVal) : undefined
  } catch (e) {
    // eslint-disable-next-line no-console
    console.error(e)
    return undefined
  }
}

const ONE_WEEK_IN_MS = 60 * 60 * 24 * 7 * 1000

export const setCookie = (
  cookieName,
  cookieVal,
  { req, res },
  { keys, ...cookieOptions } = {}
) => {
  // TODO: probably cap maxAge to two weeks to enforce security.

  const secure = true // FIXME: use options
  const FAKE_KEYS = ['hello', 'hi'] // FIXME: use options

  const cookies = createCookieMgr({ req, res }, { keys: FAKE_KEYS, secure }) // FIXME

  // If the value is not defined, set the value to undefined
  // so that the cookie will be deleted.
  const valToSet = cookieVal == null ? undefined : encodeBase64(cookieVal)

  // FIXME: use user config
  cookies.set(cookieName, valToSet, {
    ...cookieOptions,
    // https://github.com/pillarjs/cookies#cookiesset-name--value---options--
    domain: undefined,
    httpOnly: true,
    maxAge: ONE_WEEK_IN_MS,
    overwrite: true,
    path: '/',
    sameSite: 'strict',
    secure,
    signed: true,
  })
}
