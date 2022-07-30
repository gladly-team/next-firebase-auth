// Tests for index.server.js that require resetting all
// modules between tests. Most tests should reside in
// index.server.test.js.

// Allow using the name "mockModuleNotFoundError".
/* eslint-disable new-cap */

jest.mock('react')

afterEach(() => {
  jest.resetModules()
})

describe('index.server.js (resetting modules)', () => {
  it('imports without error when missing optional dependencies', () => {
    expect.assertions(0)

    // Fake that all optional dependencies are not installed.
    const mockModuleNotFoundError =
      require('src/testHelpers/mockModuleNotFoundError').default
    jest.mock('firebase/app', () => {
      throw new mockModuleNotFoundError({
        moduleName: 'firebase/app',
      })
    })
    jest.mock('firebase/auth', () => {
      throw new mockModuleNotFoundError({
        moduleName: 'firebase/auth',
      })
    })
    jest.mock('next', () => {
      throw new mockModuleNotFoundError({
        moduleName: 'next',
      })
    })
    jest.mock('react', () => {
      throw new mockModuleNotFoundError({
        moduleName: 'react',
      })
    })
    jest.mock('react-dom', () => {
      throw new mockModuleNotFoundError({
        moduleName: 'react-dom',
      })
    })

    // eslint-disable-next-line no-unused-expressions
    require('src/index.server').default
  })

  it('throws an error when calling useAuthUser without react installed', () => {
    expect.assertions(1)
    const expectedErr = new Error(
      'The dependency "react" is required when calling `useAuthUser`.'
    )
    const mockModuleNotFoundError =
      require('src/testHelpers/mockModuleNotFoundError').default
    jest.mock('react', () => {
      throw new mockModuleNotFoundError({
        moduleName: 'react',
      })
    })
    const { useAuthUser } = require('src/index.server').default
    expect(() => {
      useAuthUser()
    }).toThrow(expectedErr)
  })
})
