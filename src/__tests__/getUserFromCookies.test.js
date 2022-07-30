import getUserFromCookies from 'src/getUserFromCookies'
import { setConfig } from 'src/config'
import getMockConfig from 'src/testHelpers/createMockConfig'
import { createMockFirebaseUserAdminSDK } from 'src/testHelpers/authUserInputs'
import createAuthUser from 'src/createAuthUser'
import { getCookie } from 'src/cookies'
// import { verifyIdToken } from 'src/firebaseAdmin'
import {
  getAuthUserCookieName,
  getAuthUserTokensCookieName,
} from 'src/authCookies'
// import createMockNextContext from 'src/testHelpers/createMockNextContext'
// import AuthAction from 'src/AuthAction'

jest.mock('src/cookies')
jest.mock('src/firebaseAdmin')
jest.mock('src/authCookies')
jest.mock('src/isClientSide')

/**
 * We intentionally don't mock a few modules whose behavior we want to
 * test:
 * - createAuthUser
 * - src/config
 * - getUserFromCookies
 */
jest.mock('src/cookies')
jest.mock('src/firebaseAdmin')
jest.mock('src/authCookies')
jest.mock('src/isClientSide')

beforeEach(() => {
  // This is always called server-side.
  const isClientSide = require('src/isClientSide').default
  isClientSide.mockReturnValue(false)

  getAuthUserCookieName.mockReturnValue('SomeName.AuthUser')
  getAuthUserTokensCookieName.mockReturnValue('SomeName.AuthUserTokens')

  // Default to an authed user.
  getCookie.mockImplementation((cookieName) => {
    if (cookieName === 'SomeName.AuthUserTokens') {
      return JSON.stringify({
        idToken: 'some-id-token',
        refreshToken: 'some-refresh-token',
      })
    }
    if (cookieName === 'SomeName.AuthUser') {
      return createAuthUser({
        firebaseUserAdminSDK: createMockFirebaseUserAdminSDK(),
      }).serialize()
    }
    return undefined
  })

  const mockConfig = getMockConfig()
  setConfig({
    ...mockConfig,
  })
})

afterEach(() => {
  jest.clearAllMocks()
})

describe('getUserFromCookies', () => {
  // TODO
  it('returns the expected user from a request object', async () => {
    expect.assertions(1)
    const req = {} // TODO
    const user = await getUserFromCookies({ req })
    expect(user).toBeUndefined()
  })
})
