import {
  getAuthUserCookieName,
  getAuthUserTokensCookieName,
} from 'src/authCookies'
import { deleteCookie } from 'src/cookies'
import { testApiHandler } from 'next-test-api-route-handler'
import { setConfig } from 'src/config'
import createMockConfig from 'src/testHelpers/createMockConfig'

jest.mock('src/config')
jest.mock('src/authCookies')
jest.mock('src/cookies')

beforeEach(() => {
  getAuthUserCookieName.mockReturnValue('SomeName.AuthUser')
  getAuthUserTokensCookieName.mockReturnValue('SomeName.AuthUserTokens')

  const mockConfig = createMockConfig()
  setConfig({
    ...mockConfig,
    cookies: {
      ...mockConfig.cookies,
      name: 'SomeName',
      keys: ['a-fake-key', 'another-fake-key'],
      domain: 'example.co.uk',
      httpOnly: true,
      maxAge: 12345678,
      overwrite: true,
      path: '/my-path',
      sameSite: 'strict',
      secure: true,
      signed: true,
    },
  })
})

afterEach(() => {
  jest.clearAllMocks()
})

describe('unsetAuthCookies', () => {
  it('calls deleteCookie for the AuthUser cookie', async () => {
    expect.assertions(1)
    const unsetAuthCookies = require('src/unsetAuthCookies').default
    let mockReq
    let mockRes
    await testApiHandler({
      handler: async (req, res) => {
        // Store the req/res to use in the test assertion.
        mockReq = req
        mockRes = res
        unsetAuthCookies(req, res)
        return res.status(200).end()
      },
      test: async ({ fetch }) => {
        await fetch()
        expect(deleteCookie).toHaveBeenCalledWith(
          'SomeName.AuthUser',
          {
            req: mockReq,
            res: mockRes,
          },
          // Options from the mock config.
          {
            keys: ['a-fake-key', 'another-fake-key'],
            domain: 'example.co.uk',
            httpOnly: true,
            maxAge: 12345678,
            overwrite: true,
            path: '/my-path',
            sameSite: 'strict',
            secure: true,
            signed: true,
          }
        )
      },
    })
  })

  it('calls deleteCookie for the AuthUserTokens cookie', async () => {
    expect.assertions(1)
    const unsetAuthCookies = require('src/unsetAuthCookies').default
    let mockReq
    let mockRes
    await testApiHandler({
      handler: async (req, res) => {
        // Store the req/res to use in the test assertion.
        mockReq = req
        mockRes = res
        unsetAuthCookies(req, res)
        return res.status(200).end()
      },
      test: async ({ fetch }) => {
        await fetch()
        expect(deleteCookie).toHaveBeenCalledWith(
          'SomeName.AuthUserTokens',
          {
            req: mockReq,
            res: mockRes,
          },
          // Options from the mock config.
          {
            keys: ['a-fake-key', 'another-fake-key'],
            domain: 'example.co.uk',
            httpOnly: true,
            maxAge: 12345678,
            overwrite: true,
            path: '/my-path',
            sameSite: 'strict',
            secure: true,
            signed: true,
          }
        )
      },
    })
  })
})
