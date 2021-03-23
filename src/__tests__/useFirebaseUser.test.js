import firebase from 'firebase/app'
import { renderHook, act } from '@testing-library/react-hooks'
import useFirebaseUser from 'src/useFirebaseUser'
import { createMockFirebaseUserClientSDK } from 'src/testHelpers/authUserInputs'
import createMockFetchResponse from 'src/testHelpers/createMockFetchResponse'
import { setConfig } from 'src/config'
import createMockConfig from 'src/testHelpers/createMockConfig'
import createAuthUser from 'src/createAuthUser'

jest.mock('firebase/auth')
jest.mock('firebase/app')
jest.mock('src/config')

beforeEach(() => {
  // `fetch` is polyfilled by Next.js.
  global.fetch = jest.fn(() => Promise.resolve(createMockFetchResponse()))

  setConfig({
    ...createMockConfig(),
    loginAPIEndpoint: 'https://example.com/api/my-login',
    logoutAPIEndpoint: 'https://example.com/api/my-logout',
  })
})

afterEach(() => {
  jest.clearAllMocks()
})

describe('useFirebaseUser', () => {
  it('returns an undefined user and initialized=false before the Firebase JS SDK has initialized', () => {
    expect.assertions(1)
    const { result } = renderHook(() => useFirebaseUser())
    expect(result.current).toEqual({
      user: undefined,
      initialized: false,
    })
  })

  it('returns the Firebase user and initialized=true after the Firebase JS SDK calls `onIdTokenChanged`', async () => {
    expect.assertions(1)

    const mockFirebaseUser = createMockFirebaseUserClientSDK()
    const mockFirebaseUserWithClaims = { ...mockFirebaseUser, claims: {} }

    let onIdTokenChangedCallback

    // Capture the onIdTokenChanged callback
    const onIdTokenChanged = jest.fn((callback) => {
      onIdTokenChangedCallback = callback
      return () => {} // "unsubscribe" function
    })

    // Intercept the getIdToken call
    const getIdTokenResult = jest.fn(async () => mockFirebaseUserWithClaims)

    jest.spyOn(firebase, 'auth').mockImplementation(() => ({
      currentUser: { getIdTokenResult },
      onIdTokenChanged,
    }))

    const { result } = renderHook(() => useFirebaseUser())

    await act(async () => {
      // Mock that Firebase calls onIdTokenChanged.
      await onIdTokenChangedCallback(mockFirebaseUser)
    })
    expect(result.current).toEqual({
      user: { ...mockFirebaseUser, claims: {} },
      initialized: true,
    })
  })

  it('calls the login endpoint as expected when the Firebase JS SDK calls `onIdTokenChanged` with an authed user value', async () => {
    expect.assertions(2)

    const mockToken = 'my-token-here'
    const mockFirebaseUser = {
      ...createMockFirebaseUserClientSDK(),
      getIdToken: async () => mockToken,
    }
    const mockFirebaseUserWithClaims = {
      ...mockFirebaseUser,
      claims: {},
    }

    let onIdTokenChangedCallback
    // Capture the onIdTokenChanged callback
    const onIdTokenChanged = jest.fn((callback) => {
      onIdTokenChangedCallback = callback
      return () => {} // "unsubscribe" function
    })

    // Intercept the getIdToken call
    const getIdTokenResult = jest.fn(async () => mockFirebaseUserWithClaims)

    jest.spyOn(firebase, 'auth').mockImplementation(() => ({
      currentUser: { getIdTokenResult },
      onIdTokenChanged,
    }))

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
    let onIdTokenChangedCallback
    const onIdTokenChanged = jest.fn((callback) => {
      onIdTokenChangedCallback = callback
      return () => {} // "unsubscribe" function
    })

    // Intercept the getIdToken call
    const getIdTokenResult = jest.fn()

    jest.spyOn(firebase, 'auth').mockImplementation(() => ({
      currentUser: { getIdTokenResult },
      onIdTokenChanged,
    }))
    firebase.auth().onIdTokenChanged.mockImplementation((callback) => {
      onIdTokenChangedCallback = callback
      return () => {} // "unsubscribe" function
    })
    const mockFirebaseUser = undefined
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
    let onIdTokenChangedCallback
    firebase.auth().onIdTokenChanged.mockImplementation((callback) => {
      onIdTokenChangedCallback = callback
      return () => {} // "unsubscribe" function
    })
    const mockFirebaseUser = createMockFirebaseUserClientSDK()
    renderHook(() => useFirebaseUser())

    // Mock that `fetch` returns a non-OK response.
    global.fetch.mockResolvedValue({
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

  it('throws if `fetch` throws when calling the login endpoint', async () => {
    expect.assertions(1)
    let onIdTokenChangedCallback
    firebase.auth().onIdTokenChanged.mockImplementation((callback) => {
      onIdTokenChangedCallback = callback
      return () => {} // "unsubscribe" function
    })
    const mockFirebaseUser = createMockFirebaseUserClientSDK()
    renderHook(() => useFirebaseUser())

    // Mock that `fetch` returns a non-OK response.
    global.fetch.mockRejectedValue(new Error('Could not fetch.'))

    await act(async () => {
      await expect(onIdTokenChangedCallback(mockFirebaseUser)).rejects.toThrow(
        'Could not fetch.'
      )
    })
  })

  it('throws if `fetch`ing the logout endpoint does not return an OK response', async () => {
    expect.assertions(1)
    let onIdTokenChangedCallback
    firebase.auth().onIdTokenChanged.mockImplementation((callback) => {
      onIdTokenChangedCallback = callback
      return () => {} // "unsubscribe" function
    })
    const mockFirebaseUser = undefined
    renderHook(() => useFirebaseUser())

    // Mock that `fetch` returns a non-OK response.
    global.fetch.mockResolvedValue({
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

  it('throws if `fetch` throws when calling the logout endpoint', async () => {
    expect.assertions(1)
    let onIdTokenChangedCallback
    firebase.auth().onIdTokenChanged.mockImplementation((callback) => {
      onIdTokenChangedCallback = callback
      return () => {} // "unsubscribe" function
    })
    const mockFirebaseUser = undefined
    renderHook(() => useFirebaseUser())

    // Mock that `fetch` returns a non-OK response.
    global.fetch.mockRejectedValue(new Error('Could not fetch.'))

    await act(async () => {
      await expect(onIdTokenChangedCallback(mockFirebaseUser)).rejects.toThrow(
        'Could not fetch.'
      )
    })
  })

  it('unsubscribes from the Firebase `onIdTokenChanged` event when it unmounts', () => {
    expect.assertions(2)
    const onIdTokenChangedUnsubscribe = jest.fn()
    firebase
      .auth()
      .onIdTokenChanged.mockImplementation(() => onIdTokenChangedUnsubscribe)
    const { unmount } = renderHook(() => useFirebaseUser())
    expect(onIdTokenChangedUnsubscribe).not.toHaveBeenCalled()
    unmount()
    expect(onIdTokenChangedUnsubscribe).toHaveBeenCalled()
  })

  it('calls "tokenChangedHandler" with AuthUser if it is configured', async () => {
    expect.assertions(4)
    const tokenChangedHandler = jest.fn()
    setConfig({
      ...createMockConfig(),
      tokenChangedHandler,
    })

    const mockToken = 'my-token-here'
    const mockFirebaseUser = {
      ...createMockFirebaseUserClientSDK(),
      getIdToken: async () => mockToken,
    }
    const mockFirebaseUserWithClaims = {
      ...mockFirebaseUser,
      claims: {},
    }

    let onIdTokenChangedCallback
    // Capture the onIdTokenChanged callback
    const onIdTokenChanged = jest.fn((callback) => {
      onIdTokenChangedCallback = callback
      return () => {} // "unsubscribe" function
    })

    // Intercept the getIdToken call
    const getIdTokenResult = jest.fn(async () => mockFirebaseUserWithClaims)

    jest.spyOn(firebase, 'auth').mockImplementation(() => ({
      currentUser: { getIdTokenResult },
      onIdTokenChanged,
    }))

    const mockAuthUser = createAuthUser({
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
    expect(tokenChangedHandler).toHaveBeenCalledWith({
      ...mockAuthUser,
      getIdToken: expect.any(Function),
      serialize: expect.any(Function),
      signOut: expect.any(Function),
    })
  })
})
