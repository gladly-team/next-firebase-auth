/* eslint-disable @typescript-eslint/no-empty-function */
/* eslint-disable @typescript-eslint/no-var-requires */
/* eslint-disable global-require */
import React from 'react'
import { render } from '@testing-library/react'

afterEach(() => {
  jest.clearAllMocks()
})

describe('useAuthUser', () => {
  test('the AuthUser context is created with an undefined default value', () => {
    expect.assertions(1)
    jest.spyOn(React, 'createContext')
    // eslint-disable-next-line no-unused-expressions
    require('src/useAuthUser').default
    expect(React.createContext).toHaveBeenCalledWith(undefined)
  })

  test('defining the AuthUser context value changes the useAuthUser value', () => {
    expect.assertions(1)
    const { AuthUserContext } = require('src/useAuthUser')
    const useAuthUser = require('src/useAuthUser').default
    let childAuthUserVal
    const TestComp = () => {
      const authUser = useAuthUser()
      childAuthUserVal = authUser
      return null
    }
    render(
      <AuthUserContext.Provider value="some fake value">
        <TestComp />
      </AuthUserContext.Provider>
    )
    expect(childAuthUserVal).toEqual('some fake value')
  })

  test('useAuthUser will throw if used without a defined value for AuthUser context', () => {
    expect.assertions(1)
    const useAuthUser = require('src/useAuthUser').default
    const TestComp = () => {
      useAuthUser() // should throw
      return null
    }
    const err = new Error(
      'When using `useAuthUser`, the page must be wrapped in `withAuthUser`.'
    )
    // Suppress expected error logs.
    jest
      .spyOn(console, 'error')
      .mockImplementationOnce(() => {})
      .mockImplementationOnce(() => {})
      .mockImplementationOnce(() => {})
    expect(() => {
      render(<TestComp />)
    }).toThrow(err)
  })
})
