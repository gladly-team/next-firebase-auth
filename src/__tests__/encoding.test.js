describe('encoding', () => {
  it('returns the expected encoded value', () => {
    expect.assertions(1)
    const { encodeBase64 } = require('src/encoding')
    expect(encodeBase64('something')).toEqual('InNvbWV0aGluZyI=')
  })

  it('returns the expected encoded value with special characters', () => {
    expect.assertions(1)
    const { encodeBase64 } = require('src/encoding')
    expect(encodeBase64('$89ce/""))<?')).toEqual('IiQ4OWNlL1wiXCIpKTw/Ig==')
  })

  it('returns the expected decoded value', () => {
    expect.assertions(1)
    const { decodeBase64 } = require('src/encoding')
    expect(decodeBase64('ImhlbGxvIHdvcmxkIg==')).toEqual('hello world')
  })

  it('encodes and decodes back to the original value', () => {
    expect.assertions(1)
    const originalVal = 'my value'
    const { encodeBase64, decodeBase64 } = require('src/encoding')
    expect(decodeBase64(encodeBase64(originalVal))).toEqual(originalVal)
  })
})
