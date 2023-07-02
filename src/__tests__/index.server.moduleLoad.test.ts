// Tests for index.server.js that require resetting all
// modules between tests. Most tests should reside in
// index.server.test.js.
// eslint-disable-next-line jest/no-export
export {}

jest.mock('react')

afterEach(() => {
  jest.resetModules()
})

describe('index.server.js (resetting modules)', () => {
  it('imports without error when missing optional dependencies', () => {
    expect.assertions(0)

    // Fake that all optional dependencies are not installed.
    const MockModuleNotFoundError =
      require('src/testHelpers/mockModuleNotFoundError').default
    jest.mock('firebase/app', () => {
      throw new MockModuleNotFoundError({
        moduleName: 'firebase/app',
      })
    })
    jest.mock('firebase/auth', () => {
      throw new MockModuleNotFoundError({
        moduleName: 'firebase/auth',
      })
    })
    jest.mock('next', () => {
      throw new MockModuleNotFoundError({
        moduleName: 'next',
      })
    })
    jest.mock('react', () => {
      throw new MockModuleNotFoundError({
        moduleName: 'react',
      })
    })
    jest.mock('react-dom', () => {
      throw new MockModuleNotFoundError({
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
    const MockModuleNotFoundError =
      require('src/testHelpers/mockModuleNotFoundError').default
    jest.mock('react', () => {
      throw new MockModuleNotFoundError({
        moduleName: 'react',
      })
    })
    const { useAuthUser } = require('src/index.server').default
    expect(() => {
      useAuthUser()
    }).toThrow(expectedErr)
  })
})
