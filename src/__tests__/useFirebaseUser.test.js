import { renderHook } from '@testing-library/react-hooks'
import useFirebaseUser from 'src/useFirebaseUser'

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
})
