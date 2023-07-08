import { getUserCookieName, getUserTokensCookieName } from 'src/authCookies'
import { deleteCookie } from 'src/cookies'
import { testApiHandler } from 'next-test-api-route-handler'
import { setConfig } from 'src/config'
import createMockConfig from 'src/testHelpers/createMockConfig'
import logDebug from 'src/logDebug'
import { NextApiRequest, NextApiResponse } from 'next'

jest.mock('src/config')
jest.mock('src/authCookies')
jest.mock('src/cookies')
jest.mock('src/logDebug')

const mockSetConfig = jest.mocked(setConfig)
const mockGetUserCookieName = jest.mocked(getUserCookieName)
const mockGetUserTokensCookieName = jest.mocked(getUserTokensCookieName)
const mockDeleteCookie = jest.mocked(deleteCookie)
const mockLogDebug = jest.mocked(logDebug)

beforeEach(() => {
  mockGetUserCookieName.mockReturnValue('SomeName.AuthUser')
  mockGetUserTokensCookieName.mockReturnValue('SomeName.AuthUserTokens')

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

describe('unsetAuthCookies', () => {
  it('calls deleteCookie for the AuthUser cookie', async () => {
    expect.assertions(1)
    const unsetAuthCookies = require('src/unsetAuthCookies').default
    let mockReq: NextApiRequest
    let mockRes: NextApiResponse
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
        expect(mockDeleteCookie).toHaveBeenCalledWith(
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
    let mockReq: NextApiRequest
    let mockRes: NextApiResponse
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
        expect(mockDeleteCookie).toHaveBeenCalledWith(
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

  it('logs expected debug logs', async () => {
    expect.assertions(1)
    const unsetAuthCookies = require('src/unsetAuthCookies').default
    await testApiHandler({
      handler: async (req, res) => {
        unsetAuthCookies(req, res)
        return res.status(200).end()
      },
      test: async ({ fetch }) => {
        await fetch()
        expect(mockLogDebug).toHaveBeenCalledWith(
          '[unsetAuthCookies] Unset auth cookies.'
        )
      },
    })
  })
})
