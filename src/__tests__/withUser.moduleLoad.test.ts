// Tests for withUser.js that require resetting all
// modules between tests. Most tests should reside in
// withUser.test.js.

// eslint-disable-next-line jest/no-export
export {}

// Allow using the name "mockModuleNotFoundError".
/* eslint-disable new-cap */
jest.mock('react')
const mockRouterPush = jest.fn()
const mockRouterReplace = jest.fn()
jest.mock('next/router', () => ({
  useRouter: () => ({ push: mockRouterPush, replace: mockRouterReplace }),
}))
jest.mock('src/useFirebaseUser')
jest.mock('src/isClientSide')
jest.mock('src/logDebug')

const MockComponent = () => null

afterEach(() => {
  jest.resetModules()
})

describe('withUser (resetting modules)', () => {
  it('runs without error by default', () => {
    expect.assertions(1)
    const withUser = require('src/withUser').default
    expect(() => {
      withUser()(MockComponent)
    }).not.toThrow()
  })

  it('imports without error when missing required dependencies', () => {
    expect.assertions(0)

    // Fake that the module is not installed.
    const mockModuleNotFoundError =
      require('src/testHelpers/mockModuleNotFoundError').default
    jest.mock('react', () => {
      throw new mockModuleNotFoundError({
        moduleName: 'react',
      })
    })

    // eslint-disable-next-line no-unused-expressions
    require('src/withUser').default
  })

  it('throws the expected error if the "react" package is not importable', () => {
    expect.assertions(1)
    const expectedErr = new Error(
      'The dependencies "react" and "next" are required when calling `withUser`.'
    )
    const mockModuleNotFoundError =
      require('src/testHelpers/mockModuleNotFoundError').default
    jest.mock('react', () => {
      throw new mockModuleNotFoundError({
        moduleName: 'react',
      })
    })

    const withUser = require('src/withUser').default
    expect(() => {
      withUser()(MockComponent)
    }).toThrow(expectedErr)
  })

  it('throws the expected error if the "next" package is not importable', () => {
    expect.assertions(1)
    const expectedErr = new Error(
      'The dependencies "react" and "next" are required when calling `withUser`.'
    )
    const mockModuleNotFoundError =
      require('src/testHelpers/mockModuleNotFoundError').default
    jest.mock('next', () => {
      throw new mockModuleNotFoundError({
        moduleName: 'next',
      })
    })

    const withUser = require('src/withUser').default
    expect(() => {
      withUser()(MockComponent)
    }).toThrow(expectedErr)
  })

  it('throws any unexpected error if requiring optional packages throws something other than ModuleNotFoundError', () => {
    expect.assertions(1)
    jest.mock('react', () => {
      throw new Error('Something else.')
    })
    const withUser = require('src/withUser').default
    expect(() => {
      withUser()(MockComponent)
    }).toThrow(new Error('Something else.'))
  })
})
