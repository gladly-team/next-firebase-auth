// import { getCustomIdAndRefreshTokens } from 'src/firebaseAdmin'
// import { setCookie } from 'src/cookies'
import {
  getAuthUserCookieName,
  getAuthUserTokensCookieName,
} from 'src/authCookies'
import { getMockReq, getMockRes } from 'src/test-utils'

jest.mock('src/firebaseAdmin')
jest.mock('src/authCookies')
jest.mock('src/cookies')

beforeEach(() => {
  getAuthUserCookieName.mockReturnValue('SomeName.AuthUser')
  getAuthUserTokensCookieName.mockReturnValue('SomeName.AuthUserTokens')
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
})
