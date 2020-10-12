// import Cookies from 'cookies'
import { setConfig } from 'src/config'

import getMockConfig from 'src/testHelpers/getMockConfig'
import getMockReq from 'src/testHelpers/getMockReq'
import getMockRes from 'src/testHelpers/getMockRes'
import { encodeBase64 } from 'src/encoding'

// jest.mock('cookies')
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
  it('returns the expected cookie value', () => {
    expect.assertions(1)
    const mockReqDefault = getMockReq()
    const mockReq = {
      ...mockReqDefault,
      headers: {
        ...mockReqDefault.headers,
        cookie: `myStuff="${encodeBase64(
          JSON.stringify({
            my: ['data', 'here'],
          })
        )}";`,
      },
    }
    const mockRes = getMockRes()
    const { getCookie } = require('src/cookies')
    expect(
      JSON.parse(getCookie('myStuff', { req: mockReq, res: mockRes }))
    ).toEqual({
      my: ['data', 'here'],
    })
  })
})
