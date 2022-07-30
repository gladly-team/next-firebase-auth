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

function mockModuleNotFoundError({
  moduleName,
  callingModule = 'exampleModule.js',
}) {
  this.name = 'ModuleNotFoundError'
  this.code = 'MODULE_NOT_FOUND'
  this.message = `Cannot find module '${moduleName}' from '${callingModule}'`
}
mockModuleNotFoundError.prototype = Error.prototype

afterEach(() => {
  jest.resetModules()
})

describe('withAuthUser (resetting module)', () => {
  it('runs without error by default', () => {
    expect.assertions(1)
    const withAuthUser = require('src/withAuthUser').default
    expect(() => {
      withAuthUser()(MockComponent)
    }).not.toThrow()
  })

  it('imports without error when missing required dependencies', () => {
    expect.assertions(0)

    // Fake that the module is not installed.
    jest.mock('react', () => {
      throw new mockModuleNotFoundError({
        moduleName: 'react',
      })
    })

    // eslint-disable-next-line no-unused-expressions
    require('src/withAuthUser').default
  })

  it('throws the expected error if the "react" package is not importable', () => {
    expect.assertions(1)
    const expectedErr = new Error(
      'The dependencies "react" and "next" are required when calling `withAuthUser`.'
    )
    jest.mock('react', () => {
      throw new mockModuleNotFoundError({
        moduleName: 'react',
      })
    })

    const withAuthUser = require('src/withAuthUser').default
    expect(() => {
      withAuthUser()(MockComponent)
    }).toThrow(expectedErr)
  })

  it('throws the expected error if the "next" package is not importable', () => {
    expect.assertions(1)
    const expectedErr = new Error(
      'The dependencies "react" and "next" are required when calling `withAuthUser`.'
    )
    jest.mock('next', () => {
      throw new mockModuleNotFoundError({
        moduleName: 'next',
      })
    })

    const withAuthUser = require('src/withAuthUser').default
    expect(() => {
      withAuthUser()(MockComponent)
    }).toThrow(expectedErr)
  })

  it('throws any unexpected error if requiring optional packages throws something other than ModuleNotFoundError', () => {
    expect.assertions(1)
    jest.mock('react', () => {
      throw new Error('Something else.')
    })
    const withAuthUser = require('src/withAuthUser').default
    expect(() => {
      withAuthUser()(MockComponent)
    }).toThrow(new Error('Something else.'))
  })
})
