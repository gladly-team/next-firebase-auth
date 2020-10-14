import { testApiHandler } from 'next-test-api-route-handler'
import { setConfig } from 'src/config'
import getMockConfig from 'src/testHelpers/getMockConfig'
import { encodeBase64 } from 'src/encoding'

jest.mock('src/config')

beforeEach(() => {
  const mockConfig = getMockConfig()
  setConfig({
    ...mockConfig,
    cookies: {
      ...mockConfig.cookies,
      cookieName: 'myNeatApp',
    },
  })
})

describe('cookies.js: getCookie', () => {
  it('returns the expected cookie value', async () => {
    expect.assertions(1)
    await testApiHandler({
      handler: async (req, res) => {
        const { getCookie } = require('src/cookies')
        const MOCK_COOKIE_NAME = 'myStuff'
        const cookieVal = getCookie(MOCK_COOKIE_NAME, { req, res })
        expect(JSON.parse(cookieVal)).toEqual({
          my: ['data', 'here'],
        })
        return res.status(200).end()
      },
      test: async ({ fetch }) => {
        await fetch({
          headers: {
            foo: 'blah',
            cookie: `myStuff="${encodeBase64(
              JSON.stringify({
                my: ['data', 'here'],
              })
            )}";`,
          },
        })
      },
    })
  })
})
