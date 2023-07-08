import { GetServerSidePropsContext } from 'next'
import { setConfig } from 'src/config'
import getMockConfig from 'src/testHelpers/createMockConfig'
import { createMockFirebaseUserAdminSDK } from 'src/testHelpers/userInputs'
import createUser from 'src/createUser'
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
  mockGetUserFromCookies.mockResolvedValue(createUser())
})

afterEach(() => {
  jest.clearAllMocks()
})

describe('withUserTokenSSR: authed user cookies and prop', () => {
  it('calls getUserFromCookies with the request object and a default of includeToken=true', async () => {
    expect.assertions(1)

    // Mock the authenticated user.
    const mockFirebaseAdminUser = createMockFirebaseUserAdminSDK()
    const user = createUser({
      token: 'a-user-identity-token-abc',
      firebaseUserAdminSDK: mockFirebaseAdminUser,
    })
    mockGetUserFromCookies.mockResolvedValue(user)

    const withUserTokenSSR = require('src/withUserTokenSSR').default
    const mockGetSSPFunc = jest.fn()
    const func = withUserTokenSSR()(mockGetSSPFunc)
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
    const user = createUser({
      token: 'a-user-identity-token-abc',
      firebaseUserAdminSDK: mockFirebaseAdminUser,
    })
    mockGetUserFromCookies.mockResolvedValue(user)

    const withUserTokenSSR = require('src/withUserTokenSSR').default
    const mockGetSSPFunc = jest.fn()
    const func = withUserTokenSSR({}, { useToken: false })(mockGetSSPFunc)
    const ctx = createMockNextContext()
    await func(ctx)
    expect(mockGetUserFromCookies).toHaveBeenCalledWith({
      req: ctx.req,
      includeToken: false,
    })
  })

  it('passes an userSerialized prop when the user is authenticated', async () => {
    expect.assertions(1)

    // Mock the authenticated user.
    const mockFirebaseAdminUser = createMockFirebaseUserAdminSDK()
    const user = createUser({
      token: 'a-user-identity-token-abc',
      firebaseUserAdminSDK: mockFirebaseAdminUser,
    })
    mockGetUserFromCookies.mockResolvedValue(user)

    const expectedUserProp = user.serialize()
    const withUserTokenSSR = require('src/withUserTokenSSR').default
    const mockGetSSPFunc = jest.fn()
    const func = withUserTokenSSR()(mockGetSSPFunc)
    const props = await func(createMockNextContext())
    expect(props).toEqual({
      props: { userSerialized: expectedUserProp },
    })
  })

  it('passes an empty serialized user prop when the user has no cookie auth and auth is *not* required', async () => {
    expect.assertions(1)
    const unauthedUser = createUser()
    mockGetUserFromCookies.mockResolvedValue(unauthedUser)
    const expectedUserProp = unauthedUser.serialize() // empty auth
    const withUserTokenSSR = require('src/withUserTokenSSR').default
    const mockGetSSPFunc = jest.fn()
    const func = withUserTokenSSR()(mockGetSSPFunc)
    const props = await func(createMockNextContext())
    expect(props).toEqual({
      props: { userSerialized: expectedUserProp },
    })
  })

  it('redirects to the provided string login URL when the user is not authed and auth *is* required', async () => {
    expect.assertions(1)

    const withUserTokenSSR = require('src/withUserTokenSSR').default
    const mockGetSSPFunc = jest.fn()
    const func = withUserTokenSSR({
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

    const withUserTokenSSR = require('src/withUserTokenSSR').default
    const mockGetSSPFunc = jest.fn()
    const func = withUserTokenSSR({
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

    const withUserTokenSSR = require('src/withUserTokenSSR').default
    const mockGetSSPFunc = jest.fn()
    const func = withUserTokenSSR({
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

    const withUserTokenSSR = require('src/withUserTokenSSR').default
    const mockGetSSPFunc = jest.fn()
    const func = withUserTokenSSR({
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

    const withUserTokenSSR = require('src/withUserTokenSSR').default
    const mockGetSSPFunc = jest.fn()
    const func = withUserTokenSSR({
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

    const withUserTokenSSR = require('src/withUserTokenSSR').default
    const mockGetSSPFunc = jest.fn()
    const func = withUserTokenSSR({
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

    const withUserTokenSSR = require('src/withUserTokenSSR').default
    const mockGetSSPFunc = jest.fn()
    const func = withUserTokenSSR({
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
      createUser({
        token: 'a-user-identity-token-abc',
        firebaseUserAdminSDK: mockFirebaseAdminUser,
      })
    )

    const withUserTokenSSR = require('src/withUserTokenSSR').default
    const mockGetSSPFunc = jest.fn()
    const func = withUserTokenSSR({
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
      createUser({
        token: 'a-user-identity-token-abc',
        firebaseUserAdminSDK: mockFirebaseAdminUser,
      })
    )

    const withUserTokenSSR = require('src/withUserTokenSSR').default
    const mockGetSSPFunc = jest.fn()
    const func = withUserTokenSSR({
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
      createUser({
        token: 'a-user-identity-token-abc',
        firebaseUserAdminSDK: mockFirebaseAdminUser,
      })
    )

    const withUserTokenSSR = require('src/withUserTokenSSR').default
    const mockGetSSPFunc = jest.fn()
    const func = withUserTokenSSR({
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
      createUser({
        token: 'a-user-identity-token-abc',
        firebaseUserAdminSDK: mockFirebaseAdminUser,
      })
    )

    const mockConfig = getMockConfig()
    setConfig({
      ...mockConfig,
      appPageURL: '/default-app-homepage',
    })

    const withUserTokenSSR = require('src/withUserTokenSSR').default
    const mockGetSSPFunc = jest.fn()
    const func = withUserTokenSSR({
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
      createUser({
        token: 'a-user-identity-token-abc',
        firebaseUserAdminSDK: mockFirebaseAdminUser,
      })
    )

    const mockConfig = getMockConfig()
    setConfig({
      ...mockConfig,
      appPageURL: undefined, // no default defined
    })

    const withUserTokenSSR = require('src/withUserTokenSSR').default
    const mockGetSSPFunc = jest.fn()
    const func = withUserTokenSSR({
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
      createUser({
        token: 'a-user-identity-token-abc',
        firebaseUserAdminSDK: mockFirebaseAdminUser,
      })
    )

    const mockConfig = getMockConfig()
    setConfig({
      ...mockConfig,
      appPageURL: () => undefined as unknown as PageURL, // no default defined
    } as unknown as ConfigInput)

    const withUserTokenSSR = require('src/withUserTokenSSR').default
    const mockGetSSPFunc = jest.fn()
    const func = withUserTokenSSR({
      whenAuthed: AuthAction.REDIRECT_TO_APP,
      // no app page URL defined
    })(mockGetSSPFunc)
    await expect(func(createMockNextContext())).rejects.toEqual(
      new Error(
        'The "appPageURL" must be set to a non-empty string, an object literal containing "destination", or a function that returns either.'
      )
    )
  })

  it("includes the composed getServerSideProps's props, passing it the context with a defined user", async () => {
    expect.assertions(1)
    const mockFirebaseAdminUser = createMockFirebaseUserAdminSDK()
    mockGetUserFromCookies.mockResolvedValue(
      createUser({
        token: 'a-user-identity-token-abc',
        firebaseUserAdminSDK: mockFirebaseAdminUser,
      })
    )
    const expectedUserProp = createUser({
      firebaseUserAdminSDK: mockFirebaseAdminUser,
      token: 'a-user-identity-token-abc',
    }).serialize()
    const withUserTokenSSR = require('src/withUserTokenSSR').default
    const mockGetSSPFunc = jest.fn((ctx) => ({
      props: {
        here: ['is', 'a', 'prop'],
        userEmail: ctx.user.email,
      },
    }))
    const func = withUserTokenSSR()(mockGetSSPFunc)
    const props = await func(createMockNextContext())
    expect(props).toEqual({
      props: {
        userSerialized: expectedUserProp,
        here: ['is', 'a', 'prop'],
        userEmail: 'def@example.com', // from createMockFirebaseUserAdminSDK
      },
    })
  })

  it("includes only the composed getServerSideProps's custom 'redirect' logic", async () => {
    expect.assertions(1)
    const mockFirebaseAdminUser = createMockFirebaseUserAdminSDK()
    mockGetUserFromCookies.mockResolvedValue(
      createUser({
        token: 'a-user-identity-token-abc',
        firebaseUserAdminSDK: mockFirebaseAdminUser,
      })
    )
    const withUserTokenSSR = require('src/withUserTokenSSR').default
    const mockGetSSPFunc = jest.fn(() => ({
      redirect: {
        destination: '/some-custom-redirect',
        permanent: false,
      },
    }))
    const func = withUserTokenSSR()(mockGetSSPFunc)
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
      createUser({
        token: 'a-user-identity-token-abc',
        firebaseUserAdminSDK: mockFirebaseAdminUser,
      })
    )
    const withUserTokenSSR = require('src/withUserTokenSSR').default
    const mockGetSSPFunc = jest.fn(() => ({ notFound: true }))
    const func = withUserTokenSSR()(mockGetSSPFunc)
    const props = await func(createMockNextContext())
    expect(props).toEqual({ notFound: true })
  })

  it('logs the expected debug logs when not redirecting', async () => {
    expect.assertions(2)
    const mockFirebaseAdminUser = createMockFirebaseUserAdminSDK()
    const user = createUser({
      token: 'a-user-identity-token-abc',
      firebaseUserAdminSDK: mockFirebaseAdminUser,
    })
    mockGetUserFromCookies.mockResolvedValue(user)
    const withUserTokenSSR = require('src/withUserTokenSSR').default
    const mockGetSSPFunc = jest.fn()
    const func = withUserTokenSSR()(mockGetSSPFunc)
    mockLogDebug.mockClear()
    await func(createMockNextContext())
    expect(mockLogDebug).toHaveBeenCalledWith(
      '[withUserSSR] Calling "withUserSSR" / "withUserTokenSSR".'
    )
    expect(mockLogDebug).toHaveBeenCalledTimes(1)
  })

  it('logs expected debug logs when redirecting to the login URL', async () => {
    expect.assertions(3)

    const withUserTokenSSR = require('src/withUserTokenSSR').default
    const mockGetSSPFunc = jest.fn()
    const func = withUserTokenSSR({
      whenUnauthed: AuthAction.REDIRECT_TO_LOGIN,
      authPageURL: '/my-login',
    })(mockGetSSPFunc)
    mockLogDebug.mockClear()
    await func(createMockNextContext())
    expect(mockLogDebug).toHaveBeenCalledWith(
      '[withUserSSR] Calling "withUserSSR" / "withUserTokenSSR".'
    )
    expect(mockLogDebug).toHaveBeenCalledWith(
      '[withUserSSR] Redirecting to login.'
    )
    expect(mockLogDebug).toHaveBeenCalledTimes(2)
  })

  it('logs expected debug logs when redirecting to the app URL', async () => {
    expect.assertions(3)

    // Mock that the user is authed.
    const mockFirebaseAdminUser = createMockFirebaseUserAdminSDK()
    mockGetUserFromCookies.mockResolvedValue(
      createUser({
        token: 'a-user-identity-token-abc',
        firebaseUserAdminSDK: mockFirebaseAdminUser,
      })
    )

    const withUserTokenSSR = require('src/withUserTokenSSR').default
    const mockGetSSPFunc = jest.fn()
    const func = withUserTokenSSR({
      whenAuthed: AuthAction.REDIRECT_TO_APP,
      appPageURL: '/my-app',
    })(mockGetSSPFunc)
    mockLogDebug.mockClear()
    await func(createMockNextContext())
    expect(mockLogDebug).toHaveBeenCalledWith(
      '[withUserSSR] Calling "withUserSSR" / "withUserTokenSSR".'
    )
    expect(mockLogDebug).toHaveBeenCalledWith(
      '[withUserSSR] Redirecting to app.'
    )
    expect(mockLogDebug).toHaveBeenCalledTimes(2)
  })
})
