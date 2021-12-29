import { setConfig } from 'src/config'
import getMockConfig from 'src/testHelpers/createMockConfig'
import { createMockFirebaseUserAdminSDK } from 'src/testHelpers/authUserInputs'
import createAuthUser from 'src/createAuthUser'
import { getCookie } from 'src/cookies'
import { verifyIdToken } from 'src/firebaseAdmin'
import {
  getAuthUserCookieName,
  getAuthUserTokensCookieName,
} from 'src/authCookies'
import createMockNextContext from 'src/testHelpers/createMockNextContext'
import AuthAction from 'src/AuthAction'

// Note that we don't mock createAuthUser or "src/config".
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

describe('withAuthUserTokenSSR: with ID token', () => {
  it('passes an AuthUserSerialized prop when the user is authenticated', async () => {
    expect.assertions(1)

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

  it('uses the ID token, not the auth info cookie, in the case they are different and "useToken" is true', async () => {
    expect.assertions(1)

    getCookie.mockImplementation((cookieName) => {
      if (cookieName === 'SomeName.AuthUserTokens') {
        return JSON.stringify({
          idToken: 'some-id-token',
          refreshToken: 'some-refresh-token',
        })
      }
      if (cookieName === 'SomeName.AuthUser') {
        return createAuthUser({
          firebaseUserAdminSDK: {
            ...createMockFirebaseUserAdminSDK(),
            email: 'some-different-email@example.com', // differs from token result
          },
        }).serialize()
      }
      return undefined
    })

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
    const func = withAuthUserTokenSSR(undefined, { useToken: true })(
      mockGetSSPFunc
    )
    const props = await func(createMockNextContext())
    expect(props).toEqual({
      props: { AuthUserSerialized: expectedAuthUserProp },
    })
  })

  it('passes an empty serialized AuthUser prop when the user has no auth cookie and auth is *not* required', async () => {
    expect.assertions(1)

    getCookie.mockReturnValue(undefined) // the user has no auth cookies

    const expectedAuthUserProp = createAuthUser().serialize() // empty auth
    const withAuthUserTokenSSR = require('src/withAuthUserTokenSSR').default
    const mockGetSSPFunc = jest.fn()
    const func = withAuthUserTokenSSR()(mockGetSSPFunc)
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
        name: 'MyCookie',
        keys: ['aaa', 'bbb'],
        secure: false,
        signed: true,
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

    getCookie.mockImplementation((cookieName) => {
      if (cookieName === 'SomeName.AuthUserTokens') {
        return JSON.stringify({
          idToken: 'some-id-token-24680',
          refreshToken: 'some-refresh-token-13579',
        })
      }
      if (cookieName === 'SomeName.AuthUser') {
        return createAuthUser({
          firebaseUserAdminSDK: createMockFirebaseUserAdminSDK(),
        }).serialize()
      }
      return undefined
    })

    const withAuthUserTokenSSR = require('src/withAuthUserTokenSSR').default
    const mockGetSSPFunc = jest.fn()
    const func = withAuthUserTokenSSR()(mockGetSSPFunc)
    await func(createMockNextContext())
    expect(verifyIdToken).toHaveBeenCalledWith(
      'some-id-token-24680',
      'some-refresh-token-13579'
    )
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

describe('withAuthUserTokenSSR: *without* ID token', () => {
  it('passes an AuthUserSerialized prop when the user is authenticated', async () => {
    expect.assertions(1)

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
      token: null, // The token should be null.
    }).serialize()
    const withAuthUserTokenSSR = require('src/withAuthUserTokenSSR').default
    const mockGetSSPFunc = jest.fn()
    const func = withAuthUserTokenSSR(undefined, { useToken: false })(
      mockGetSSPFunc
    )
    const props = await func(createMockNextContext())
    expect(props).toEqual({
      props: { AuthUserSerialized: expectedAuthUserProp },
    })
  })

  it('uses the auth info cookie, not the ID token, in the case they are different and "useToken" is false', async () => {
    expect.assertions(1)

    const mockFirebaseAdminUser = createMockFirebaseUserAdminSDK()
    getCookie.mockImplementation((cookieName) => {
      if (cookieName === 'SomeName.AuthUserTokens') {
        return JSON.stringify({
          idToken: 'some-id-token',
          refreshToken: 'some-refresh-token',
        })
      }
      if (cookieName === 'SomeName.AuthUser') {
        return createAuthUser({
          firebaseUserAdminSDK: {
            ...mockFirebaseAdminUser,
            email: 'some-different-email@example.com', // differs from token result
          },
        }).serialize()
      }
      return undefined
    })

    // Mock the Firebase admin user verification.
    verifyIdToken.mockResolvedValue(
      createAuthUser({
        token: 'a-user-identity-token-abc',
        firebaseUserAdminSDK: mockFirebaseAdminUser,
      })
    )

    const expectedAuthUserProp = {
      ...createAuthUser({
        firebaseUserAdminSDK: {
          ...mockFirebaseAdminUser,
          email: 'some-different-email@example.com',
        },
        token: null, // The token should be null.
      }),
    }.serialize()
    const withAuthUserTokenSSR = require('src/withAuthUserTokenSSR').default
    const mockGetSSPFunc = jest.fn()
    const func = withAuthUserTokenSSR(undefined, { useToken: false })(
      mockGetSSPFunc
    )
    const props = await func(createMockNextContext())
    expect(props).toEqual({
      props: { AuthUserSerialized: expectedAuthUserProp },
    })
  })

  it('passes an empty serialized AuthUser prop when the user has no auth cookie and auth is *not* required', async () => {
    expect.assertions(1)

    getCookie.mockReturnValue(undefined) // the user has no auth cookies

    const expectedAuthUserProp = createAuthUser().serialize() // empty auth
    const withAuthUserTokenSSR = require('src/withAuthUserTokenSSR').default
    const mockGetSSPFunc = jest.fn()
    const func = withAuthUserTokenSSR(undefined, { useToken: false })(
      mockGetSSPFunc
    )
    const props = await func(createMockNextContext())
    expect(props).toEqual({
      props: { AuthUserSerialized: expectedAuthUserProp },
    })
  })

  it('passes the expected values to getCookie', async () => {
    expect.assertions(1)

    getAuthUserCookieName.mockReturnValue('MyCookie.AuthUser')
    const mockConfig = getMockConfig()
    setConfig({
      ...mockConfig,
      cookies: {
        ...mockConfig.cookies,
        name: 'MyCookie',
        keys: ['aaa', 'bbb'],
        secure: false,
        signed: true,
      },
    })

    const mockCtx = {
      ...createMockNextContext(),
      req: { some: 'req' },
      res: { some: 'res' },
    }

    const withAuthUserTokenSSR = require('src/withAuthUserTokenSSR').default
    const mockGetSSPFunc = jest.fn()
    const func = withAuthUserTokenSSR(undefined, { useToken: false })(
      mockGetSSPFunc
    )
    await func(mockCtx)
    expect(getCookie).toHaveBeenCalledWith(
      'MyCookie.AuthUser',
      { req: mockCtx.req, res: mockCtx.res },
      { keys: ['aaa', 'bbb'], signed: true, secure: false }
    )
  })

  it('does not call verifyIdToken', async () => {
    expect.assertions(1)

    getCookie.mockImplementation((cookieName) => {
      if (cookieName === 'SomeName.AuthUserTokens') {
        return JSON.stringify({
          idToken: 'some-id-token-24680',
          refreshToken: 'some-refresh-token-13579',
        })
      }
      if (cookieName === 'SomeName.AuthUser') {
        return createAuthUser({
          firebaseUserAdminSDK: createMockFirebaseUserAdminSDK(),
        }).serialize()
      }
      return undefined
    })

    const withAuthUserTokenSSR = require('src/withAuthUserTokenSSR').default
    const mockGetSSPFunc = jest.fn()
    const func = withAuthUserTokenSSR(undefined, { useToken: false })(
      mockGetSSPFunc
    )
    await func(createMockNextContext())
    expect(verifyIdToken).not.toHaveBeenCalled()
  })
})

describe('withAuthUserTokenSSR: redirect and composed prop logic', () => {
  it('redirects to the provided string login URL when the user is not authed and auth *is* required', async () => {
    expect.assertions(1)

    getCookie.mockReturnValue(undefined) // the user has no auth cookies

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
        basePath: true,
      },
    })
  })

  it('redirects to the provided function login URL when the user is not authed and auth *is* required', async () => {
    expect.assertions(1)
    getCookie.mockReturnValue(undefined) // the user has no auth cookies

    const withAuthUserTokenSSR = require('src/withAuthUserTokenSSR').default
    const mockGetSSPFunc = jest.fn()
    const func = withAuthUserTokenSSR({
      whenUnauthed: AuthAction.REDIRECT_TO_LOGIN,
      authPageURL: ({ ctx }) => `/my-login?next=${ctx.pathname}`,
    })(mockGetSSPFunc)
    const props = await func(createMockNextContext())
    expect(props).toEqual({
      redirect: {
        destination: '/my-login?next=/my-path',
        permanent: false,
        basePath: true,
      },
    })
  })

  it('redirects to the provided object login URL when basePath is false, the user is not authed, and auth *is* required', async () => {
    expect.assertions(1)
    getCookie.mockReturnValue(undefined) // the user has no auth cookies

    const withAuthUserTokenSSR = require('src/withAuthUserTokenSSR').default
    const mockGetSSPFunc = jest.fn()
    const func = withAuthUserTokenSSR({
      whenUnauthed: AuthAction.REDIRECT_TO_LOGIN,
      authPageURL: ({ ctx }) => ({
        destination: `/my-login?next=${ctx.pathname}`,
        basePath: false,
      }),
    })(mockGetSSPFunc)
    const props = await func(createMockNextContext())
    expect(props).toEqual({
      redirect: {
        destination: '/my-login?next=/my-path',
        permanent: false,
        basePath: false,
      },
    })
  })

  it('redirects to the provided object login URL when basePath is true, the user is not authed, and auth *is* required', async () => {
    expect.assertions(1)
    getCookie.mockReturnValue(undefined) // the user has no auth cookies

    const withAuthUserTokenSSR = require('src/withAuthUserTokenSSR').default
    const mockGetSSPFunc = jest.fn()
    const func = withAuthUserTokenSSR({
      whenUnauthed: AuthAction.REDIRECT_TO_LOGIN,
      authPageURL: ({ ctx }) => ({
        destination: `/my-login?next=${ctx.pathname}`,
        basePath: true,
      }),
    })(mockGetSSPFunc)
    const props = await func(createMockNextContext())
    expect(props).toEqual({
      redirect: {
        destination: '/my-login?next=/my-path',
        permanent: false,
        basePath: true,
      },
    })
  })

  it("redirects to the config's default login URL when no login URL is provided, the user is not authed, and auth *is* required", async () => {
    expect.assertions(1)

    getCookie.mockReturnValue(undefined) // the user has no auth cookies

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
        basePath: true,
      },
    })
  })

  it('throws if no login URL is provided but we need to redirect to login', async () => {
    expect.assertions(1)

    getCookie.mockReturnValue(undefined) // the user has no auth cookies

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
        'The "authPageURL" must be set to a non-empty string, an object literal containing "destination", or a function that returns either.'
      )
    )
  })

  it('throws if the login URL is a function and does not resolve to a non-empty string but we need to redirect to login', async () => {
    expect.assertions(1)

    getCookie.mockReturnValue(undefined) // the user has no auth cookies

    const mockConfig = getMockConfig()
    setConfig({
      ...mockConfig,
      authPageURL: () => undefined, // no auth page default defined
    })

    const withAuthUserTokenSSR = require('src/withAuthUserTokenSSR').default
    const mockGetSSPFunc = jest.fn()
    const func = withAuthUserTokenSSR({
      whenUnauthed: AuthAction.REDIRECT_TO_LOGIN,
      // no auth page URL defined
    })(mockGetSSPFunc)
    await expect(func(createMockNextContext())).rejects.toEqual(
      new Error(
        'The "authPageURL" must be set to a non-empty string, an object literal containing "destination", or a function that returns either.'
      )
    )
  })

  it('redirects to the provided string app URL when the user is authed and "whenAuthed" is set to AuthAction.REDIRECT_TO_APP', async () => {
    expect.assertions(1)

    // Mock that the user is authed.
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
        basePath: true,
      },
    })
  })

  it('redirects to the provided object app URL when the user is authed and "whenAuthed" is set to AuthAction.REDIRECT_TO_APP', async () => {
    expect.assertions(1)

    // Mock that the user is authed.
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
      appPageURL: {
        destination: '/my-app',
        permanent: false,
        basePath: false,
      },
    })(mockGetSSPFunc)
    const props = await func(createMockNextContext())
    expect(props).toEqual({
      redirect: {
        destination: '/my-app',
        permanent: false,
        basePath: false,
      },
    })
  })

  it('redirects to the provided function app URL when the user is authed and "whenAuthed" is set to AuthAction.REDIRECT_TO_APP', async () => {
    expect.assertions(1)

    // Mock that the user is authed.
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
      appPageURL: ({ ctx }) => `/my-app?next=${ctx.pathname}`,
    })(mockGetSSPFunc)
    const props = await func(createMockNextContext())
    expect(props).toEqual({
      redirect: {
        destination: '/my-app?next=/my-path',
        permanent: false,
        basePath: true,
      },
    })
  })

  it('redirects to the config\'s default app URL when no app URL is provided, the user is authed, and "whenAuthed" is set to AuthAction.REDIRECT_TO_APP', async () => {
    expect.assertions(1)

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
        basePath: true,
      },
    })
  })

  it('throws if no app URL is provided but we need to redirect to the app', async () => {
    expect.assertions(1)

    // Mock that the user is authed.
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
        'The "appPageURL" must be set to a non-empty string, an object literal containing "destination", or a function that returns either.'
      )
    )
  })

  it('throws if the app URL is a function and does not resolve to a non empty-string but we need to redirect to login', async () => {
    // stuff
    expect.assertions(1)

    // Mock that the user is authed.
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
      appPageURL: () => undefined, // no default defined
    })

    const withAuthUserTokenSSR = require('src/withAuthUserTokenSSR').default
    const mockGetSSPFunc = jest.fn()
    const func = withAuthUserTokenSSR({
      whenAuthed: AuthAction.REDIRECT_TO_APP,
      // no app page URL defined
    })(mockGetSSPFunc)
    await expect(func(createMockNextContext())).rejects.toEqual(
      new Error(
        'The "appPageURL" must be set to a non-empty string, an object literal containing "destination", or a function that returns either.'
      )
    )
  })

  it("includes the composed getServerSideProps's props, passing it the context with a defined AuthUser", async () => {
    expect.assertions(1)

    // Mock the auth tokens cookie value.
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
      props: {
        here: ['is', 'a', 'prop'],
        userEmail: ctx.AuthUser.email,
      },
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

  it("includes only the composed getServerSideProps's custom 'redirect' logic", async () => {
    expect.assertions(1)

    // Mock the auth tokens cookie value.
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

    // Mock the Firebase admin user verification.
    const mockFirebaseAdminUser = createMockFirebaseUserAdminSDK()
    verifyIdToken.mockResolvedValue(
      createAuthUser({
        token: 'a-user-identity-token-abc',
        firebaseUserAdminSDK: mockFirebaseAdminUser,
      })
    )

    const withAuthUserTokenSSR = require('src/withAuthUserTokenSSR').default
    const mockGetSSPFunc = jest.fn(() => ({
      redirect: {
        destination: '/some-custom-redirect',
        permanent: false,
      },
    }))
    const func = withAuthUserTokenSSR()(mockGetSSPFunc)
    const props = await func(createMockNextContext())
    expect(props).toEqual({
      redirect: {
        destination: '/some-custom-redirect',
        permanent: false,
      },
    })
  })

  it("includes only the composed getServerSideProps's custom 'notFound' logic", async () => {
    expect.assertions(1)

    // Mock the auth tokens cookie value.
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

    // Mock the Firebase admin user verification.
    const mockFirebaseAdminUser = createMockFirebaseUserAdminSDK()
    verifyIdToken.mockResolvedValue(
      createAuthUser({
        token: 'a-user-identity-token-abc',
        firebaseUserAdminSDK: mockFirebaseAdminUser,
      })
    )

    const withAuthUserTokenSSR = require('src/withAuthUserTokenSSR').default
    const mockGetSSPFunc = jest.fn(() => ({ notFound: true }))
    const func = withAuthUserTokenSSR()(mockGetSSPFunc)
    const props = await func(createMockNextContext())
    expect(props).toEqual({ notFound: true })
  })
})
