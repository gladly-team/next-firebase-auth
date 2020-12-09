import { testApiHandler } from 'next-test-api-route-handler'
import { getCustomIdAndRefreshTokens } from 'src/firebaseAdmin'
import { setCookie } from 'src/cookies'
import {
  getAuthUserCookieName,
  getAuthUserTokensCookieName,
} from 'src/authCookies'

jest.mock('src/firebaseAdmin')
jest.mock('src/authCookies')
jest.mock('src/cookies')

const mockAuthUser = {
  id: 'abc-123',
  email: 'fakeUser@example.com',
  emailVerified: true,
  getIdToken: async () => 'fake-custom-id-token-here',
  clientInitialized: false,
  serialize: () => ({
    id: 'abc-123',
    email: 'fakeUser@example.com',
    emailVerified: true,
    clientInitialized: false,
    _token: 'fake-custom-id-token-here',
  }),
}

beforeEach(() => {
  getAuthUserCookieName.mockReturnValue('SomeName.AuthUser')
  getAuthUserTokensCookieName.mockReturnValue('SomeName.AuthUserTokens')
  getCustomIdAndRefreshTokens.mockResolvedValue({
    idToken: 'fake-custom-id-token-here',
    refreshToken: 'fake-refresh-token-here',
    AuthUser: mockAuthUser,
  })
})

afterEach(() => {
  jest.clearAllMocks()
})

describe('setAuthCookies', () => {
  it('returns a 400 if req.headers.authorization is not set', async () => {
    expect.assertions(1)
    const setAuthCookies = require('src/setAuthCookies').default
    await testApiHandler({
      handler: async (req, res) => {
        // TODO: expect setAuthCookies to throw
        await setAuthCookies(req, res)
        return res.status(200).end()
      },
      test: async ({ fetch }) => {
        const response = await fetch() // no Authorization header
        expect(response.status).toEqual(400)
      },
    })
  })

  it('passes the token from req.headers.authorization to Firebase admin', async () => {
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

  it('sets the AuthUser cookie as expected', async () => {
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
          'SomeName.AuthUser',
          mockAuthUser.serialize(),
          { req: mockReq, res: mockRes },
          expect.any(Object) // TODO: test that we use config values
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
          expect.any(Object) // TODO: test that we use config values
        )
      },
    })
  })

  it('returns the expected values', async () => {
    expect.assertions(1)
    const setAuthCookies = require('src/setAuthCookies').default
    await testApiHandler({
      handler: async (req, res) => {
        const response = await setAuthCookies(req, res)
        expect(response).toEqual({
          idToken: 'fake-custom-id-token-here',
          refreshToken: 'fake-refresh-token-here',
          AuthUser: mockAuthUser,
        })
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
