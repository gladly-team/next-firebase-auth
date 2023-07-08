import { setConfig } from 'src/config'
import { ConfigInput } from 'src/configTypes'
import createMockConfig from 'src/testHelpers/createMockConfig'

jest.mock('src/config')

beforeEach(() => {
  const mockConfig = createMockConfig() as ConfigInput
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
    const { getUserCookieName } = require('src/authCookies')
    expect(getUserCookieName()).toEqual('myNeatApp.AuthUser')
  })

  it('returns the expected AuthUserTokens cookie name', () => {
    expect.assertions(1)
    const { getUserTokensCookieName } = require('src/authCookies')
    expect(getUserTokensCookieName()).toEqual('myNeatApp.AuthUserTokens')
  })

  it('returns the expected AuthUser signature cookie name', () => {
    expect.assertions(1)
    const { getUserSigCookieName } = require('src/authCookies')
    expect(getUserSigCookieName()).toEqual('myNeatApp.AuthUser.sig')
  })

  it('returns the expected AuthUserTokens signature cookie name', () => {
    expect.assertions(1)
    const { getUserTokensSigCookieName } = require('src/authCookies')
    expect(getUserTokensSigCookieName()).toEqual(
      'myNeatApp.AuthUserTokens.sig'
    )
  })
})
