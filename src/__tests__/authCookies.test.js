import { setConfig } from 'src/config'
import createMockConfig from 'src/testHelpers/createMockConfig'

jest.mock('src/config')

beforeEach(() => {
  const mockConfig = createMockConfig()
  setConfig({
    ...mockConfig,
    cookies: {
      ...mockConfig.cookies,
      name: 'myNeatApp',
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
