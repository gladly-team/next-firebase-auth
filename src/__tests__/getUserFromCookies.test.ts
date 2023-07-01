import { testApiHandler } from 'next-test-api-route-handler'
import getUserFromCookies from 'src/getUserFromCookies'
import { setConfig } from 'src/config'
import getMockConfig from 'src/testHelpers/createMockConfig'
import { createMockFirebaseUserAdminSDK } from 'src/testHelpers/authUserInputs'
import createAuthUser from 'src/createAuthUser'
import { getCookie } from 'src/cookies'
import { verifyIdToken } from 'src/firebaseAdmin'
import {
  getAuthUserCookieName,
  getAuthUserSigCookieName,
  getAuthUserTokensCookieName,
  getAuthUserTokensSigCookieName,
} from 'src/authCookies'
import logDebug from 'src/logDebug'
import { NextApiRequest } from 'next'

/**
 * We intentionally don't mock a few modules whose behavior we want to
 * test:
 * - createAuthUser
 * - src/config
 */
jest.mock('src/cookies')
jest.mock('src/firebaseAdmin')
jest.mock('src/authCookies')
jest.mock('src/isClientSide')
jest.mock('src/logDebug')

const mockGetCookie = jest.mocked(getCookie)
const mockVerifyIdToken = verifyIdToken as jest.Mock
const mockGetAuthUserCookieName = jest.mocked(getAuthUserCookieName)
const mockGetAuthUserSigCookieName = jest.mocked(getAuthUserSigCookieName)
const mockGetAuthUserTokensCookieName = jest.mocked(getAuthUserTokensCookieName)
const mockGetAuthUserTokensSigCookieName = jest.mocked(
  getAuthUserTokensSigCookieName
)
const mockLogDebug = jest.mocked(logDebug)

beforeEach(() => {
  // This is always called server-side.
  const isClientSide = require('src/isClientSide').default
  isClientSide.mockReturnValue(false)

  mockGetAuthUserCookieName.mockReturnValue('SomeName.AuthUser')
  mockGetAuthUserTokensCookieName.mockReturnValue('SomeName.AuthUserTokens')

  // Default to an authed user.
  mockGetCookie.mockImplementation((cookieName) => {
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

/**
 * START: tests with ID token
 */
describe('getUserFromCookies: with ID token', () => {
  it('returns an authenticated user', async () => {
    expect.assertions(1)

    mockGetCookie.mockImplementation((cookieName) => {
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
    const expectedUser = createAuthUser({
      token: 'a-user-identity-token-abc',
      firebaseUserAdminSDK: mockFirebaseAdminUser,
    })
    mockVerifyIdToken.mockResolvedValue(expectedUser)
    const mockReq = {} as NextApiRequest
    const user = await getUserFromCookies({ req: mockReq })
    expect(user).toEqual(expectedUser)
  })

  it('uses the ID token, not the auth info cookie, when "includeToken" is true', async () => {
    expect.assertions(1)
    mockGetCookie.mockImplementation((cookieName) => {
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
    const mockFirebaseAdminUser = createMockFirebaseUserAdminSDK()
    const expectedUser = createAuthUser({
      token: 'a-user-identity-token-abc',
      firebaseUserAdminSDK: mockFirebaseAdminUser,
    })
    mockVerifyIdToken.mockResolvedValue(expectedUser)
    const mockReq = {} as NextApiRequest
    const user = await getUserFromCookies({ req: mockReq, includeToken: true })
    expect(user).toEqual(expectedUser)
  })

  it('returns an unauthed user object when no user exists', async () => {
    expect.assertions(1)
    mockGetCookie.mockImplementation((cookieName) => {
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
    mockGetCookie.mockReturnValue(undefined) // the user has no auth cookies
    const mockFirebaseAdminUser = undefined
    mockVerifyIdToken.mockResolvedValue(mockFirebaseAdminUser)
    const expectedUser = createAuthUser()
    const mockReq = {} as NextApiRequest
    const user = await getUserFromCookies({ req: mockReq })
    expect(user).toEqual({
      ...expectedUser,
      getIdToken: expect.any(Function),
      serialize: expect.any(Function),
      signOut: expect.any(Function),
    })
  })

  it('passes the expected values to getCookie', async () => {
    expect.assertions(1)
    mockGetAuthUserTokensCookieName.mockReturnValue('MyCookie.AuthUserTokens')
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
    const mockReq = {} as NextApiRequest
    await getUserFromCookies({ req: mockReq })
    expect(mockGetCookie).toHaveBeenCalledWith(
      'MyCookie.AuthUserTokens',
      {
        req: mockReq,
      },
      { keys: ['aaa', 'bbb'], signed: true, secure: false }
    )
  })

  it('passes the idToken and refreshToken from the auth cookie to verifyIdToken', async () => {
    expect.assertions(1)
    mockGetCookie.mockImplementation((cookieName) => {
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
    const mockFirebaseAdminUser = createMockFirebaseUserAdminSDK()
    const expectedUser = createAuthUser({
      token: 'a-user-identity-token-abc',
      firebaseUserAdminSDK: mockFirebaseAdminUser,
    })
    mockVerifyIdToken.mockResolvedValue(expectedUser)
    const mockReq = {} as NextApiRequest
    await getUserFromCookies({ req: mockReq })
    expect(mockVerifyIdToken).toHaveBeenCalledWith(
      'some-id-token-24680',
      'some-refresh-token-13579'
    )
  })

  it('throws if verifyIdToken throws', async () => {
    expect.assertions(1)
    mockGetCookie.mockImplementation((cookieName) => {
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
    const mockErr = new Error('Invalid thing.')
    mockVerifyIdToken.mockImplementationOnce(() => Promise.reject(mockErr))
    const mockReq = {} as NextApiRequest
    await expect(getUserFromCookies({ req: mockReq })).rejects.toEqual(mockErr)
  })

  it('passes the expected request object to getCookie when `req` is provided', async () => {
    expect.assertions(2)
    await testApiHandler({
      handler: async (req, res) => {
        await getUserFromCookies({ req, includeToken: true })
        const { req: passedReq } = mockGetCookie.mock.calls[0][1]
        expect(passedReq).toEqual(req)
        expect(passedReq.headers.cookie).toEqual('someStuff=foo;')
        return res.status(200).end()
      },
      test: async ({ fetch }) => {
        await fetch({
          headers: {
            foo: 'blah',
            cookie: `someStuff=foo;`,
          },
        })
      },
    })
  })

  it('passes the expected request object structure to getCookie when cookie values are provided *instead of* the `req` object (incl. signed cookie)', async () => {
    expect.assertions(1)
    mockGetAuthUserCookieName.mockReturnValue('MyCookie.AuthUser')
    mockGetAuthUserSigCookieName.mockReturnValue('MyCookie.AuthUser.sig')
    mockGetAuthUserTokensCookieName.mockReturnValue('MyCookie.AuthUserTokens')
    mockGetAuthUserTokensSigCookieName.mockReturnValue(
      'MyCookie.AuthUserTokens.sig'
    )
    const authCookieValue = 'thequickbrownfox'
    const authCookieSigValue = '1q2w3e4r'
    await getUserFromCookies({
      authCookieValue,
      authCookieSigValue,
      includeToken: true,
    })
    const expectedReqObj = {
      headers: {
        cookie:
          'MyCookie.AuthUserTokens=thequickbrownfox; MyCookie.AuthUserTokens.sig=1q2w3e4r;',
      },
    }
    const { req: passedReq } = mockGetCookie.mock.calls[0][1]
    expect(passedReq).toEqual(expectedReqObj)
  })

  it('passes the expected request object structure to getCookie when cookie values are provided *instead of* the `req` object (*not* incl. signed cookie)', async () => {
    expect.assertions(1)
    mockGetAuthUserCookieName.mockReturnValue('MyCookie.AuthUser')
    mockGetAuthUserSigCookieName.mockReturnValue('MyCookie.AuthUser.sig')
    mockGetAuthUserTokensCookieName.mockReturnValue('MyCookie.AuthUserTokens')
    mockGetAuthUserTokensSigCookieName.mockReturnValue(
      'MyCookie.AuthUserTokens.sig'
    )
    const authCookieValue = 'thequickbrownfox'
    const authCookieSigValue = undefined // no signed cookie
    await getUserFromCookies({
      authCookieValue,
      authCookieSigValue,
      includeToken: true,
    })
    const expectedReqObj = {
      headers: {
        cookie: 'MyCookie.AuthUserTokens=thequickbrownfox;',
      },
    }
    const { req: passedReq } = mockGetCookie.mock.calls[0][1]
    expect(passedReq).toEqual(expectedReqObj)
  })

  it('throws if both `req` and `authCookieValue` are not provided', async () => {
    expect.assertions(1)
    await expect(
      getUserFromCookies({
        // Not including req or authCookieValue
        includeToken: true,
      })
    ).rejects.toThrow(
      new Error('Either "req" or "authCookieValue" must be provided.')
    )
  })

  it('logs expected debug logs for an authenticated user', async () => {
    expect.assertions(3)

    mockGetCookie.mockImplementation((cookieName) => {
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
    const expectedUser = createAuthUser({
      token: 'a-user-identity-token-abc',
      firebaseUserAdminSDK: mockFirebaseAdminUser,
    })
    mockVerifyIdToken.mockResolvedValue(expectedUser)
    const mockReq = {} as NextApiRequest

    mockLogDebug.mockClear()
    await getUserFromCookies({ req: mockReq })
    expect(mockLogDebug).toHaveBeenCalledWith(
      '[getUserFromCookies] Attempting to get user info from cookies via the ID token.'
    )
    expect(mockLogDebug).toHaveBeenCalledWith(
      '[getUserFromCookies] Successfully retrieved the ID token from cookies.'
    )
    expect(mockLogDebug).toHaveBeenCalledTimes(3)
  })

  it('logs expected debug logs for a user without valid auth cookie values', async () => {
    expect.assertions(3)
    mockGetCookie.mockImplementation((cookieName) => {
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
    mockGetCookie.mockReturnValue(undefined) // the user has no auth cookies
    const mockFirebaseAdminUser = undefined
    mockVerifyIdToken.mockResolvedValue(mockFirebaseAdminUser)
    const mockReq = {} as NextApiRequest

    mockLogDebug.mockClear()
    await getUserFromCookies({ req: mockReq })
    expect(mockLogDebug).toHaveBeenCalledWith(
      '[getUserFromCookies] Attempting to get user info from cookies via the ID token.'
    )
    expect(mockLogDebug).toHaveBeenCalledWith(
      "[getUserFromCookies] Failed to retrieve the ID token from cookies. This will happen if the user is not logged in, the provided cookie values are invalid, or the cookie values don't align with your cookie settings. The user will be unauthenticated."
    )
    expect(mockLogDebug).toHaveBeenCalledTimes(3)
  })

  it('logs expected debug logs for a user whose ID token is not successfully verified', async () => {
    expect.assertions(3)

    mockGetCookie.mockImplementation((cookieName) => {
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
    const expectedUser = createAuthUser() // unauthenticated user!
    mockVerifyIdToken.mockResolvedValue(expectedUser)
    const mockReq = {} as NextApiRequest

    mockLogDebug.mockClear()
    await getUserFromCookies({ req: mockReq })
    expect(mockLogDebug).toHaveBeenCalledWith(
      '[getUserFromCookies] Attempting to get user info from cookies via the ID token.'
    )
    expect(mockLogDebug).toHaveBeenCalledWith(
      '[getUserFromCookies] Successfully retrieved the ID token from cookies.'
    )
    expect(mockLogDebug).toHaveBeenCalledTimes(3)
  })
})
/**
 * END: tests with ID token
 */

/**
 * START: tests *without* ID token
 */
describe('getUserFromCookies: *without* ID token', () => {
  it('returns an authenticated user', async () => {
    expect.assertions(1)

    mockGetCookie.mockImplementation((cookieName) => {
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
    const expectedUser = createAuthUser({
      token: 'a-user-identity-token-abc',
      firebaseUserAdminSDK: mockFirebaseAdminUser,
    })
    mockVerifyIdToken.mockResolvedValue(expectedUser)
    const mockReq = {} as NextApiRequest
    const user = await getUserFromCookies({ req: mockReq, includeToken: false })
    expect(user).toEqual({
      ...expectedUser,
      getIdToken: expect.any(Function),
      serialize: expect.any(Function),
      signOut: expect.any(Function),
    })
  })

  it('uses the *auth info cookie*, not the ID token, when "includeToken" is false', async () => {
    expect.assertions(1)

    const mockUserNoToken = createAuthUser({
      firebaseUserAdminSDK: {
        ...createMockFirebaseUserAdminSDK(),
        email: 'some-different-email@example.com', // differs from token result
      },
    })
    mockGetCookie.mockImplementation((cookieName) => {
      if (cookieName === 'SomeName.AuthUserTokens') {
        return JSON.stringify({
          idToken: 'some-id-token',
          refreshToken: 'some-refresh-token',
        })
      }
      if (cookieName === 'SomeName.AuthUser') {
        return mockUserNoToken.serialize()
      }
      return undefined
    })

    // Mock the Firebase admin user verification.
    const mockFirebaseAdminUser = createMockFirebaseUserAdminSDK()
    const mockUserWithToken = createAuthUser({
      token: 'a-user-identity-token-abc',
      firebaseUserAdminSDK: mockFirebaseAdminUser,
    })
    mockVerifyIdToken.mockResolvedValue(mockUserWithToken)
    const mockReq = {} as NextApiRequest
    const user = await getUserFromCookies({ req: mockReq, includeToken: false })
    expect(user).toEqual({
      ...mockUserNoToken,
      getIdToken: expect.any(Function),
      serialize: expect.any(Function),
      signOut: expect.any(Function),
    })
  })

  it('returns an unauthed user object when no user exists', async () => {
    expect.assertions(1)
    mockGetCookie.mockReturnValue(undefined) // the user has no auth cookies
    const mockFirebaseAdminUser = undefined
    mockVerifyIdToken.mockResolvedValue(mockFirebaseAdminUser)
    const expectedUser = createAuthUser()
    const mockReq = {} as NextApiRequest
    const user = await getUserFromCookies({ req: mockReq, includeToken: false })
    expect(user).toEqual({
      ...expectedUser,
      getIdToken: expect.any(Function),
      serialize: expect.any(Function),
      signOut: expect.any(Function),
    })
  })

  it('passes the expected values to getCookie', async () => {
    expect.assertions(1)
    mockGetAuthUserCookieName.mockReturnValue('MyCookie.AuthUser')
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

    const mockReq = {} as NextApiRequest
    await getUserFromCookies({ req: mockReq, includeToken: false })
    expect(mockGetCookie).toHaveBeenCalledWith(
      'MyCookie.AuthUser',
      {
        req: mockReq,
      },
      { keys: ['aaa', 'bbb'], signed: true, secure: false }
    )
  })

  it('does not call verifyIdToken when not using an ID token', async () => {
    expect.assertions(1)

    mockGetCookie.mockImplementation((cookieName) => {
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
    const mockFirebaseAdminUser = createMockFirebaseUserAdminSDK()
    const expectedUser = createAuthUser({
      token: 'a-user-identity-token-abc',
      firebaseUserAdminSDK: mockFirebaseAdminUser,
    })
    mockVerifyIdToken.mockResolvedValue(expectedUser)
    const mockReq = {} as NextApiRequest
    await getUserFromCookies({ req: mockReq, includeToken: false })
    expect(mockVerifyIdToken).not.toHaveBeenCalled()
  })

  // https://github.com/gladly-team/next-firebase-auth/issues/195
  it('throws if cookies are unsigned', async () => {
    expect.assertions(1)

    const mockConfig = getMockConfig()
    setConfig({
      ...mockConfig,
      cookies: {
        ...mockConfig.cookies,
        signed: false,
      },
    })

    mockGetCookie.mockImplementation((cookieName) => {
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
    const expectedUser = createAuthUser({
      token: 'a-user-identity-token-abc',
      firebaseUserAdminSDK: mockFirebaseAdminUser,
    })
    mockVerifyIdToken.mockResolvedValue(expectedUser)
    const mockReq = {} as NextApiRequest
    const expectedErr = new Error(
      'Cookies must be signed when using withAuthUserSSR.'
    )
    await expect(
      getUserFromCookies({ req: mockReq, includeToken: false })
    ).rejects.toEqual(expectedErr)
  })

  it('passes the expected request object to getCookie when `req` is provided', async () => {
    expect.assertions(2)
    await testApiHandler({
      handler: async (req, res) => {
        await getUserFromCookies({ req, includeToken: false })
        const { req: passedReq } = mockGetCookie.mock.calls[0][1]
        expect(passedReq).toEqual(req)
        expect(passedReq.headers.cookie).toEqual('someStuff=foo;')
        return res.status(200).end()
      },
      test: async ({ fetch }) => {
        await fetch({
          headers: {
            foo: 'blah',
            cookie: `someStuff=foo;`,
          },
        })
      },
    })
  })

  it('passes the expected request object structure to getCookie when cookie values are provided *instead of* the `req` object (incl. signed cookie)', async () => {
    expect.assertions(1)
    mockGetAuthUserCookieName.mockReturnValue('MyCookie.AuthUser')
    mockGetAuthUserSigCookieName.mockReturnValue('MyCookie.AuthUser.sig')
    mockGetAuthUserTokensCookieName.mockReturnValue('MyCookie.AuthUserTokens')
    mockGetAuthUserTokensSigCookieName.mockReturnValue(
      'MyCookie.AuthUserTokens.sig'
    )
    const authCookieValue = 'thequickbrownfox'
    const authCookieSigValue = '1q2w3e4r'
    await getUserFromCookies({
      authCookieValue,
      authCookieSigValue,
      includeToken: false,
    })
    const expectedReqObj = {
      headers: {
        cookie:
          'MyCookie.AuthUser=thequickbrownfox; MyCookie.AuthUser.sig=1q2w3e4r;',
      },
    }
    const { req: passedReq } = mockGetCookie.mock.calls[0][1]
    expect(passedReq).toEqual(expectedReqObj)
  })

  it('passes the expected request object structure to getCookie when cookie values are provided *instead of* the `req` object (not incl. signed cookie)', async () => {
    expect.assertions(1)
    mockGetAuthUserCookieName.mockReturnValue('MyCookie.AuthUser')
    mockGetAuthUserSigCookieName.mockReturnValue('MyCookie.AuthUser.sig')
    mockGetAuthUserTokensCookieName.mockReturnValue('MyCookie.AuthUserTokens')
    mockGetAuthUserTokensSigCookieName.mockReturnValue(
      'MyCookie.AuthUserTokens.sig'
    )
    const authCookieValue = 'thequickbrownfox'
    const authCookieSigValue = undefined // no signed cookie
    await getUserFromCookies({
      authCookieValue,
      authCookieSigValue,
      includeToken: false,
    })
    const expectedReqObj = {
      headers: {
        cookie: 'MyCookie.AuthUser=thequickbrownfox;',
      },
    }
    const { req: passedReq } = mockGetCookie.mock.calls[0][1]
    expect(passedReq).toEqual(expectedReqObj)
  })

  it('throws if both `req` and `authCookieValue` are not provided', async () => {
    expect.assertions(1)
    await expect(
      getUserFromCookies({
        // Not including req or authCookieValue
        includeToken: false,
      })
    ).rejects.toThrow(
      new Error('Either "req" or "authCookieValue" must be provided.')
    )
  })

  it('logs expected debug logs for an authenticated user', async () => {
    expect.assertions(3)

    mockGetCookie.mockImplementation((cookieName) => {
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
    const expectedUser = createAuthUser({
      token: 'a-user-identity-token-abc',
      firebaseUserAdminSDK: mockFirebaseAdminUser,
    })
    mockVerifyIdToken.mockResolvedValue(expectedUser)
    const mockReq = {} as NextApiRequest

    mockLogDebug.mockClear()
    await getUserFromCookies({ req: mockReq, includeToken: false })
    expect(mockLogDebug).toHaveBeenCalledWith(
      '[getUserFromCookies] Attempting to get user info from cookies (not using the ID token).'
    )
    expect(mockLogDebug).toHaveBeenCalledWith(
      '[getUserFromCookies] Successfully retrieved the user info from cookies.'
    )
    expect(mockLogDebug).toHaveBeenCalledTimes(3)
  })

  it('logs expected debug logs for an unauthenticated user', async () => {
    expect.assertions(3)
    mockGetCookie.mockReturnValue(undefined) // the user has no auth cookies
    const mockFirebaseAdminUser = undefined
    mockVerifyIdToken.mockResolvedValue(mockFirebaseAdminUser)
    const mockReq = {} as NextApiRequest

    mockLogDebug.mockClear()
    await getUserFromCookies({ req: mockReq, includeToken: false })
    expect(mockLogDebug).toHaveBeenCalledWith(
      '[getUserFromCookies] Attempting to get user info from cookies (not using the ID token).'
    )
    expect(mockLogDebug).toHaveBeenCalledWith(
      '[getUserFromCookies] Failed to retrieve the user info from cookies. The provided cookie values might be invalid or not align with your cookie settings. The user will be unauthenticated.'
    )
    expect(mockLogDebug).toHaveBeenCalledTimes(3)
  })
})
/**
 * END: tests *without* ID token
 */
