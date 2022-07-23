// const React = require('react')

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

describe('withAuthUser (resetting module)', () => {
  it('runs without error by default', () => {
    expect.assertions(1)
    const withAuthUser = require('src/withAuthUser').default
    expect(() => {
      withAuthUser()(MockComponent)
    }).not.toThrow()
  })

  // FIXME
  it('throws the expected error if the "react" package is not importable', () => {
    expect.assertions(1)
    const expectedErr = new Error(
      'The dependencies "react" and "next" are required when calling `withAuthUser`.'
    )
    jest.setMock('react')
    const withAuthUser = require('src/withAuthUser').default
    expect(() => {
      withAuthUser()(MockComponent)
    }).toThrow(expectedErr)
  })
})
