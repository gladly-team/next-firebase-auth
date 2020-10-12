import { setConfig } from 'src/config'
import getMockConfig from 'src/testHelpers/getMockConfig'

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

describe('authCookies', () => {
  it('returns the expected AuthUser cookie name', () => {
    expect.assertions(1)
    const { getAuthUserCookieName } = require('src/authCookies')
    expect(getAuthUserCookieName()).toEqual('myNeatApp.AuthUser')
  })

  it('returns the expected AuthUserTokens cookie name', () => {
    expect.assertions(1)
    const { getAuthUserTokensCookieName } = require('src/authCookies')
    expect(getAuthUserTokensCookieName()).toEqual('myNeatApp.AuthUserTokens')
  })
})
