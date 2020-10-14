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
// Meanwhile, here's a project that helps out:
// https://github.com/Xunnamius/next-test-api-route-handler
import { testApiHandler } from 'next-test-api-route-handler'
import setCookieParser from 'set-cookie-parser'
import { encodeBase64 } from 'src/encoding'

jest.mock('src/config')

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
  maxAge: 60 * 60 * 24, // one day
  overwrite: true,
  path: '/',
  sameSite: 'strict',
  secure: true,
  signed: true,
})

describe('cookies.js: getCookie', () => {
  it('returns the expected cookie value', async () => {
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
            cookie: `${MOCK_COOKIE_NAME}="${encodeBase64(
              JSON.stringify(MOCK_COOKIE_VAL)
            )}";`,
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
})

describe('cookies.js: setCookie', () => {
  it('sets the expected cookie value', async () => {
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

  // TODO: mock date to test expiry
  // TODO: test other cookie options
})
