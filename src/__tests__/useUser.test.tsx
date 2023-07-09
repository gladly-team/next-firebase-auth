/* eslint-disable @typescript-eslint/no-empty-function */
/* eslint-disable @typescript-eslint/no-var-requires */
/* eslint-disable global-require */
import React from 'react'
import { render } from '@testing-library/react'

afterEach(() => {
  jest.clearAllMocks()
})

describe('useUser', () => {
  test('the user context is created with an undefined default value', () => {
    expect.assertions(1)
    jest.spyOn(React, 'createContext')
    // eslint-disable-next-line no-unused-expressions
    require('src/useUser').default
    expect(React.createContext).toHaveBeenCalledWith(undefined)
  })

  test('defining the user context value changes the useUser value', () => {
    expect.assertions(1)
    const { UserContext } = require('src/useUser')
    const useUser = require('src/useUser').default
    let childUserVal
    const TestComp = () => {
      const user = useUser()
      childUserVal = user
      return null
    }
    render(
      <UserContext.Provider value="some fake value">
        <TestComp />
      </UserContext.Provider>
    )
    expect(childUserVal).toEqual('some fake value')
  })

  test('useUser will throw if used without a defined value for user context', () => {
    expect.assertions(1)
    const useUser = require('src/useUser').default
    const TestComp = () => {
      useUser() // should throw
      return null
    }
    const err = new Error(
      'When using `useUser`, the page must be wrapped in `withUser`.'
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
