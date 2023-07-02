// https://github.com/pillarjs/cookies
import Cookies from 'cookies'
import {
  GetServerSidePropsContext,
  NextApiRequest,
  NextApiResponse,
} from 'next'
import { encodeBase64, decodeBase64 } from 'src/encoding'

interface ReqResObj {
  req: NextApiRequest | GetServerSidePropsContext['req']
  res: NextApiResponse | GetServerSidePropsContext['res']
}

interface ReqResOptionalObj {
  req: NextApiRequest | GetServerSidePropsContext['req']
  res?: NextApiResponse | GetServerSidePropsContext['res']
}

type CookieOptions = Omit<Cookies.Option & Cookies.SetOption, 'sameSite'> & {
  sameSite?: string
}

const createCookieMgr = (
  { req, res }: ReqResObj,
  {
    keys,
    secure,
  }: { keys?: Cookies.Option['keys']; secure?: Cookies.Option['secure'] } = {}
) => {
  // https://github.com/pillarjs/cookies
  const cookies = Cookies(req, res, {
    keys,
    secure,
  })
  return cookies
}

export const getCookie = (
  name: string,
  // The request object is mandatory. The response object is optional.
  {
    req,
    // The "cookies" package still interacts with the response object when
    // initializing. As a convenience, default to a minimal response object
    // that avoids unhelpful "cookies" errors when a response object is not
    // provided.
    // https://github.com/pillarjs/cookies/blob/master/index.js
    res = {
      getHeader: () => [],
      setHeader: () => ({
        // eslint-disable-next-line @typescript-eslint/no-empty-function
        call: () => {},
      }),
    } as unknown as NextApiResponse,
  }: ReqResOptionalObj,
  {
    keys,
    secure,
    signed = false,
  }: {
    keys?: Cookies.Option['keys']
    secure?: Cookies.Option['secure']
    signed?: Cookies.SetOption['signed']
  } = {}
) => {
  if (signed) {
    const areCookieKeysDefined = Array.isArray(keys)
      ? keys.length &&
        (keys.filter ? keys.filter((item) => item !== undefined).length : true)
      : !!keys
    if (!areCookieKeysDefined) {
      throw new Error(
        'The "keys" value must be provided when using signed cookies.'
      )
    }
  }
  if (!req) {
    throw new Error('The "req" argument is required when calling `getCookie`.')
  }

  const cookies = createCookieMgr({ req, res }, { keys, secure })

  // https://github.com/pillarjs/cookies#cookiesget-name--options--
  const cookieVal = cookies.get(name, { signed })
  return cookieVal ? decodeBase64(cookieVal) : undefined
}

export const setCookie = (
  name: string,
  cookieVal: string | undefined,
  // The response object is mandatory. The request is optional and unused.
  { req, res }: ReqResObj,
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
  }: CookieOptions = {}
) => {
  if (signed && !keys) {
    throw new Error(
      'The "keys" value must be provided when using signed cookies.'
    )
  }
  if (!res) {
    throw new Error('The "res" argument is required when calling `setCookie`.')
  }

  const cookies = createCookieMgr({ req, res }, { keys, secure })

  // If the value is not defined, set the value to undefined
  // so that the cookie will be deleted.
  const valToSet = cookieVal == null ? undefined : encodeBase64(cookieVal)

  // https://github.com/pillarjs/cookies#cookiesset-name--value---options--
  cookies.set(name, valToSet, {
    domain,
    httpOnly,
    maxAge,
    overwrite,
    path,
    // Prefer explicit sameSite string instead of boolean.
    sameSite: sameSite as Cookies.SetOption['sameSite'],
    secure,
    signed,
  })
}

// Some options, like path and domain, must match those used when setting
// the cookie.
export const deleteCookie = (
  name: string,
  reqResObj: ReqResObj,
  options: CookieOptions
) => {
  // "If the value is omitted, an outbound header with an expired
  // date is used to delete the cookie."
  // https://github.com/pillarjs/cookies#cookiesset-name--value---options--
  setCookie(name, undefined, reqResObj, options)
}
