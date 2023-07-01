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
import logDebug from 'src/logDebug'
import createAuthUser from 'src/createAuthUser'
import { NextApiRequest, NextApiResponse } from 'next'

jest.mock('src/config')
jest.mock('src/firebaseAdmin')
jest.mock('src/authCookies')
jest.mock('src/cookies')
jest.mock('src/logDebug')

const mockSetConfig = jest.mocked(setConfig)
const mockGetCustomIdAndRefreshTokens = getCustomIdAndRefreshTokens as jest.Mock
const mockGetAuthUserCookieName = jest.mocked(getAuthUserCookieName)
const mockGetAuthUserTokensCookieName = jest.mocked(getAuthUserTokensCookieName)
const mockSetCookie = jest.mocked(setCookie)
const mockLogDebug = jest.mocked(logDebug)

beforeEach(() => {
  const mockAuthUser = createMockAuthUser()
  mockGetAuthUserCookieName.mockReturnValue('SomeName.AuthUser')
  mockGetAuthUserTokensCookieName.mockReturnValue('SomeName.AuthUserTokens')
  mockGetCustomIdAndRefreshTokens.mockResolvedValue({
    idToken: 'fake-custom-id-token-here',
    refreshToken: 'fake-refresh-token-here',
    AuthUser: mockAuthUser,
  })

  const mockConfig = createMockConfig()
  mockSetConfig({
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
        expect(mockGetCustomIdAndRefreshTokens).toHaveBeenCalledWith(
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
        expect(mockGetCustomIdAndRefreshTokens).toHaveBeenCalledWith(
          'a-cool-token'
        )
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
        expect(mockGetCustomIdAndRefreshTokens).toHaveBeenCalledWith(
          'another-token-here'
        )
      },
    })
  })

  it('sets the AuthUser cookie as expected', async () => {
    expect.assertions(1)
    const mockAuthUser = createMockAuthUser()
    const setAuthCookies = require('src/setAuthCookies').default
    let mockReq: NextApiRequest
    let mockRes: NextApiResponse
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
        expect(mockSetCookie).toHaveBeenCalledWith(
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
    let mockReq: NextApiRequest
    let mockRes: NextApiResponse
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
        expect(mockSetCookie).toHaveBeenCalledWith(
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

  it('returns the expected values when getCustomIdAndRefreshTokens throws', async () => {
    expect.assertions(1)
    const setAuthCookies = require('src/setAuthCookies').default
    mockGetCustomIdAndRefreshTokens.mockRejectedValue(
      new Error(
        '[setAuthCookies] Failed to verify the ID token. Cannot authenticate the user or get a refresh token.'
      )
    )
    await testApiHandler({
      handler: async (req, res) => {
        const response = await setAuthCookies(req, res)
        expect(JSON.stringify(response)).toEqual(
          JSON.stringify({
            idToken: null,
            refreshToken: null,
            AuthUser: createAuthUser(), // unauthed user
          })
        )
        return res.status(200).end()
      },
      test: async ({ fetch }) => {
        mockLogDebug.mockClear()
        await fetch({
          headers: {
            authorization: 'some-token-here',
          },
        })
      },
    })
  })

  it('logs expected debug logs when the user is authenticated', async () => {
    expect.assertions(3)
    const setAuthCookies = require('src/setAuthCookies').default
    await testApiHandler({
      handler: async (req, res) => {
        await setAuthCookies(req, res)
        return res.status(200).end()
      },
      test: async ({ fetch }) => {
        mockLogDebug.mockClear()
        await fetch({
          headers: {
            authorization: 'some-token-here',
          },
        })
        expect(mockLogDebug).toHaveBeenCalledWith(
          '[setAuthCookies] Attempting to set auth cookies.'
        )
        expect(mockLogDebug).toHaveBeenCalledWith(
          '[setAuthCookies] Set auth cookies for an authenticated user.'
        )
        expect(mockLogDebug).toHaveBeenCalledTimes(2)
      },
    })
  })

  it('logs expected debug logs when the user is not authenticated', async () => {
    expect.assertions(3)
    const setAuthCookies = require('src/setAuthCookies').default

    mockGetCustomIdAndRefreshTokens.mockResolvedValue({
      idToken: null,
      refreshToken: null,
      AuthUser: createAuthUser(), // unauthenticated
    })
    await testApiHandler({
      handler: async (req, res) => {
        await setAuthCookies(req, res)
        return res.status(200).end()
      },
      test: async ({ fetch }) => {
        mockLogDebug.mockClear()
        await fetch({
          headers: {
            authorization: 'some-token-here',
          },
        })
        expect(mockLogDebug).toHaveBeenCalledWith(
          '[setAuthCookies] Attempting to set auth cookies.'
        )
        expect(mockLogDebug).toHaveBeenCalledWith(
          '[setAuthCookies] Set auth cookies. The user is not authenticated.'
        )
        expect(mockLogDebug).toHaveBeenCalledTimes(2)
      },
    })
  })

  it('logs expected debug logs when getCustomIdAndRefreshTokens throws', async () => {
    expect.assertions(4)
    const setAuthCookies = require('src/setAuthCookies').default
    mockGetCustomIdAndRefreshTokens.mockRejectedValue(
      new Error('Failed to verify the ID token.')
    )
    await testApiHandler({
      handler: async (req, res) => {
        await setAuthCookies(req, res)
        return res.status(200).end()
      },
      test: async ({ fetch }) => {
        mockLogDebug.mockClear()
        await fetch({
          headers: {
            authorization: 'some-token-here',
          },
        })
        expect(mockLogDebug).toHaveBeenCalledWith(
          '[setAuthCookies] Attempting to set auth cookies.'
        )
        expect(mockLogDebug).toHaveBeenCalledWith(
          '[setAuthCookies] Failed to verify the ID token. Cannot authenticate the user or get a refresh token.'
        )
        expect(mockLogDebug).toHaveBeenCalledWith(
          '[setAuthCookies] Set auth cookies. The user is not authenticated.'
        )
        expect(mockLogDebug).toHaveBeenCalledTimes(3)
      },
    })
  })
})
