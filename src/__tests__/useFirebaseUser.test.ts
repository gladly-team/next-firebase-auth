import { User, getIdTokenResult, onIdTokenChanged } from 'firebase/auth'
import { renderHook, act } from '@testing-library/react-hooks'
import useFirebaseUser from 'src/useFirebaseUser'
import {
  createMockFirebaseUserClientSDK,
  createMockIdTokenResult,
} from 'src/testHelpers/userInputs'
import createMockFetchResponse from 'src/testHelpers/createMockFetchResponse'
import { setConfig } from 'src/config'
import createMockConfig from 'src/testHelpers/createMockConfig'
import createUser from 'src/createUser'
import logDebug from 'src/logDebug'

jest.mock('firebase/app')
jest.mock('firebase/auth')
jest.mock('src/config')
jest.mock('src/logDebug')

const mockGetIdTokenResult = getIdTokenResult as jest.Mock
const mockOnIdTokenChanged = onIdTokenChanged as jest.Mock
const mockSetConfig = jest.mocked(setConfig)
const mockLogDebug = jest.mocked(logDebug)

type OnIdTokenChangeCallback = (firebaseUser: User | null) => Promise<void>
type PromiseResolver = (value: unknown) => void

let fetchSpy: jest.SpyInstance

beforeEach(() => {
  fetchSpy = jest
    .spyOn(window, 'fetch')
    .mockImplementation(
      jest.fn(() => Promise.resolve(createMockFetchResponse())) as jest.Mock
    )

  mockSetConfig({
    ...createMockConfig(),
    loginAPIEndpoint: 'https://example.com/api/my-login',
    logoutAPIEndpoint: 'https://example.com/api/my-logout',
  })
})

afterEach(() => {
  jest.clearAllMocks()
})

describe('useFirebaseUser', () => {
  it('returns a null user and initialized=false before the Firebase JS SDK has initialized', () => {
    expect.assertions(1)
    const { result } = renderHook(() => useFirebaseUser())
    expect(result.current).toEqual({
      user: null,
      claims: {},
      initialized: false,
      authRequestCompleted: false,
    })
  })

  it('returns the Firebase user and initialized=true after the Firebase JS SDK calls `onIdTokenChanged`', async () => {
    expect.assertions(1)

    const mockFirebaseUser = createMockFirebaseUserClientSDK()
    const mockFirebaseUserWithClaims = { ...mockFirebaseUser, claims: {} }

    let onIdTokenChangedCallback: OnIdTokenChangeCallback

    // Capture the onIdTokenChanged callback
    mockOnIdTokenChanged.mockImplementation((_, callback) => {
      onIdTokenChangedCallback = callback
      return () => {} // "unsubscribe" function
    })

    // Intercept the getIdToken call
    mockGetIdTokenResult.mockResolvedValue(mockFirebaseUserWithClaims)

    const { result } = renderHook(() => useFirebaseUser())

    await act(async () => {
      // Mock that Firebase calls onIdTokenChanged.
      await onIdTokenChangedCallback(mockFirebaseUser)
    })
    expect(result.current).toEqual({
      user: mockFirebaseUser,
      claims: {},
      initialized: true,
      authRequestCompleted: true,
    })
  })

  it('return a null user and initialized=true if the Firebase JS SDK calls `onIdTokenChanged` with no Firebase user', async () => {
    expect.assertions(1)

    const mockFirebaseUser = null // not signed in

    let onIdTokenChangedCallback: OnIdTokenChangeCallback

    // Capture the onIdTokenChanged callback
    mockOnIdTokenChanged.mockImplementation((_, callback) => {
      onIdTokenChangedCallback = callback
      return () => {} // "unsubscribe" function
    })

    // Intercept the getIdToken call
    mockGetIdTokenResult.mockResolvedValue(undefined)

    const { result } = renderHook(() => useFirebaseUser())

    await act(async () => {
      // Mock that Firebase calls onIdTokenChanged.
      await onIdTokenChangedCallback(mockFirebaseUser)
    })
    expect(result.current).toEqual({
      user: null,
      claims: {},
      initialized: true,
      authRequestCompleted: true,
    })
  })

  it('returns custom claims if they are present after the Firebase JS SDK calls `onIdTokenChanged`', async () => {
    expect.assertions(1)

    const mockFirebaseUser = createMockFirebaseUserClientSDK()
    const mockFirebaseUserWithClaims = {
      ...mockFirebaseUser,
      claims: {
        foo: 'bar',
        has: 'cheese',
        subscription: true,
      },
    }

    let onIdTokenChangedCallback: OnIdTokenChangeCallback

    // Capture the onIdTokenChanged callback
    mockOnIdTokenChanged.mockImplementation((_, callback) => {
      onIdTokenChangedCallback = callback
      return () => {} // "unsubscribe" function
    })

    // Intercept the getIdToken call
    mockGetIdTokenResult.mockResolvedValue(mockFirebaseUserWithClaims)

    const { result } = renderHook(() => useFirebaseUser())

    await act(async () => {
      // Mock that Firebase calls onIdTokenChanged.
      await onIdTokenChangedCallback(mockFirebaseUser)
    })
    expect(result.current).toEqual({
      user: mockFirebaseUser,
      claims: {
        foo: 'bar',
        has: 'cheese',
        subscription: true,
      },
      initialized: true,
      authRequestCompleted: true,
    })
  })

  it('calls the login endpoint as expected when the Firebase JS SDK calls `onIdTokenChanged` with an authed user value', async () => {
    expect.assertions(2)
    const mockToken = 'my-token-here'
    const mockFirebaseUser = {
      ...createMockFirebaseUserClientSDK(),
      getIdToken: async () => mockToken,
    }

    let onIdTokenChangedCallback: OnIdTokenChangeCallback

    // Capture the onIdTokenChanged callback
    mockOnIdTokenChanged.mockImplementation((_, callback) => {
      onIdTokenChangedCallback = callback
      return () => {} // "unsubscribe" function
    })

    // Intercept the getIdToken call
    const idTokenResult = createMockIdTokenResult()
    mockGetIdTokenResult.mockResolvedValue(idTokenResult)

    renderHook(() => useFirebaseUser())

    expect(fetch).not.toHaveBeenCalled()
    await act(async () => {
      await onIdTokenChangedCallback(mockFirebaseUser)
    })
    expect(fetch).toHaveBeenCalledWith(
      'https://example.com/api/my-login', // from mock config
      {
        method: 'POST',
        headers: {
          Authorization: mockToken,
        },
        credentials: 'include',
      }
    )
  })

  it('calls the logout endpoint as expected when the Firebase JS SDK calls `onIdTokenChanged` without an authed user', async () => {
    expect.assertions(2)
    let onIdTokenChangedCallback: OnIdTokenChangeCallback

    // Capture the onIdTokenChanged callback
    mockOnIdTokenChanged.mockImplementation((_, callback) => {
      onIdTokenChangedCallback = callback
      return () => {} // "unsubscribe" function
    })

    const mockFirebaseUser = null
    renderHook(() => useFirebaseUser())

    expect(fetch).not.toHaveBeenCalled()
    await act(async () => {
      await onIdTokenChangedCallback(mockFirebaseUser)
    })
    expect(fetch).toHaveBeenCalledWith(
      'https://example.com/api/my-logout', // from mock config
      {
        method: 'POST',
        credentials: 'include',
      }
    )
  })

  it('throws if `fetch`ing the login endpoint does not return an OK response', async () => {
    expect.assertions(1)
    let onIdTokenChangedCallback: OnIdTokenChangeCallback

    // Capture the onIdTokenChanged callback
    mockOnIdTokenChanged.mockImplementation((_, callback) => {
      onIdTokenChangedCallback = callback
      return () => {} // "unsubscribe" function
    })

    const idTokenResult = createMockIdTokenResult()
    mockGetIdTokenResult.mockResolvedValue(idTokenResult)

    const mockFirebaseUser = createMockFirebaseUserClientSDK()
    renderHook(() => useFirebaseUser())

    // Mock that `fetch` returns a non-OK response.
    fetchSpy.mockResolvedValue({
      ...createMockFetchResponse(),
      ok: false,
      status: 500,
    })

    await act(async () => {
      await expect(onIdTokenChangedCallback(mockFirebaseUser)).rejects.toThrow(
        'Received 500 response from login API endpoint: {}'
      )
    })
  })

  it('calls onLoginRequestError if defined, rather than throwing, when the login endpoint returns a non-OK response', async () => {
    expect.assertions(2)
    const mockOnLoginRequestError = jest.fn()
    mockSetConfig({
      ...createMockConfig(),
      loginAPIEndpoint: 'https://example.com/api/my-login',
      logoutAPIEndpoint: 'https://example.com/api/my-logout',
      onLoginRequestError: mockOnLoginRequestError,
    })

    let onIdTokenChangedCallback: OnIdTokenChangeCallback
    mockOnIdTokenChanged.mockImplementation((_, callback) => {
      onIdTokenChangedCallback = callback
      return () => {} // "unsubscribe" function
    })

    const idTokenResult = createMockIdTokenResult()
    mockGetIdTokenResult.mockResolvedValue(idTokenResult)
    const mockFirebaseUser = createMockFirebaseUserClientSDK()
    renderHook(() => useFirebaseUser())

    // Mock that `fetch` returns a non-OK response.
    fetchSpy.mockResolvedValue({
      ...createMockFetchResponse(),
      ok: false,
      status: 500,
    })

    await act(async () => {
      await expect(
        onIdTokenChangedCallback(mockFirebaseUser)
      ).resolves.not.toThrow()
      expect(mockOnLoginRequestError).toHaveBeenCalledWith(
        new Error('Received 500 response from login API endpoint: {}')
      )
    })
  })

  it('throws if `fetch` throws when calling the login endpoint', async () => {
    expect.assertions(1)
    let onIdTokenChangedCallback: OnIdTokenChangeCallback

    // Capture the onIdTokenChanged callback
    mockOnIdTokenChanged.mockImplementation((_, callback) => {
      onIdTokenChangedCallback = callback
      return () => {} // "unsubscribe" function
    })

    const mockFirebaseUser = createMockFirebaseUserClientSDK()
    renderHook(() => useFirebaseUser())

    // Mock that `fetch` returns a non-OK response.
    fetchSpy.mockRejectedValue(new Error('Could not fetch.'))

    await act(async () => {
      await expect(onIdTokenChangedCallback(mockFirebaseUser)).rejects.toThrow(
        'Could not fetch.'
      )
    })
  })

  it('throws if `fetch`ing the logout endpoint does not return an OK response', async () => {
    expect.assertions(1)
    let onIdTokenChangedCallback: OnIdTokenChangeCallback

    // Capture the onIdTokenChanged callback
    mockOnIdTokenChanged.mockImplementation((_, callback) => {
      onIdTokenChangedCallback = callback
      return () => {} // "unsubscribe" function
    })

    const mockFirebaseUser = null
    renderHook(() => useFirebaseUser())

    // Mock that `fetch` returns a non-OK response.
    fetchSpy.mockResolvedValue({
      ...createMockFetchResponse(),
      ok: false,
      status: 500,
    })

    await act(async () => {
      await expect(onIdTokenChangedCallback(mockFirebaseUser)).rejects.toThrow(
        'Received 500 response from logout API endpoint: {}'
      )
    })
  })

  it('calls onLogoutRequestError if defined, rather than throwing, when the logout endpoint returns a non-OK response', async () => {
    expect.assertions(2)
    const mockOnLogoutRequestError = jest.fn()
    mockSetConfig({
      ...createMockConfig(),
      loginAPIEndpoint: 'https://example.com/api/my-login',
      logoutAPIEndpoint: 'https://example.com/api/my-logout',
      onLogoutRequestError: mockOnLogoutRequestError,
    })

    let onIdTokenChangedCallback: OnIdTokenChangeCallback
    mockOnIdTokenChanged.mockImplementation((_, callback) => {
      onIdTokenChangedCallback = callback
      return () => {} // "unsubscribe" function
    })
    const mockFirebaseUser = null
    renderHook(() => useFirebaseUser())

    // Mock that `fetch` returns a non-OK response.
    fetchSpy.mockResolvedValue({
      ...createMockFetchResponse(),
      ok: false,
      status: 500,
    })

    await act(async () => {
      await expect(
        onIdTokenChangedCallback(mockFirebaseUser)
      ).resolves.not.toThrow()
      expect(mockOnLogoutRequestError).toHaveBeenCalledWith(
        new Error('Received 500 response from logout API endpoint: {}')
      )
    })
  })

  it('throws if `fetch` throws when calling the logout endpoint', async () => {
    expect.assertions(1)
    let onIdTokenChangedCallback: OnIdTokenChangeCallback

    // Capture the onIdTokenChanged callback
    mockOnIdTokenChanged.mockImplementation((_, callback) => {
      onIdTokenChangedCallback = callback
      return () => {} // "unsubscribe" function
    })

    const mockFirebaseUser = null
    renderHook(() => useFirebaseUser())

    // Mock that `fetch` returns a non-OK response.
    fetchSpy.mockRejectedValue(new Error('Could not fetch.'))

    await act(async () => {
      await expect(onIdTokenChangedCallback(mockFirebaseUser)).rejects.toThrow(
        'Could not fetch.'
      )
    })
  })

  it('unsubscribes from the Firebase `onIdTokenChanged` event when it unmounts', () => {
    expect.assertions(2)
    const onIdTokenChangedUnsubscribe = jest.fn()
    mockOnIdTokenChanged.mockImplementation(() => onIdTokenChangedUnsubscribe)
    const { unmount } = renderHook(() => useFirebaseUser())
    expect(onIdTokenChangedUnsubscribe).not.toHaveBeenCalled()
    unmount()
    expect(onIdTokenChangedUnsubscribe).toHaveBeenCalled()
  })

  it('does not modify state after it unmounts', async () => {
    expect.assertions(1)

    // If this test fails, we expect a console error from React:
    // "Warning: Can't perform a React state update on an unmounted component".
    const consoleErrorSpy = jest.spyOn(console, 'error')

    // Control when the auth fetch resolves.
    let fetchPromiseResolver: PromiseResolver
    const fetchPromise = () =>
      new Promise((resolve) => {
        fetchPromiseResolver = resolve
      }) as unknown as Promise<Response>
    global.fetch = fetchPromise

    const mockFirebaseUser = createMockFirebaseUserClientSDK()
    const mockFirebaseUserWithClaims = { ...mockFirebaseUser, claims: {} }

    let onIdTokenChangedCallback: OnIdTokenChangeCallback

    // Capture the onIdTokenChanged callback
    mockOnIdTokenChanged.mockImplementation((_, callback) => {
      onIdTokenChangedCallback = callback
      return () => {} // "unsubscribe" function
    })

    // Intercept the getIdToken call
    mockGetIdTokenResult.mockResolvedValue(mockFirebaseUserWithClaims)

    const { unmount } = renderHook(() => useFirebaseUser())
    await act(async () => {
      // Not awaiting.
      onIdTokenChangedCallback(mockFirebaseUser)
    })

    // Resolve the fetch after unmount.
    unmount()

    await act(async () => {
      fetchPromiseResolver(createMockFetchResponse())
    })
    expect(consoleErrorSpy).not.toHaveBeenCalled()
  })

  it('calls "tokenChangedHandler" with user if it is configured', async () => {
    expect.assertions(4)
    const tokenChangedHandler = jest.fn()
    mockSetConfig({
      ...createMockConfig(),
      tokenChangedHandler,
    })

    const mockFirebaseUser = createMockFirebaseUserClientSDK()

    // Intercept the getIdToken call
    const idTokenResult = createMockIdTokenResult()
    mockGetIdTokenResult.mockResolvedValue(idTokenResult)

    let onIdTokenChangedCallback: OnIdTokenChangeCallback

    // Capture the onIdTokenChanged callback
    mockOnIdTokenChanged.mockImplementation((_, callback) => {
      onIdTokenChangedCallback = callback
      return () => {} // "unsubscribe" function
    })

    const mockuser = createUser({
      firebaseUserClientSDK: mockFirebaseUser,
      clientInitialized: true,
    })
    renderHook(() => useFirebaseUser())

    expect(fetch).not.toHaveBeenCalled()
    expect(tokenChangedHandler).not.toHaveBeenCalled()
    await act(async () => {
      await onIdTokenChangedCallback(mockFirebaseUser)
    })
    expect(fetch).not.toHaveBeenCalled()
    const user = {
      ...mockuser,
      getIdToken: expect.any(Function),
      serialize: expect.any(Function),
      signOut: expect.any(Function),
    }
    expect(tokenChangedHandler).toHaveBeenCalledWith(user)
  })

  it('returns "setAuthCookieComplete=false" until the fetch in the default token changed handler resolves', async () => {
    expect.assertions(2)

    // Control when the auth fetch resolves.
    let fetchPromiseResolver: PromiseResolver
    const fetchPromise = () =>
      new Promise((resolve) => {
        fetchPromiseResolver = resolve
      }) as unknown as Promise<Response>
    global.fetch = fetchPromise

    const mockFirebaseUser = createMockFirebaseUserClientSDK()
    const mockFirebaseUserWithClaims = { ...mockFirebaseUser, claims: {} }

    let onIdTokenChangedCallback: OnIdTokenChangeCallback

    // Capture the onIdTokenChanged callback
    mockOnIdTokenChanged.mockImplementation((_, callback) => {
      onIdTokenChangedCallback = callback
      return () => {} // "unsubscribe" function
    })

    // Intercept the getIdToken call
    mockGetIdTokenResult.mockResolvedValue(mockFirebaseUserWithClaims)

    const { result } = renderHook(() => useFirebaseUser())

    await act(async () => {
      // Not awaited. The login `fetch` call has not resolved; that is,
      // auth cookies have not been set.
      onIdTokenChangedCallback(mockFirebaseUser)
    })
    expect(result.current).toEqual({
      user: mockFirebaseUser,
      claims: {},
      initialized: true,
      authRequestCompleted: false,
    })

    await act(async () => {
      // Resolve the login `fetch` call; that is, cookies have (most likely)
      // been set.
      fetchPromiseResolver(createMockFetchResponse())
    })
    expect(result.current).toEqual({
      user: mockFirebaseUser,
      claims: {},
      initialized: true,
      authRequestCompleted: true,
    })
  })

  it('returns "setAuthCookieComplete=false" until the fetch in the custom "tokenChangedHandler" resolves', async () => {
    expect.assertions(2)

    // Control when the tokenChangedHanlder resolves.
    let tokenChangedPromiseResolver: PromiseResolver
    const tokenChangedHandler = jest.fn(
      () =>
        new Promise((resolve) => {
          tokenChangedPromiseResolver = resolve
        })
    )

    mockSetConfig({
      ...createMockConfig(),
      tokenChangedHandler,
    })

    const mockFirebaseUser = createMockFirebaseUserClientSDK()

    // Intercept the getIdToken call
    const idTokenResult = createMockIdTokenResult()
    mockGetIdTokenResult.mockResolvedValue(idTokenResult)

    let onIdTokenChangedCallback: OnIdTokenChangeCallback

    // Capture the onIdTokenChanged callback
    mockOnIdTokenChanged.mockImplementation((_, callback) => {
      onIdTokenChangedCallback = callback
      return () => {} // "unsubscribe" function
    })

    const { result } = renderHook(() => useFirebaseUser())

    await act(async () => {
      // Not awaited. The `tokenChangedHandler` call has not resolved; that is,
      // auth cookies have not been set.
      onIdTokenChangedCallback(mockFirebaseUser)
    })
    expect(result.current).toEqual({
      user: mockFirebaseUser,
      claims: {},
      initialized: true,
      authRequestCompleted: false,
    })

    await act(async () => {
      // Resolve the `tokenChangedHandler` call; that is, cookies have (most
      // likely) been set.
      tokenChangedPromiseResolver(createMockFetchResponse())
    })
    expect(result.current).toEqual({
      user: mockFirebaseUser,
      claims: {},
      initialized: true,
      authRequestCompleted: true,
    })
  })

  it('resets "setAuthCookieComplete" to false when the token changes again', async () => {
    expect.assertions(3)

    const mockFirebaseUser = createMockFirebaseUserClientSDK()
    const mockFirebaseUserWithClaims = { ...mockFirebaseUser, claims: {} }

    let onIdTokenChangedCallback: OnIdTokenChangeCallback

    // Capture the onIdTokenChanged callback
    mockOnIdTokenChanged.mockImplementation((_, callback) => {
      onIdTokenChangedCallback = callback
      return () => {} // "unsubscribe" function
    })

    // Intercept the getIdToken call
    mockGetIdTokenResult.mockResolvedValue(mockFirebaseUserWithClaims)

    const { result } = renderHook(() => useFirebaseUser())

    await act(async () => {
      await onIdTokenChangedCallback(mockFirebaseUser)
    })
    expect(result.current).toEqual({
      user: mockFirebaseUser,
      claims: {},
      initialized: true,
      authRequestCompleted: true,
    })

    // Control when the auth fetch resolves.
    let fetchPromiseResolver: PromiseResolver
    const fetchPromise = () =>
      new Promise((resolve) => {
        fetchPromiseResolver = resolve
      }) as unknown as Promise<Response>
    global.fetch = fetchPromise

    await act(async () => {
      // Not awaited. The `tokenChangedHandler` call has not resolved.
      onIdTokenChangedCallback(mockFirebaseUser)
    })
    expect(result.current).toEqual({
      user: mockFirebaseUser,
      claims: {},
      initialized: true,
      authRequestCompleted: false,
    })

    await act(async () => {
      fetchPromiseResolver(createMockFetchResponse())
    })
    expect(result.current).toEqual({
      user: mockFirebaseUser,
      claims: {},
      initialized: true,
      authRequestCompleted: true,
    })
  })

  it('logs the expected debugging messages logging in with the default tokenChangedHandler', async () => {
    expect.assertions(3)
    mockSetConfig({
      ...createMockConfig(),
    })
    const mockFirebaseUser = createMockFirebaseUserClientSDK()
    const idTokenResult = createMockIdTokenResult()
    mockGetIdTokenResult.mockResolvedValue(idTokenResult)

    let onIdTokenChangedCallback: OnIdTokenChangeCallback
    // Capture the onIdTokenChanged callback
    mockOnIdTokenChanged.mockImplementation((_, callback) => {
      onIdTokenChangedCallback = callback
      return () => {} // "unsubscribe" function
    })
    renderHook(() => useFirebaseUser())

    mockLogDebug.mockClear()
    await act(async () => {
      await onIdTokenChangedCallback(mockFirebaseUser)
    })
    expect(mockLogDebug).toHaveBeenCalledWith(
      '[withUser] The Firebase ID token changed. New Firebase user:',
      expect.any(Object)
    )
    expect(mockLogDebug).toHaveBeenCalledWith(
      '[withUser] Calling the login endpoint.'
    )
    expect(mockLogDebug).toHaveBeenCalledWith(
      '[withUser] Completed the auth API request.'
    )
  })

  it('logs the expected debugging messages when calling the login endpoint fails', async () => {
    expect.assertions(5)
    const mockOnLoginRequestError = jest.fn()
    mockSetConfig({
      ...createMockConfig(),
      loginAPIEndpoint: 'https://example.com/api/my-login',
      logoutAPIEndpoint: 'https://example.com/api/my-logout',
      onLoginRequestError: mockOnLoginRequestError,
    })

    let onIdTokenChangedCallback: OnIdTokenChangeCallback
    mockOnIdTokenChanged.mockImplementation((_, callback) => {
      onIdTokenChangedCallback = callback
      return () => {} // "unsubscribe" function
    })

    const idTokenResult = createMockIdTokenResult()
    mockGetIdTokenResult.mockResolvedValue(idTokenResult)
    const mockFirebaseUser = createMockFirebaseUserClientSDK()
    renderHook(() => useFirebaseUser())

    // Mock that `fetch` returns a non-OK response.
    fetchSpy.mockResolvedValue({
      ...createMockFetchResponse(),
      ok: false,
      status: 500,
      json: async () => ({ not: 'good' }),
    })

    mockLogDebug.mockClear()
    await act(async () => {
      await onIdTokenChangedCallback(mockFirebaseUser)
    })
    expect(mockLogDebug).toHaveBeenCalledWith(
      '[withUser] The Firebase ID token changed. New Firebase user:',
      expect.any(Object)
    )
    expect(mockLogDebug).toHaveBeenCalledWith(
      '[withUser] Calling the login endpoint.'
    )
    expect(mockLogDebug).toHaveBeenCalledWith(
      `[withUser] The call to the login endpoint failed with status 500 and response: ${JSON.stringify(
        { not: 'good' }
      )}`
    )
    expect(mockLogDebug).toHaveBeenCalledWith(
      '[withUser] Completed the auth API request.'
    )
    expect(mockLogDebug).toHaveBeenCalledTimes(4)
  })

  it('logs the expected debugging messages logging out with the default tokenChangedHandler', async () => {
    expect.assertions(4)
    mockSetConfig({
      ...createMockConfig(),
    })
    mockGetIdTokenResult.mockResolvedValue(undefined)

    let onIdTokenChangedCallback: OnIdTokenChangeCallback
    // Capture the onIdTokenChanged callback
    mockOnIdTokenChanged.mockImplementation((_, callback) => {
      onIdTokenChangedCallback = callback
      return () => {} // "unsubscribe" function
    })
    renderHook(() => useFirebaseUser())

    mockLogDebug.mockClear()
    await act(async () => {
      await onIdTokenChangedCallback(null)
    })
    expect(mockLogDebug).toHaveBeenCalledWith(
      '[withUser] The Firebase ID token changed. New Firebase user:',
      null
    )
    expect(mockLogDebug).toHaveBeenCalledWith(
      '[withUser] Calling the logout endpoint.'
    )
    expect(mockLogDebug).toHaveBeenCalledWith(
      '[withUser] Completed the auth API request.'
    )
    expect(mockLogDebug).toHaveBeenCalledTimes(3)
  })

  it('logs the expected debugging messages when calling the logout endpoint fails', async () => {
    expect.assertions(4)
    let onIdTokenChangedCallback: OnIdTokenChangeCallback

    // Capture the onIdTokenChanged callback
    mockOnIdTokenChanged.mockImplementation((_, callback) => {
      onIdTokenChangedCallback = callback
      return () => {} // "unsubscribe" function
    })

    const mockFirebaseUser = null
    renderHook(() => useFirebaseUser())

    // Mock that `fetch` returns a non-OK response.
    fetchSpy.mockResolvedValue({
      ...createMockFetchResponse(),
      ok: false,
      status: 500,
      json: async () => ({ not: 'good' }),
    })

    mockLogDebug.mockClear()
    await act(async () => {
      try {
        await onIdTokenChangedCallback(mockFirebaseUser)
        // We expect this to throw.
        // eslint-disable-next-line no-empty
      } catch (e) {}
    })
    expect(mockLogDebug).toHaveBeenCalledWith(
      '[withUser] The Firebase ID token changed. New Firebase user:',
      null
    )
    expect(mockLogDebug).toHaveBeenCalledWith(
      '[withUser] Calling the logout endpoint.'
    )
    expect(mockLogDebug).toHaveBeenCalledWith(
      `[withUser] The call to the logout endpoint failed with status 500 and response: ${JSON.stringify(
        { not: 'good' }
      )}`
    )
    expect(mockLogDebug).toHaveBeenCalledTimes(3)
  })

  it('logs the expected debugging messages when calling a custom tokenChangedHandler', async () => {
    expect.assertions(6)

    let tokenChangedPromiseResolver: PromiseResolver
    const tokenChangedHandler = jest.fn(
      () =>
        new Promise((resolve) => {
          tokenChangedPromiseResolver = resolve
        })
    )
    mockSetConfig({
      ...createMockConfig(),
      tokenChangedHandler,
    })
    const mockFirebaseUser = createMockFirebaseUserClientSDK()
    const idTokenResult = createMockIdTokenResult()
    mockGetIdTokenResult.mockResolvedValue(idTokenResult)

    let onIdTokenChangedCallback: OnIdTokenChangeCallback
    // Capture the onIdTokenChanged callback
    mockOnIdTokenChanged.mockImplementation((_, callback) => {
      onIdTokenChangedCallback = callback
      return () => {} // "unsubscribe" function
    })

    renderHook(() => useFirebaseUser())

    expect(mockLogDebug).not.toHaveBeenCalled()

    await act(async () => {
      // Not awaited. The `tokenChangedHandler` call has not resolved; that is,
      // auth cookies have not been set.
      onIdTokenChangedCallback(mockFirebaseUser)
    })

    expect(mockLogDebug).toHaveBeenCalledWith(
      '[withUser] The Firebase ID token changed. New Firebase user:',
      expect.any(Object)
    )
    expect(mockLogDebug).toHaveBeenCalledWith(
      '[withUser] Calling the custom "tokenChangedHandler" provided in the config.'
    )

    // Shouldn't be called yet.
    expect(mockLogDebug).not.toHaveBeenCalledWith(
      '[withUser] Completed the auth API request.'
    )

    await act(async () => {
      // Resolve the `tokenChangedHandler` call; that is, cookies have (most
      // likely) been set.
      tokenChangedPromiseResolver(createMockFetchResponse())
    })

    expect(mockLogDebug).toHaveBeenCalledWith(
      '[withUser] Completed the auth API request.'
    )
    expect(mockLogDebug).toHaveBeenCalledTimes(3)
  })
})
