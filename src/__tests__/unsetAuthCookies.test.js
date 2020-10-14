import {
  getAuthUserCookieName,
  getAuthUserTokensCookieName,
} from 'src/authCookies'
import { setCookie } from 'src/cookies'
import { testApiHandler } from 'next-test-api-route-handler'

jest.mock('src/authCookies')
jest.mock('src/cookies')

beforeEach(() => {
  getAuthUserCookieName.mockReturnValue('SomeName.AuthUser')
  getAuthUserTokensCookieName.mockReturnValue('SomeName.AuthUserTokens')
})

afterEach(() => {
  jest.clearAllMocks()
})

describe('unsetAuthCookies', () => {
  it('calls setCookie with an undefined value for the AuthUser cookie', async () => {
    expect.assertions(1)
    const unsetAuthCookies = require('src/unsetAuthCookies').default
    let mockReq
    let mockRes
    await testApiHandler({
      handler: async (req, res) => {
        // Store the req/res to use in assertion.
        mockReq = req
        mockRes = res
        unsetAuthCookies(req, res)
        return res.status(200).end()
      },
      test: async ({ fetch }) => {
        await fetch()
        expect(setCookie).toHaveBeenCalledWith('SomeName.AuthUser', undefined, {
          req: mockReq,
          res: mockRes,
        })
      },
    })
  })

  it('calls setCookie with an undefined value for the AuthUserTokens cookie', async () => {
    expect.assertions(1)
    const unsetAuthCookies = require('src/unsetAuthCookies').default
    let mockReq
    let mockRes
    await testApiHandler({
      handler: async (req, res) => {
        // Store the req/res to use in assertion.
        mockReq = req
        mockRes = res
        unsetAuthCookies(req, res)
        return res.status(200).end()
      },
      test: async ({ fetch }) => {
        await fetch()
        expect(setCookie).toHaveBeenCalledWith(
          'SomeName.AuthUserTokens',
          undefined,
          {
            req: mockReq,
            res: mockRes,
          }
        )
      },
    })
  })
})
