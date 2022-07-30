import getUserFromCookies from 'src/getUserFromCookies'
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

describe('getUserFromCookies: with ID token', () => {
  it('returns an authenticated user', async () => {
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
    const expectedUser = createAuthUser({
      token: 'a-user-identity-token-abc',
      firebaseUserAdminSDK: mockFirebaseAdminUser,
    })
    verifyIdToken.mockResolvedValue(expectedUser)
    const mockReq = {}
    const user = await getUserFromCookies({ req: mockReq })
    expect(user).toEqual(expectedUser)
  })

  it('uses the ID token, not the auth info cookie, when "includeToken" is true', async () => {
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
    const mockFirebaseAdminUser = createMockFirebaseUserAdminSDK()
    const expectedUser = createAuthUser({
      token: 'a-user-identity-token-abc',
      firebaseUserAdminSDK: mockFirebaseAdminUser,
    })
    verifyIdToken.mockResolvedValue(expectedUser)
    const mockReq = {}
    const user = await getUserFromCookies({ req: mockReq, includeToken: true })
    expect(user).toEqual(expectedUser)
  })

  it('returns an unauthed user object when no user exists', async () => {
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
    getCookie.mockReturnValue(undefined) // the user has no auth cookies
    const mockFirebaseAdminUser = undefined
    verifyIdToken.mockResolvedValue(mockFirebaseAdminUser)
    const expectedUser = createAuthUser()
    const mockReq = {}
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
    const mockReq = {}
    await getUserFromCookies({ req: mockReq })
    expect(getCookie).toHaveBeenCalledWith(
      'MyCookie.AuthUserTokens',
      {
        req: mockReq,
      },
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
    const mockFirebaseAdminUser = createMockFirebaseUserAdminSDK()
    const expectedUser = createAuthUser({
      token: 'a-user-identity-token-abc',
      firebaseUserAdminSDK: mockFirebaseAdminUser,
    })
    verifyIdToken.mockResolvedValue(expectedUser)
    const mockReq = {}
    await getUserFromCookies({ req: mockReq })
    expect(verifyIdToken).toHaveBeenCalledWith(
      'some-id-token-24680',
      'some-refresh-token-13579'
    )
  })

  it('throws if verifyIdToken throws', async () => {
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
    const mockErr = new Error('Invalid thing.')
    verifyIdToken.mockImplementationOnce(() => Promise.reject(mockErr))
    const mockReq = {}
    await expect(getUserFromCookies({ req: mockReq })).rejects.toEqual(mockErr)
  })
})

describe('getUserFromCookies: *without* ID token', () => {
  it('returns an authenticated user', async () => {
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
    const expectedUser = createAuthUser({
      token: 'a-user-identity-token-abc',
      firebaseUserAdminSDK: mockFirebaseAdminUser,
    })
    verifyIdToken.mockResolvedValue(expectedUser)
    const mockReq = {}
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
    getCookie.mockImplementation((cookieName) => {
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
    verifyIdToken.mockResolvedValue(mockUserWithToken)
    const mockReq = {}
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
    getCookie.mockReturnValue(undefined) // the user has no auth cookies
    const mockFirebaseAdminUser = undefined
    verifyIdToken.mockResolvedValue(mockFirebaseAdminUser)
    const expectedUser = createAuthUser()
    const mockReq = {}
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

    const mockReq = {}
    await getUserFromCookies({ req: mockReq, includeToken: false })
    expect(getCookie).toHaveBeenCalledWith(
      'MyCookie.AuthUser',
      {
        req: mockReq,
      },
      { keys: ['aaa', 'bbb'], signed: true, secure: false }
    )
  })

  it('does not call verifyIdToken when not using an ID token', async () => {
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
    const mockFirebaseAdminUser = createMockFirebaseUserAdminSDK()
    const expectedUser = createAuthUser({
      token: 'a-user-identity-token-abc',
      firebaseUserAdminSDK: mockFirebaseAdminUser,
    })
    verifyIdToken.mockResolvedValue(expectedUser)
    const mockReq = {}
    await getUserFromCookies({ req: mockReq, includeToken: false })
    expect(verifyIdToken).not.toHaveBeenCalled()
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
    const expectedUser = createAuthUser({
      token: 'a-user-identity-token-abc',
      firebaseUserAdminSDK: mockFirebaseAdminUser,
    })
    verifyIdToken.mockResolvedValue(expectedUser)
    const mockReq = {}
    const expectedErr = new Error(
      'Cookies must be signed when using withAuthUserSSR.'
    )
    await expect(
      getUserFromCookies({ req: mockReq, includeToken: false })
    ).rejects.toEqual(expectedErr)
  })
})
