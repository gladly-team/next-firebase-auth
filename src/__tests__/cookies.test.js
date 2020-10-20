// Here, we decided to test against the unmocked third-party
// cookies library to 1) make sure it does not have any problems
// with Next's request object, and 2) to make it easier to swap
// it out for another cookies library if needed.
//
// We're using next-test-api-route-handler to facilitate testing
// that better reflects the production environment:
// https://github.com/Xunnamius/next-test-api-route-handler
// Some background on this:
// Testing Next.js API routes is a little tricky, because there's
// not an easy way to provide mock request and response objects.
// https://nextjs.org/docs/api-routes/introduction
// The request object is a modified version of an IncomingMessage
// instance:
// https://nodejs.org/api/http.html#http_class_http_incomingmessage
// The response object is a modified version of a ServerResponse
// instance:
// https://nodejs.org/api/http.html#http_class_http_serverresponse
// One approach we've used elsewhere is to provide mock `req` and
// `res` objects, which works for simpler API logic but falls short
// when there's more complex interaction (e.g., things like cookie
// middleware) because the mocks might not reflect production
// behavior.
// Ideally, Next would provide a guide or helpers to enable simpler
// testing. Here are a few related discussions:
// https://github.com/vercel/next.js/discussions/15166
// https://github.com/vercel/next.js/discussions/17528
import moment from 'moment'
import MockDate from 'mockdate'
import { testApiHandler } from 'next-test-api-route-handler'
import setCookieParser from 'set-cookie-parser'
import { encodeBase64 } from 'src/encoding'

jest.mock('src/config')

const mockNow = '2020-10-15T18:00:00.000Z'

beforeEach(() => {
  MockDate.set(moment(mockNow))
})

// Handles splitting cookies set in a single "set-cookie" header.
// https://github.com/nfriedly/set-cookie-parser#usage-in-react-native
const parseCookies = (headerVal) => {
  const splitCookieHeaders = setCookieParser.splitCookiesString(headerVal)
  return setCookieParser.parse(splitCookieHeaders)
}

const createGetCookieOptions = () => ({
  keys: ['some-key', 'another-key'],
  secure: true,
  signed: true,
})

const createSetCookieOptions = () => ({
  domain: undefined,
  httpOnly: true,
  keys: ['some-key', 'another-key'],
  maxAge: 60 * 60 * 24 * 1000, // one day
  overwrite: true,
  path: '/',
  sameSite: 'strict',
  secure: true,
  signed: true,
})

describe('cookies.js: getCookie', () => {
  it('returns the expected cookie value [unsigned]', async () => {
    expect.assertions(1)
    const MOCK_COOKIE_NAME = 'myStuff'
    const MOCK_COOKIE_VAL = {
      my: ['data', 'here'],
    }
    await testApiHandler({
      handler: async (req, res) => {
        const { getCookie } = require('src/cookies')
        const cookieVal = getCookie(
          MOCK_COOKIE_NAME,
          { req, res },
          { ...createGetCookieOptions(), keys: undefined, signed: false }
        )
        expect(JSON.parse(cookieVal)).toEqual(MOCK_COOKIE_VAL)
        return res.status(200).end()
      },
      test: async ({ fetch }) => {
        await fetch({
          headers: {
            foo: 'blah',
            cookie: `${MOCK_COOKIE_NAME}=${encodeBase64(
              JSON.stringify(MOCK_COOKIE_VAL)
            )};`,
          },
        })
      },
    })
  })

  it('returns the expected cookie value [signed]', async () => {
    expect.assertions(1)
    const MOCK_COOKIE_NAME = 'myStuff'
    const MOCK_COOKIE_VAL = 'abc123'

    // This is the encoded SHA1 HMAC value from the Keygrip library
    // used by the `cookies` module. It's signed using the provided
    // value in keys[0].
    // To get the expected value, we just copy-pasted the signed value
    // rather than computing it ourselves.
    const MOCK_COOKIE_SIG_VAL = 'eOOK_EF-fiTOtyFgpFpik6OyEMA'

    await testApiHandler({
      handler: async (req, res) => {
        const { getCookie } = require('src/cookies')

        const cookieVal = getCookie(
          MOCK_COOKIE_NAME,
          { req, res },
          { ...createGetCookieOptions(), keys: ['some-key'], signed: true }
        )
        expect(cookieVal).toEqual(MOCK_COOKIE_VAL)
        return res.status(200).end()
      },
      test: async ({ fetch }) => {
        await fetch({
          headers: {
            cookie: `${MOCK_COOKIE_NAME}=${encodeBase64(
              MOCK_COOKIE_VAL
            )}; ${MOCK_COOKIE_NAME}.sig=${MOCK_COOKIE_SIG_VAL};`,
          },
        })
      },
    })
  })

  it('returns undefined if the signed cookie value is incorrect [signed]', async () => {
    expect.assertions(1)
    const MOCK_COOKIE_NAME = 'myStuff'
    const MOCK_COOKIE_VAL = 'abc123'
    const MOCK_COOKIE_SIG_VAL = 'xyzxyzxyz' // this is not correct

    await testApiHandler({
      handler: async (req, res) => {
        const { getCookie } = require('src/cookies')

        const cookieVal = getCookie(
          MOCK_COOKIE_NAME,
          { req, res },
          { ...createGetCookieOptions(), keys: ['some-key'], signed: true }
        )
        expect(cookieVal).toBeUndefined()
        return res.status(200).end()
      },
      test: async ({ fetch }) => {
        await fetch({
          headers: {
            cookie: `${MOCK_COOKIE_NAME}=${encodeBase64(
              MOCK_COOKIE_VAL
            )}; ${MOCK_COOKIE_NAME}.sig=${MOCK_COOKIE_SIG_VAL};`,
          },
        })
      },
    })
  })

  it('returns undefined if the signed cookie value is missing [signed]', async () => {
    expect.assertions(1)
    const MOCK_COOKIE_NAME = 'myStuff'
    const MOCK_COOKIE_VAL = 'abc123'
    const MOCK_COOKIE_SIG_VAL = 'xyzxyzxyz' // this is not correct

    await testApiHandler({
      handler: async (req, res) => {
        const { getCookie } = require('src/cookies')

        const cookieVal = getCookie(
          MOCK_COOKIE_NAME,
          { req, res },
          { ...createGetCookieOptions(), keys: ['some-key'], signed: true }
        )
        expect(cookieVal).toBeUndefined()
        return res.status(200).end()
      },
      test: async ({ fetch }) => {
        await fetch({
          headers: {
            cookie: `${MOCK_COOKIE_NAME}=${encodeBase64(MOCK_COOKIE_VAL)};`, // missing .sig cookie
          },
        })
      },
    })
  })

  it('returns undefined if the cookie is not set', async () => {
    expect.assertions(1)
    const MOCK_COOKIE_NAME = 'nonexistentCookie'
    await testApiHandler({
      handler: async (req, res) => {
        const { getCookie } = require('src/cookies')
        const cookieVal = getCookie(
          MOCK_COOKIE_NAME,
          { req, res },
          { ...createGetCookieOptions(), keys: undefined, signed: false }
        )
        expect(cookieVal).toBeUndefined()
        return res.status(200).end()
      },
      test: async ({ fetch }) => {
        await fetch({
          headers: {
            foo: 'blah',
            cookie: `someOtherCookie=abc;`,
          },
        })
      },
    })
  })

  it('returns undefined if no cookies are set', async () => {
    expect.assertions(1)
    const MOCK_COOKIE_NAME = 'nonexistentCookie'
    await testApiHandler({
      handler: async (req, res) => {
        const { getCookie } = require('src/cookies')
        const cookieVal = getCookie(
          MOCK_COOKIE_NAME,
          { req, res },
          { ...createGetCookieOptions(), keys: undefined, signed: false }
        )
        expect(cookieVal).toBeUndefined()
        return res.status(200).end()
      },
      test: async ({ fetch }) => {
        // No cookie header.
        await fetch()
      },
    })
  })

  it('throws if the "signed" option is true but "keys" is not defined', async () => {
    expect.assertions(1)
    await testApiHandler({
      handler: async (req, res) => {
        const { getCookie } = require('src/cookies')
        expect(() => {
          getCookie(
            'foo',
            { req, res },
            { ...createGetCookieOptions(), keys: undefined, signed: true }
          )
        }).toThrow(
          'The "keys" value must be provided when using signed cookies.'
        )
        return res.status(200).end()
      },
      test: async ({ fetch }) => {
        await fetch({
          headers: {
            foo: 'blah',
          },
        })
      },
    })
  })
})

describe('cookies.js: setCookie', () => {
  it('sets the expected base64-encoded cookie value', async () => {
    expect.assertions(1)
    const MOCK_COOKIE_NAME = 'myStuff'
    const MOCK_COOKIE_VALUE = JSON.stringify({ some: 'data' })
    await testApiHandler({
      handler: async (req, res) => {
        const { setCookie } = require('src/cookies')
        setCookie(
          MOCK_COOKIE_NAME,
          MOCK_COOKIE_VALUE,
          {
            req,
            res,
          },
          createSetCookieOptions()
        )
        return res.status(200).end()
      },
      test: async ({ fetch }) => {
        const response = await fetch()
        const setCookiesParsed = parseCookies(
          response.headers.get('set-cookie')
        )
        const expectedVal = encodeBase64(MOCK_COOKIE_VALUE)
        expect(
          setCookiesParsed.find((cookie) => cookie.name === MOCK_COOKIE_NAME)
            .value
        ).toEqual(expectedVal)
      },
    })
  })

  it('sets a .sig cookie value when "signed" is true', async () => {
    expect.assertions(2)
    const MOCK_COOKIE_NAME = 'myStuff'
    const MOCK_COOKIE_VALUE = 'abc123'
    await testApiHandler({
      handler: async (req, res) => {
        const { setCookie } = require('src/cookies')
        setCookie(
          MOCK_COOKIE_NAME,
          MOCK_COOKIE_VALUE,
          {
            req,
            res,
          },
          { ...createSetCookieOptions(), signed: true, keys: ['some-key'] }
        )
        return res.status(200).end()
      },
      test: async ({ fetch }) => {
        const response = await fetch()
        const setCookiesParsed = parseCookies(
          response.headers.get('set-cookie')
        )

        // This is the encoded SHA1 HMAC value from the Keygrip library
        // used by the `cookies` module. It's signed using the provided
        // value in keys[0].
        // To get the expected value, we just copy-pasted the signed value
        // rather than computing it ourselves.
        const expectedVal = 'eOOK_EF-fiTOtyFgpFpik6OyEMA'

        expect(
          setCookiesParsed.find(
            (cookie) => cookie.name === `${MOCK_COOKIE_NAME}.sig` // note .sig
          ).value
        ).toEqual(expectedVal)
        expect(setCookiesParsed.length).toBe(2)
      },
    })
  })

  it('does not set a .sig cookie value when "signed" is false', async () => {
    expect.assertions(2)
    const MOCK_COOKIE_NAME = 'myStuff'
    const MOCK_COOKIE_VALUE = JSON.stringify({ some: 'data' })
    await testApiHandler({
      handler: async (req, res) => {
        const { setCookie } = require('src/cookies')
        setCookie(
          MOCK_COOKIE_NAME,
          MOCK_COOKIE_VALUE,
          {
            req,
            res,
          },
          { ...createSetCookieOptions(), signed: false, keys: undefined }
        )
        return res.status(200).end()
      },
      test: async ({ fetch }) => {
        const response = await fetch()
        const setCookiesParsed = parseCookies(
          response.headers.get('set-cookie')
        )
        expect(
          setCookiesParsed.find(
            (cookie) => cookie.name === `${MOCK_COOKIE_NAME}.sig` // note .sig
          )
        ).toBeUndefined()
        expect(setCookiesParsed.length).toBe(1)
      },
    })
  })

  it('allows setting multiple cookies', async () => {
    expect.assertions(3)
    await testApiHandler({
      handler: async (req, res) => {
        const { setCookie } = require('src/cookies')
        setCookie(
          'something',
          'here',
          {
            req,
            res,
          },
          createSetCookieOptions()
        )
        setCookie(
          'foo',
          'bar',
          {
            req,
            res,
          },
          createSetCookieOptions()
        )
        return res.status(200).end()
      },
      test: async ({ fetch }) => {
        const response = await fetch()
        const setCookiesParsed = parseCookies(
          response.headers.get('set-cookie')
        )

        // Two cookies and two associated .sig hashes.
        expect(setCookiesParsed.length).toBe(4)

        expect(
          setCookiesParsed.find((cookie) => cookie.name === 'something')
        ).toBeDefined()
        expect(
          setCookiesParsed.find((cookie) => cookie.name === 'foo')
        ).toBeDefined()
      },
    })
  })

  it('does not set any cookies when not calling setCookie', async () => {
    expect.assertions(1)
    await testApiHandler({
      handler: async (req, res) => {
        // Shouldn't set any cookies.
        return res.status(200).end()
      },
      test: async ({ fetch }) => {
        const response = await fetch()
        const setCookiesParsed = parseCookies(
          response.headers.get('set-cookie')
        )
        expect(setCookiesParsed.length).toBe(0)
      },
    })
  })

  it('throws if the "signed" option is true but "keys" is not defined', async () => {
    expect.assertions(1)
    await testApiHandler({
      handler: async (req, res) => {
        const { setCookie } = require('src/cookies')
        expect(() => {
          setCookie(
            'foo',
            'bar',
            {
              req,
              res,
            },
            { ...createSetCookieOptions(), keys: undefined, signed: true }
          )
        }).toThrow(
          'The "keys" value must be provided when using signed cookies.'
        )
        return res.status(200).end()
      },
      test: async ({ fetch }) => {
        await fetch()
      },
    })
  })

  // TODO: mock date to test expiry
  // TODO: test other cookie options
})
