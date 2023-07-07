import { GetServerSidePropsContext } from 'next'
import { setConfig } from 'src/config'
import getMockConfig from 'src/testHelpers/createMockConfig'
import { createMockFirebaseUserAdminSDK } from 'src/testHelpers/authUserInputs'
import createAuthUser from 'src/createAuthUser'
import createMockNextContext from 'src/testHelpers/createMockNextContext'
import { AuthAction } from 'src/AuthAction'
import getUserFromCookies from 'src/getUserFromCookies'
import logDebug from 'src/logDebug'
import { ConfigInput } from 'src/configTypes'
import { PageURL } from 'src/redirectTypes'

/**
 * We intentionally don't mock a few modules whose behavior we want to
 * test:
 * - src/config
 * - src/redirects
 */
jest.mock('src/cookies')
jest.mock('src/getUserFromCookies')
jest.mock('src/logDebug')

const mockGetUserFromCookies = jest.mocked(getUserFromCookies)
const mockLogDebug = jest.mocked(logDebug)

beforeEach(() => {
  // Default to an unauthed user.
  mockGetUserFromCookies.mockResolvedValue(createAuthUser())
})

afterEach(() => {
  jest.clearAllMocks()
})

describe('withAuthUserTokenSSR: authed user cookies and prop', () => {
  it('calls getUserFromCookies with the request object and a default of includeToken=true', async () => {
    expect.assertions(1)

    // Mock the authenticated user.
    const mockFirebaseAdminUser = createMockFirebaseUserAdminSDK()
    const user = createAuthUser({
      token: 'a-user-identity-token-abc',
      firebaseUserAdminSDK: mockFirebaseAdminUser,
    })
    mockGetUserFromCookies.mockResolvedValue(user)

    const withAuthUserTokenSSR = require('src/withAuthUserTokenSSR').default
    const mockGetSSPFunc = jest.fn()
    const func = withAuthUserTokenSSR()(mockGetSSPFunc)
    const ctx = createMockNextContext()
    await func(ctx)
    expect(mockGetUserFromCookies).toHaveBeenCalledWith({
      req: ctx.req,
      includeToken: true,
    })
  })

  it('calls getUserFromCookies with includeToken=true when useToken is false', async () => {
    expect.assertions(1)

    // Mock the authenticated user.
    const mockFirebaseAdminUser = createMockFirebaseUserAdminSDK()
    const user = createAuthUser({
      token: 'a-user-identity-token-abc',
      firebaseUserAdminSDK: mockFirebaseAdminUser,
    })
    mockGetUserFromCookies.mockResolvedValue(user)

    const withAuthUserTokenSSR = require('src/withAuthUserTokenSSR').default
    const mockGetSSPFunc = jest.fn()
    const func = withAuthUserTokenSSR({}, { useToken: false })(mockGetSSPFunc)
    const ctx = createMockNextContext()
    await func(ctx)
    expect(mockGetUserFromCookies).toHaveBeenCalledWith({
      req: ctx.req,
      includeToken: false,
    })
  })

  it('passes an AuthUserSerialized prop when the user is authenticated', async () => {
    expect.assertions(1)

    // Mock the authenticated user.
    const mockFirebaseAdminUser = createMockFirebaseUserAdminSDK()
    const user = createAuthUser({
      token: 'a-user-identity-token-abc',
      firebaseUserAdminSDK: mockFirebaseAdminUser,
    })
    mockGetUserFromCookies.mockResolvedValue(user)

    const expectedAuthUserProp = user.serialize()
    const withAuthUserTokenSSR = require('src/withAuthUserTokenSSR').default
    const mockGetSSPFunc = jest.fn()
    const func = withAuthUserTokenSSR()(mockGetSSPFunc)
    const props = await func(createMockNextContext())
    expect(props).toEqual({
      props: { AuthUserSerialized: expectedAuthUserProp },
    })
  })

  it('passes an empty serialized AuthUser prop when the user has no cookie auth and auth is *not* required', async () => {
    expect.assertions(1)
    const unauthedUser = createAuthUser()
    mockGetUserFromCookies.mockResolvedValue(unauthedUser)
    const expectedAuthUserProp = unauthedUser.serialize() // empty auth
    const withAuthUserTokenSSR = require('src/withAuthUserTokenSSR').default
    const mockGetSSPFunc = jest.fn()
    const func = withAuthUserTokenSSR()(mockGetSSPFunc)
    const props = await func(createMockNextContext())
    expect(props).toEqual({
      props: { AuthUserSerialized: expectedAuthUserProp },
    })
  })

  it('redirects to the provided string login URL when the user is not authed and auth *is* required', async () => {
    expect.assertions(1)

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
        basePath: undefined,
      },
    })
  })

  it('redirects to the provided function login URL when the user is not authed and auth *is* required', async () => {
    expect.assertions(1)

    const withAuthUserTokenSSR = require('src/withAuthUserTokenSSR').default
    const mockGetSSPFunc = jest.fn()
    const func = withAuthUserTokenSSR({
      whenUnauthed: AuthAction.REDIRECT_TO_LOGIN,
      authPageURL: ({ ctx }: { ctx: GetServerSidePropsContext }) =>
        `/my-login?next=${ctx.query.pathname}`,
    })(mockGetSSPFunc)
    const props = await func(createMockNextContext())
    expect(props).toEqual({
      redirect: {
        destination: '/my-login?next=/my-path',
        permanent: false,
        basePath: undefined,
      },
    })
  })

  it('redirects to the provided object login URL when basePath is false, the user is not authed, and auth *is* required', async () => {
    expect.assertions(1)

    const withAuthUserTokenSSR = require('src/withAuthUserTokenSSR').default
    const mockGetSSPFunc = jest.fn()
    const func = withAuthUserTokenSSR({
      whenUnauthed: AuthAction.REDIRECT_TO_LOGIN,
      authPageURL: ({ ctx }: { ctx: GetServerSidePropsContext }) => ({
        destination: `/my-login?next=${ctx.query.pathname}`,
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

    const withAuthUserTokenSSR = require('src/withAuthUserTokenSSR').default
    const mockGetSSPFunc = jest.fn()
    const func = withAuthUserTokenSSR({
      whenUnauthed: AuthAction.REDIRECT_TO_LOGIN,
      authPageURL: ({ ctx }: { ctx: GetServerSidePropsContext }) => ({
        destination: `/my-login?next=${ctx.query.pathname}`,
        basePath: undefined,
      }),
    })(mockGetSSPFunc)
    const props = await func(createMockNextContext())
    expect(props).toEqual({
      redirect: {
        destination: '/my-login?next=/my-path',
        permanent: false,
        basePath: undefined,
      },
    })
  })

  it("redirects to the config's default login URL when no login URL is provided, the user is not authed, and auth *is* required", async () => {
    expect.assertions(1)

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
        basePath: undefined,
      },
    })
  })

  it('throws if no login URL is provided but we need to redirect to login', async () => {
    expect.assertions(1)

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

    const mockConfig = getMockConfig()
    setConfig({
      ...mockConfig,
      authPageURL: () => undefined as unknown as PageURL, // no auth page default defined
    } as unknown as ConfigInput)

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
    const mockFirebaseAdminUser = createMockFirebaseUserAdminSDK()
    mockGetUserFromCookies.mockResolvedValue(
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
        basePath: undefined,
      },
    })
  })

  it('redirects to the provided object app URL when the user is authed and "whenAuthed" is set to AuthAction.REDIRECT_TO_APP', async () => {
    expect.assertions(1)

    // Mock that the user is authed.
    const mockFirebaseAdminUser = createMockFirebaseUserAdminSDK()
    mockGetUserFromCookies.mockResolvedValue(
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
    const mockFirebaseAdminUser = createMockFirebaseUserAdminSDK()
    mockGetUserFromCookies.mockResolvedValue(
      createAuthUser({
        token: 'a-user-identity-token-abc',
        firebaseUserAdminSDK: mockFirebaseAdminUser,
      })
    )

    const withAuthUserTokenSSR = require('src/withAuthUserTokenSSR').default
    const mockGetSSPFunc = jest.fn()
    const func = withAuthUserTokenSSR({
      whenAuthed: AuthAction.REDIRECT_TO_APP,
      appPageURL: ({ ctx }: { ctx: GetServerSidePropsContext }) =>
        `/my-app?next=${ctx.query.pathname}`,
    })(mockGetSSPFunc)
    const props = await func(createMockNextContext())
    expect(props).toEqual({
      redirect: {
        destination: '/my-app?next=/my-path',
        permanent: false,
        basePath: undefined,
      },
    })
  })

  it('redirects to the config\'s default app URL when no app URL is provided, the user is authed, and "whenAuthed" is set to AuthAction.REDIRECT_TO_APP', async () => {
    expect.assertions(1)
    const mockFirebaseAdminUser = createMockFirebaseUserAdminSDK()
    mockGetUserFromCookies.mockResolvedValue(
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
        basePath: undefined,
      },
    })
  })

  it('throws if no app URL is provided but we need to redirect to the app', async () => {
    expect.assertions(1)

    // Mock that the user is authed.
    const mockFirebaseAdminUser = createMockFirebaseUserAdminSDK()
    mockGetUserFromCookies.mockResolvedValue(
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
    expect.assertions(1)

    // Mock that the user is authed.
    const mockFirebaseAdminUser = createMockFirebaseUserAdminSDK()
    mockGetUserFromCookies.mockResolvedValue(
      createAuthUser({
        token: 'a-user-identity-token-abc',
        firebaseUserAdminSDK: mockFirebaseAdminUser,
      })
    )

    const mockConfig = getMockConfig()
    setConfig({
      ...mockConfig,
      appPageURL: () => undefined as unknown as PageURL, // no default defined
    } as unknown as ConfigInput)

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
    const mockFirebaseAdminUser = createMockFirebaseUserAdminSDK()
    mockGetUserFromCookies.mockResolvedValue(
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
    const mockFirebaseAdminUser = createMockFirebaseUserAdminSDK()
    mockGetUserFromCookies.mockResolvedValue(
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
    const mockFirebaseAdminUser = createMockFirebaseUserAdminSDK()
    mockGetUserFromCookies.mockResolvedValue(
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

  it('logs the expected debug logs when not redirecting', async () => {
    expect.assertions(2)
    const mockFirebaseAdminUser = createMockFirebaseUserAdminSDK()
    const user = createAuthUser({
      token: 'a-user-identity-token-abc',
      firebaseUserAdminSDK: mockFirebaseAdminUser,
    })
    mockGetUserFromCookies.mockResolvedValue(user)
    const withAuthUserTokenSSR = require('src/withAuthUserTokenSSR').default
    const mockGetSSPFunc = jest.fn()
    const func = withAuthUserTokenSSR()(mockGetSSPFunc)
    mockLogDebug.mockClear()
    await func(createMockNextContext())
    expect(mockLogDebug).toHaveBeenCalledWith(
      '[withAuthUserSSR] Calling "withAuthUserSSR" / "withAuthUserTokenSSR".'
    )
    expect(mockLogDebug).toHaveBeenCalledTimes(1)
  })

  it('logs expected debug logs when redirecting to the login URL', async () => {
    expect.assertions(3)

    const withAuthUserTokenSSR = require('src/withAuthUserTokenSSR').default
    const mockGetSSPFunc = jest.fn()
    const func = withAuthUserTokenSSR({
      whenUnauthed: AuthAction.REDIRECT_TO_LOGIN,
      authPageURL: '/my-login',
    })(mockGetSSPFunc)
    mockLogDebug.mockClear()
    await func(createMockNextContext())
    expect(mockLogDebug).toHaveBeenCalledWith(
      '[withAuthUserSSR] Calling "withAuthUserSSR" / "withAuthUserTokenSSR".'
    )
    expect(mockLogDebug).toHaveBeenCalledWith(
      '[withAuthUserSSR] Redirecting to login.'
    )
    expect(mockLogDebug).toHaveBeenCalledTimes(2)
  })

  it('logs expected debug logs when redirecting to the app URL', async () => {
    expect.assertions(3)

    // Mock that the user is authed.
    const mockFirebaseAdminUser = createMockFirebaseUserAdminSDK()
    mockGetUserFromCookies.mockResolvedValue(
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
    mockLogDebug.mockClear()
    await func(createMockNextContext())
    expect(mockLogDebug).toHaveBeenCalledWith(
      '[withAuthUserSSR] Calling "withAuthUserSSR" / "withAuthUserTokenSSR".'
    )
    expect(mockLogDebug).toHaveBeenCalledWith(
      '[withAuthUserSSR] Redirecting to app.'
    )
    expect(mockLogDebug).toHaveBeenCalledTimes(2)
  })
})
