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
    const { result } = renderHook(() => useFirebaseUser())
    expect(result.current).toEqual({
      user: undefined,
      initialized: false,
    })
  })

  it('returns the Firebase user and initialized=true after the Firebase JS SDK has initialized', () => {
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
})
