/* eslint no-console: 0 */
const prefix = [
  '%cnext-firebase-auth',
  'background: #ffa000; color: #fff; border-radius: 2px; padding: 2px 6px',
]

afterEach(() => {
  jest.clearAllMocks()
})

describe('logDebug', () => {
  it('logs a message with a prefix', () => {
    expect.assertions(1)
    jest.spyOn(console, 'log').mockImplementationOnce(jest.fn())
    const logDebug = require('src/logDebug').default
    logDebug('hi there')
    expect(console.log).toHaveBeenCalledWith(...prefix, 'hi there')
  })

  it('logs a message with multiple arguments', () => {
    expect.assertions(1)
    jest.spyOn(console, 'log').mockImplementationOnce(jest.fn())
    const logDebug = require('src/logDebug').default
    logDebug('hi there', [1, 2, 3], { foo: 'bar' })
    expect(console.log).toHaveBeenCalledWith(...prefix, 'hi there', [1, 2, 3], {
      foo: 'bar',
    })
  })
})
