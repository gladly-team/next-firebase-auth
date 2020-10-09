/* eslint no-console: 0 */
jest.mock('src/isClientSide')

beforeEach(() => {
  const isClientSide = require('src/isClientSide').default
  isClientSide.mockReturnValue(true)
  jest.spyOn(console, 'log').mockImplementation(jest.fn())
})

afterEach(() => {
  jest.clearAllMocks()
  jest.resetModules()
})

const styledPrefix = [
  '%cnext-firebase-auth',
  'background: #ffa000; color: #fff; border-radius: 2px; padding: 2px 6px',
]

const unstyledPrefix = ['next-firebase-auth:']

describe('logDebug', () => {
  it('logs a message with a styled prefix when debug logging is enabled on the client side', () => {
    expect.assertions(1)
    jest.spyOn(console, 'log').mockImplementation(jest.fn())
    const logDebug = require('src/logDebug').default
    const { setDebugEnabled } = require('src/logDebug')
    setDebugEnabled(true)
    logDebug('hi there')
    expect(console.log).toHaveBeenCalledWith(...styledPrefix, 'hi there')
  })

  it('logs a message with an unstyled prefix when debug logging is enabled on the client side', () => {
    expect.assertions(1)
    jest.spyOn(console, 'log').mockImplementation(jest.fn())
    const isClientSide = require('src/isClientSide').default
    isClientSide.mockReturnValue(false)
    const logDebug = require('src/logDebug').default
    const { setDebugEnabled } = require('src/logDebug')
    setDebugEnabled(true)
    logDebug('hi there')
    expect(console.log).toHaveBeenCalledWith(...unstyledPrefix, 'hi there')
  })

  it('does not log anything when debug logging is not enabled', () => {
    expect.assertions(1)
    jest.spyOn(console, 'log').mockImplementation(jest.fn())
    const logDebug = require('src/logDebug').default
    const { setDebugEnabled } = require('src/logDebug')
    setDebugEnabled(false)
    logDebug('hi there')
    expect(console.log).not.toHaveBeenCalled()
  })

  it('logs a message with multiple arguments', () => {
    expect.assertions(1)
    jest.spyOn(console, 'log').mockImplementation(jest.fn())
    const logDebug = require('src/logDebug').default
    const { setDebugEnabled } = require('src/logDebug')
    setDebugEnabled(true)
    logDebug('hi there', [1, 2, 3], { foo: 'bar' })
    expect(console.log).toHaveBeenCalledWith(
      ...styledPrefix,
      'hi there',
      [1, 2, 3],
      {
        foo: 'bar',
      }
    )
  })
})
