import { setConfig } from 'src/config'
import getMockConfig from 'src/testHelpers/createMockConfig'
import { createMockFirebaseUserAdminSDK } from 'src/testHelpers/authUserInputs'
import createAuthUser from 'src/createAuthUser'
import { getCookie } from 'src/cookies'
import { verifyIdToken } from 'src/firebaseAdmin'
import { getAuthUserTokensCookieName } from 'src/authCookies'
import createMockNextContext from 'src/testHelpers/createMockNextContext'

// Note that we don't mock createAuthUser or "src/config".
jest.mock('src/cookies')
jest.mock('src/firebaseAdmin')
jest.mock('src/authCookies')
jest.mock('src/isClientSide')

beforeEach(() => {
  // This is always calaled server-side.
  const isClientSide = require('src/isClientSide').default
  isClientSide.mockReturnValue(false)

  getAuthUserTokensCookieName.mockReturnValue('SomeName.AuthUserTokens')

  const mockConfig = getMockConfig()
  setConfig({
    ...mockConfig,
  })
})

afterEach(() => {
  jest.clearAllMocks()
})

describe('withAuthUserTokenSSR', () => {
  it('passes an AuthUserSerialized prop when the user is authenticated', async () => {
    expect.assertions(1)

    // Mock the auth tokens cookie value.
    getCookie.mockReturnValue(
      JSON.stringify({
        idToken: 'some-id-token',
        refreshToken: 'some-refresh-token',
      })
    )

    // Mock the Firebase admin user verification.
    const mockFirebaseAdminUser = createMockFirebaseUserAdminSDK()
    verifyIdToken.mockResolvedValue({
      token: 'a-user-identity-token-abc',
      user: mockFirebaseAdminUser,
    })

    const expectedAuthUserProp = createAuthUser({
      firebaseUserAdminSDK: mockFirebaseAdminUser,
      token: 'a-user-identity-token-abc',
    }).serialize()
    const withAuthUserTokenSSR = require('src/withAuthUserTokenSSR').default
    const mockGetSSPFunc = jest.fn()
    const func = withAuthUserTokenSSR({ authRequired: false })(mockGetSSPFunc)
    const props = await func(createMockNextContext())
    expect(props).toEqual({
      props: { AuthUserSerialized: expectedAuthUserProp },
    })
  })

  it('passes an empty serialized AuthUser prop when the user has no auth cookie and auth is *not* required', async () => {
    expect.assertions(1)

    getCookie.mockReturnValue(undefined) // the user has no auth cookie

    const expectedAuthUserProp = createAuthUser().serialize() // empty auth
    const withAuthUserTokenSSR = require('src/withAuthUserTokenSSR').default
    const mockGetSSPFunc = jest.fn()
    const func = withAuthUserTokenSSR({ authRequired: false })(mockGetSSPFunc)
    const props = await func(createMockNextContext())
    expect(props).toEqual({
      props: { AuthUserSerialized: expectedAuthUserProp },
    })
  })

  it('passes the expected values to getCookie', async () => {
    expect.assertions(1)

    getAuthUserTokensCookieName.mockReturnValue('MyCookie.AuthUserTokens')
    const mockConfig = getMockConfig()
    setConfig({
      ...mockConfig,
      cookies: {
        ...mockConfig.cookies,
        cookieName: 'MyCookie',
        keys: ['aaa', 'bbb'],
        cookieOptions: {
          secure: false,
          signed: true,
        },
      },
    })

    const mockCtx = {
      ...createMockNextContext(),
      req: { some: 'req' },
      res: { some: 'res' },
    }

    const withAuthUserTokenSSR = require('src/withAuthUserTokenSSR').default
    const mockGetSSPFunc = jest.fn()
    const func = withAuthUserTokenSSR({ authRequired: false })(mockGetSSPFunc)
    await func(mockCtx)
    expect(getCookie).toHaveBeenCalledWith(
      'MyCookie.AuthUserTokens',
      { req: mockCtx.req, res: mockCtx.res },
      { keys: ['aaa', 'bbb'], signed: true, secure: false }
    )
  })

  it('passes the idToken and refreshToken from the auth cookie to verifyIdToken', async () => {
    expect.assertions(1)
    getCookie.mockReturnValue(
      JSON.stringify({
        idToken: 'some-id-token-24680',
        refreshToken: 'some-refresh-token-13579',
      })
    )
    const withAuthUserTokenSSR = require('src/withAuthUserTokenSSR').default
    const mockGetSSPFunc = jest.fn()
    const func = withAuthUserTokenSSR({ authRequired: false })(mockGetSSPFunc)
    await func(createMockNextContext())
    expect(verifyIdToken).toHaveBeenCalledWith(
      'some-id-token-24680',
      'some-refresh-token-13579'
    )
  })
})
