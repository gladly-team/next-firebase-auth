import { testApiHandler } from 'next-test-api-route-handler'
import { getCustomIdAndRefreshTokens } from 'src/firebaseAdmin'
import { setCookie } from 'src/cookies'
import {
  getAuthUserCookieName,
  getAuthUserTokensCookieName,
} from 'src/authCookies'
import { setConfig } from 'src/config'
import createMockConfig from 'src/testHelpers/createMockConfig'
import createMockAuthUser from 'src/testHelpers/createMockAuthUser'

jest.mock('src/config')
jest.mock('src/firebaseAdmin')
jest.mock('src/authCookies')
jest.mock('src/cookies')

beforeEach(() => {
  const mockAuthUser = createMockAuthUser()
  getAuthUserCookieName.mockReturnValue('SomeName.AuthUser')
  getAuthUserTokensCookieName.mockReturnValue('SomeName.AuthUserTokens')
  getCustomIdAndRefreshTokens.mockResolvedValue({
    idToken: 'fake-custom-id-token-here',
    refreshToken: 'fake-refresh-token-here',
    AuthUser: mockAuthUser,
  })

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

describe('setAuthCookies', () => {
  it('throws if the Authorization header is not set (and no other token is passed explicitly)', async () => {
    expect.assertions(1)
    const setAuthCookies = require('src/setAuthCookies').default
    jest.spyOn(console, 'error').mockImplementationOnce(() => {})
    await expect(
      testApiHandler({
        rejectOnHandlerError: true,
        handler: async (req, res) => {
          await setAuthCookies(req, res)
          return res.status(200).end()
        },
        test: async ({ fetch }) => {
          await fetch() // no Authorization header
        },
      })
    ).rejects.toThrow(
      'The request must have an Authorization header value, or you should explicitly provide an ID token to "setAuthCookies".'
    )
  })

  it('does not throw if the Authorization header is not set but the token is passed explicitly', async () => {
    expect.assertions(1)
    const setAuthCookies = require('src/setAuthCookies').default
    await expect(
      testApiHandler({
        rejectOnHandlerError: true,
        handler: async (req, res) => {
          await setAuthCookies(req, res, { token: 'some-token' })
          return res.status(200).end()
        },
        test: async ({ fetch }) => {
          await fetch() // no Authorization header
        },
      })
    ).resolves.not.toThrow()
  })

  it('passes the token from the Authorization header to Firebase admin (if no other token is passed explicitly)', async () => {
    expect.assertions(1)
    const setAuthCookies = require('src/setAuthCookies').default
    await testApiHandler({
      handler: async (req, res) => {
        await setAuthCookies(req, res)
        return res.status(200).end()
      },
      test: async ({ fetch }) => {
        await fetch({
          headers: {
            authorization: 'some-token-here',
          },
        })
        expect(getCustomIdAndRefreshTokens).toHaveBeenCalledWith(
          'some-token-here'
        )
      },
    })
  })

  it('passes the explicitly-provided token to Firebase admin', async () => {
    expect.assertions(1)
    const setAuthCookies = require('src/setAuthCookies').default
    await testApiHandler({
      handler: async (req, res) => {
        await setAuthCookies(req, res, { token: 'a-cool-token' })
        return res.status(200).end()
      },
      test: async ({ fetch }) => {
        await fetch() // no Authorization header
        expect(getCustomIdAndRefreshTokens).toHaveBeenCalledWith('a-cool-token')
      },
    })
  })

  it('uses the explicitly-passed token rather than the Authorization header value if both are provided', async () => {
    expect.assertions(1)
    const setAuthCookies = require('src/setAuthCookies').default
    await testApiHandler({
      handler: async (req, res) => {
        await setAuthCookies(req, res, { token: 'another-token-here' })
        return res.status(200).end()
      },
      test: async ({ fetch }) => {
        await fetch({
          headers: {
            authorization: 'some-token-here',
          },
        })
        expect(getCustomIdAndRefreshTokens).toHaveBeenCalledWith(
          'another-token-here'
        )
      },
    })
  })

  it('sets the AuthUser cookie as expected', async () => {
    expect.assertions(1)
    const mockAuthUser = createMockAuthUser()
    const setAuthCookies = require('src/setAuthCookies').default
    let mockReq
    let mockRes
    await testApiHandler({
      handler: async (req, res) => {
        // Store the req/res to use in the test assertion.
        mockReq = req
        mockRes = res
        await setAuthCookies(req, res)
        return res.status(200).end()
      },
      test: async ({ fetch }) => {
        await fetch({
          headers: {
            authorization: 'some-token-here',
          },
        })
        expect(setCookie).toHaveBeenCalledWith(
          'SomeName.AuthUser',
          mockAuthUser.serialize({ includeToken: false }),
          { req: mockReq, res: mockRes },
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

  it('sets the AuthUserTokens cookie as expected', async () => {
    expect.assertions(1)
    const setAuthCookies = require('src/setAuthCookies').default
    let mockReq
    let mockRes
    await testApiHandler({
      handler: async (req, res) => {
        // Store the req/res to use in the test assertion.
        mockReq = req
        mockRes = res
        await setAuthCookies(req, res)
        return res.status(200).end()
      },
      test: async ({ fetch }) => {
        await fetch({
          headers: {
            authorization: 'some-token-here',
          },
        })
        expect(setCookie).toHaveBeenCalledWith(
          'SomeName.AuthUserTokens',
          JSON.stringify({
            idToken: 'fake-custom-id-token-here',
            refreshToken: 'fake-refresh-token-here',
          }),
          { req: mockReq, res: mockRes },
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

  it('returns the expected values', async () => {
    expect.assertions(1)
    const mockAuthUser = createMockAuthUser()
    const setAuthCookies = require('src/setAuthCookies').default
    await testApiHandler({
      handler: async (req, res) => {
        const response = await setAuthCookies(req, res)
        expect(JSON.stringify(response)).toEqual(
          JSON.stringify({
            idToken: 'fake-custom-id-token-here',
            refreshToken: 'fake-refresh-token-here',
            AuthUser: mockAuthUser,
          })
        )
        return res.status(200).end()
      },
      test: async ({ fetch }) => {
        await fetch({
          headers: {
            authorization: 'some-token-here',
          },
        })
      },
    })
  })
})
