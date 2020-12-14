import firebase from 'firebase/app'
import { renderHook, act } from '@testing-library/react-hooks'
import useFirebaseUser from 'src/useFirebaseUser'
import { getMockFirebaseUserClientSDK } from 'src/testHelpers/authUserInputs'

jest.mock('firebase/auth')
jest.mock('firebase/app')

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

  it('returns the Firebase user and initialized=true after the Firebase JS SDK has initialized', () => {
    expect.assertions(1)

    // Capture the onIdTokenChanged callback.
    let onIdTokenChangedCallback
    firebase.auth().onIdTokenChanged.mockImplementation((callback) => {
      onIdTokenChangedCallback = callback
      return () => {} // "unsubscribe" function
    })
    const mockFirebaseUser = getMockFirebaseUserClientSDK()
    const { result } = renderHook(() => useFirebaseUser())

    act(() => {
      // Mock that Firebase calls onIdTokenChanged.
      onIdTokenChangedCallback(mockFirebaseUser)
    })
    expect(result.current).toEqual({
      user: mockFirebaseUser,
      initialized: true,
    })
  })

  it('unsubscribes from the Firebase event when it unmounts', () => {
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
})
