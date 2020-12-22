import { setConfig } from 'src/config'
import getMockConfig from 'src/testHelpers/createMockConfig'
import { createMockFirebaseUserAdminSDK } from 'src/testHelpers/authUserInputs'
import createAuthUser from 'src/createAuthUser'
import { getCookie } from 'src/cookies'
import { verifyIdToken } from 'src/firebaseAdmin'
import { getAuthUserTokensCookieName } from 'src/authCookies'
import createMockNextContext from 'src/testHelpers/createMockNextContext'
import AuthAction from 'src/AuthAction'

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
    verifyIdToken.mockResolvedValue(
      createAuthUser({
        token: 'a-user-identity-token-abc',
        firebaseUserAdminSDK: mockFirebaseAdminUser,
      })
    )

    const expectedAuthUserProp = createAuthUser({
      firebaseUserAdminSDK: mockFirebaseAdminUser,
      token: 'a-user-identity-token-abc',
    }).serialize()
    const withAuthUserTokenSSR = require('src/withAuthUserTokenSSR').default
    const mockGetSSPFunc = jest.fn()
    const func = withAuthUserTokenSSR()(mockGetSSPFunc)
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
    const func = withAuthUserTokenSSR()(mockGetSSPFunc)
    const props = await func(createMockNextContext())
    expect(props).toEqual({
      props: { AuthUserSerialized: expectedAuthUserProp },
    })
  })

  it('redirects to the provided login URL when the user is not authed and auth *is* required', async () => {
    expect.assertions(1)

    getCookie.mockReturnValue(undefined) // the user has no auth cookie

    const withAuthUserTokenSSR = require('src/withAuthUserTokenSSR').default
    const mockGetSSPFunc = jest.fn()
    const func = withAuthUserTokenSSR({
      whenUnauthed: AuthAction.REDIRECT_TO_LOGIN,
      authPageURL: '/my-login',
    })(mockGetSSPFunc)
    const props = await func(createMockNextContext())
    expect(props).toEqual({
      redirect: {
        destination: '/my-login',
        permanent: false,
      },
    })
  })

  it("redirects to the config's default login URL when no login URL is provided, the user is not authed, and auth *is* required", async () => {
    expect.assertions(1)

    getCookie.mockReturnValue(undefined) // the user has no auth cookie

    const mockConfig = getMockConfig()
    setConfig({
      ...mockConfig,
      authPageURL: '/log-in-here',
    })

    const withAuthUserTokenSSR = require('src/withAuthUserTokenSSR').default
    const mockGetSSPFunc = jest.fn()
    const func = withAuthUserTokenSSR({
      whenUnauthed: AuthAction.REDIRECT_TO_LOGIN,
      // no auth page URL defined
    })(mockGetSSPFunc)
    const props = await func(createMockNextContext())
    expect(props).toEqual({
      redirect: {
        destination: '/log-in-here',
        permanent: false,
      },
    })
  })

  it('throws if no login URL is provided but we need to redirect to login', async () => {
    expect.assertions(1)

    getCookie.mockReturnValue(undefined) // the user has no auth cookie

    const mockConfig = getMockConfig()
    setConfig({
      ...mockConfig,
      authPageURL: undefined, // no auth page default defined
    })

    const withAuthUserTokenSSR = require('src/withAuthUserTokenSSR').default
    const mockGetSSPFunc = jest.fn()
    const func = withAuthUserTokenSSR({
      whenUnauthed: AuthAction.REDIRECT_TO_LOGIN,
      // no auth page URL defined
    })(mockGetSSPFunc)
    await expect(func(createMockNextContext())).rejects.toEqual(
      new Error(
        'When "whenUnauthed" is set to AuthAction.REDIRECT_TO_LOGIN, "authPageURL" must be set.'
      )
    )
  })

  it('redirects to the provided app URL when the user is authed and "whenAuthed" is set to AuthAction.REDIRECT_TO_APP', async () => {
    expect.assertions(1)

    // Mock that the user is authed.
    getCookie.mockReturnValue(
      JSON.stringify({
        idToken: 'some-id-token',
        refreshToken: 'some-refresh-token',
      })
    )
    const mockFirebaseAdminUser = createMockFirebaseUserAdminSDK()
    verifyIdToken.mockResolvedValue(
      createAuthUser({
        token: 'a-user-identity-token-abc',
        firebaseUserAdminSDK: mockFirebaseAdminUser,
      })
    )

    const withAuthUserTokenSSR = require('src/withAuthUserTokenSSR').default
    const mockGetSSPFunc = jest.fn()
    const func = withAuthUserTokenSSR({
      whenAuthed: AuthAction.REDIRECT_TO_APP,
      appPageURL: '/my-app',
    })(mockGetSSPFunc)
    const props = await func(createMockNextContext())
    expect(props).toEqual({
      redirect: {
        destination: '/my-app',
        permanent: false,
      },
    })
  })

  it('redirects to the config\'s default app URL when no app URL is provided, the user is authed, and "whenAuthed" is set to AuthAction.REDIRECT_TO_APP', async () => {
    expect.assertions(1)

    // Mock that the user is authed.
    getCookie.mockReturnValue(
      JSON.stringify({
        idToken: 'some-id-token',
        refreshToken: 'some-refresh-token',
      })
    )
    const mockFirebaseAdminUser = createMockFirebaseUserAdminSDK()
    verifyIdToken.mockResolvedValue(
      createAuthUser({
        token: 'a-user-identity-token-abc',
        firebaseUserAdminSDK: mockFirebaseAdminUser,
      })
    )

    const mockConfig = getMockConfig()
    setConfig({
      ...mockConfig,
      appPageURL: '/default-app-homepage',
    })

    const withAuthUserTokenSSR = require('src/withAuthUserTokenSSR').default
    const mockGetSSPFunc = jest.fn()
    const func = withAuthUserTokenSSR({
      whenAuthed: AuthAction.REDIRECT_TO_APP,
      // no app page URL defined
    })(mockGetSSPFunc)
    const props = await func(createMockNextContext())
    expect(props).toEqual({
      redirect: {
        destination: '/default-app-homepage',
        permanent: false,
      },
    })
  })

  it('throws if no app URL is provided but we need to redirect to the app', async () => {
    expect.assertions(1)

    // Mock that the user is authed.
    getCookie.mockReturnValue(
      JSON.stringify({
        idToken: 'some-id-token',
        refreshToken: 'some-refresh-token',
      })
    )
    const mockFirebaseAdminUser = createMockFirebaseUserAdminSDK()
    verifyIdToken.mockResolvedValue(
      createAuthUser({
        token: 'a-user-identity-token-abc',
        firebaseUserAdminSDK: mockFirebaseAdminUser,
      })
    )

    const mockConfig = getMockConfig()
    setConfig({
      ...mockConfig,
      appPageURL: undefined, // no default defined
    })

    const withAuthUserTokenSSR = require('src/withAuthUserTokenSSR').default
    const mockGetSSPFunc = jest.fn()
    const func = withAuthUserTokenSSR({
      whenAuthed: AuthAction.REDIRECT_TO_APP,
      // no app page URL defined
    })(mockGetSSPFunc)
    await expect(func(createMockNextContext())).rejects.toEqual(
      new Error(
        'When "whenAuthed" is set to AuthAction.REDIRECT_TO_APP, "appPageURL" must be set.'
      )
    )
  })

  it('passes the expected values to getCookie', async () => {
    expect.assertions(1)

    getAuthUserTokensCookieName.mockReturnValue('MyCookie.AuthUserTokens')
    const mockConfig = getMockConfig()
    setConfig({
      ...mockConfig,
      cookies: {
        ...mockConfig.cookies,
        name: 'MyCookie',
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
    const func = withAuthUserTokenSSR()(mockGetSSPFunc)
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
    const func = withAuthUserTokenSSR()(mockGetSSPFunc)
    await func(createMockNextContext())
    expect(verifyIdToken).toHaveBeenCalledWith(
      'some-id-token-24680',
      'some-refresh-token-13579'
    )
  })

  it("includes the composed getServerSideProps's props, passing it the context with a defined AuthUser", async () => {
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
    verifyIdToken.mockResolvedValue(
      createAuthUser({
        token: 'a-user-identity-token-abc',
        firebaseUserAdminSDK: mockFirebaseAdminUser,
      })
    )

    const expectedAuthUserProp = createAuthUser({
      firebaseUserAdminSDK: mockFirebaseAdminUser,
      token: 'a-user-identity-token-abc',
    }).serialize()
    const withAuthUserTokenSSR = require('src/withAuthUserTokenSSR').default
    const mockGetSSPFunc = jest.fn((ctx) => ({
      here: ['is', 'a', 'prop'],
      userEmail: ctx.AuthUser.email,
    }))
    const func = withAuthUserTokenSSR()(mockGetSSPFunc)
    const props = await func(createMockNextContext())
    expect(props).toEqual({
      props: {
        AuthUserSerialized: expectedAuthUserProp,
        here: ['is', 'a', 'prop'],
        userEmail: 'def@example.com', // from createMockFirebaseUserAdminSDK
      },
    })
  })

  it('throws if verifyIdToken throws', async () => {
    expect.assertions(1)
    const mockErr = new Error('Invalid thing.')
    verifyIdToken.mockImplementationOnce(() => Promise.reject(mockErr))
    const withAuthUserTokenSSR = require('src/withAuthUserTokenSSR').default
    const mockGetSSPFunc = jest.fn()
    const func = withAuthUserTokenSSR()(mockGetSSPFunc)
    await expect(func(createMockNextContext())).rejects.toEqual(mockErr)
  })
})
