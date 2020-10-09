import { getCustomIdAndRefreshTokens } from 'src/firebaseAdmin'
import { setCookie } from 'src/cookies'
import {
  getAuthUserCookieName,
  getAuthUserTokensCookieName,
} from 'src/authCookies'
import { getMockReq, getMockRes } from 'src/test-utils'

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
    const mockReq = getMockReq()
    const mockRes = getMockRes()
    await setAuthCookies(mockReq, mockRes)
    expect(mockRes.status).toHaveBeenCalledWith(400)
  })

  it('returns a 400 error description if req.headers.authorization is not set', async () => {
    expect.assertions(1)
    const setAuthCookies = require('src/setAuthCookies').default
    const mockReq = getMockReq()
    const mockRes = getMockRes()
    await setAuthCookies(mockReq, mockRes)
    expect(mockRes.json).toHaveBeenCalledWith({
      error: 'Missing Authorization header value',
    })
  })

  it('passes the token from req.headers.authorization to Firebase admin', async () => {
    expect.assertions(1)
    const setAuthCookies = require('src/setAuthCookies').default
    const defaultMockReq = getMockReq()
    const mockReq = {
      ...defaultMockReq,
      headers: {
        authorization: 'some-token-here',
        ...defaultMockReq.headers,
      },
    }
    const mockRes = getMockRes()
    await setAuthCookies(mockReq, mockRes)
    expect(getCustomIdAndRefreshTokens).toHaveBeenCalledWith('some-token-here')
  })

  it('sets the AuthUser cookie as expected', async () => {
    expect.assertions(1)
    const setAuthCookies = require('src/setAuthCookies').default
    const defaultMockReq = getMockReq()
    const mockReq = {
      ...defaultMockReq,
      headers: {
        authorization: 'some-token-here',
        ...defaultMockReq.headers,
      },
    }
    const mockRes = getMockRes()
    await setAuthCookies(mockReq, mockRes)
    expect(setCookie).toHaveBeenCalledWith(
      'SomeName.AuthUser',
      mockAuthUser.serialize(),
      { req: mockReq, res: mockRes }
    )
  })

  it('sets the AuthUserTokens cookie as expected', async () => {
    expect.assertions(1)
    const setAuthCookies = require('src/setAuthCookies').default
    const defaultMockReq = getMockReq()
    const mockReq = {
      ...defaultMockReq,
      headers: {
        authorization: 'some-token-here',
        ...defaultMockReq.headers,
      },
    }
    const mockRes = getMockRes()
    await setAuthCookies(mockReq, mockRes)
    expect(setCookie).toHaveBeenCalledWith(
      'SomeName.AuthUserTokens',
      JSON.stringify({
        idToken: 'fake-custom-id-token-here',
        refreshToken: 'fake-refresh-token-here',
      }),
      { req: mockReq, res: mockRes }
    )
  })

  it('returns the expected values', async () => {
    expect.assertions(1)
    const setAuthCookies = require('src/setAuthCookies').default
    const defaultMockReq = getMockReq()
    const mockReq = {
      ...defaultMockReq,
      headers: {
        authorization: 'some-token-here',
        ...defaultMockReq.headers,
      },
    }
    const mockRes = getMockRes()
    const response = await setAuthCookies(mockReq, mockRes)
    expect(response).toEqual({
      idToken: 'fake-custom-id-token-here',
      refreshToken: 'fake-refresh-token-here',
      AuthUser: mockAuthUser,
    })
  })
})
