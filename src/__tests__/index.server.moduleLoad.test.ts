// Tests for index.server.ts that require resetting all
// modules between tests. Most tests should reside in
// index.server.test.js.
// eslint-disable-next-line jest/no-export
export {}

jest.mock('react')

afterEach(() => {
  jest.resetModules()
})

describe('index.server.ts (resetting modules)', () => {
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
    require('src/index.server')
  })

  it('throws an error when calling useUser without react installed', () => {
    expect.assertions(1)
    const expectedErr = new Error(
      'The dependency "react" is required when calling `useUser`.'
    )
    const MockModuleNotFoundError =
      require('src/testHelpers/mockModuleNotFoundError').default
    jest.mock('react', () => {
      throw new MockModuleNotFoundError({
        moduleName: 'react',
      })
    })
    const { useUser } = require('src/index.server')
    expect(() => {
      useUser()
    }).toThrow(expectedErr)
  })
})
