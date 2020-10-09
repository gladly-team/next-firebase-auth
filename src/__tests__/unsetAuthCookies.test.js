import {
  getAuthUserCookieName,
  getAuthUserTokensCookieName,
} from 'src/authCookies'
import { setCookie } from 'src/cookies'
import { getMockReq, getMockRes } from 'src/test-utils'

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
  it('calls setCookie with an undefined value for the AuthUser cookie', () => {
    expect.assertions(1)
    const unsetAuthCookies = require('src/unsetAuthCookies').default
    const mockReq = getMockReq()
    const mockRes = getMockRes()
    unsetAuthCookies(mockReq, mockRes)
    expect(setCookie).toHaveBeenCalledWith('SomeName.AuthUser', undefined, {
      req: mockReq,
      res: mockRes,
    })
  })

  it('calls setCookie with an undefined value for the AuthUserTokens cookie', () => {
    expect.assertions(1)
    const unsetAuthCookies = require('src/unsetAuthCookies').default
    const mockReq = getMockReq()
    const mockRes = getMockRes()
    unsetAuthCookies(mockReq, mockRes)
    expect(setCookie).toHaveBeenCalledWith(
      'SomeName.AuthUserTokens',
      undefined,
      {
        req: mockReq,
        res: mockRes,
      }
    )
  })
})
