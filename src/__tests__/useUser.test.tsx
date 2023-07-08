/* eslint-disable @typescript-eslint/no-empty-function */
/* eslint-disable @typescript-eslint/no-var-requires */
/* eslint-disable global-require */
import React from 'react'
import { render } from '@testing-library/react'

afterEach(() => {
  jest.clearAllMocks()
})

describe('userUser', () => {
  test('the AuthUser context is created with an undefined default value', () => {
    expect.assertions(1)
    jest.spyOn(React, 'createContext')
    // eslint-disable-next-line no-unused-expressions
    require('src/useUser').default
    expect(React.createContext).toHaveBeenCalledWith(undefined)
  })

  test('defining the AuthUser context value changes the userUser value', () => {
    expect.assertions(1)
    const { AuthUserContext } = require('src/useUser')
    const userUser = require('src/useUser').default
    let childAuthUserVal
    const TestComp = () => {
      const authUser = userUser()
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

  test('userUser will throw if used without a defined value for AuthUser context', () => {
    expect.assertions(1)
    const userUser = require('src/useUser').default
    const TestComp = () => {
      userUser() // should throw
      return null
    }
    const err = new Error(
      'When using `userUser`, the page must be wrapped in `withUser`.'
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
