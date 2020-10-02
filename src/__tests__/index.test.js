describe('index.js: init', () => {
  it('exports init', () => {
    expect.assertions(2)
    const index = require('src/index')
    expect(index.init).toBeDefined()
    expect(index.init).toEqual(expect.any(Function))
  })
})

describe('index.js: withAuthUser', () => {
  it('exports withAuthUser', () => {
    expect.assertions(2)
    const index = require('src/index')
    expect(index.withAuthUser).toBeDefined()
    expect(index.withAuthUser).toEqual(expect.any(Function))
  })
})

describe('index.js: useAuthUser', () => {
  it('exports useAuthUser', () => {
    expect.assertions(2)
    const index = require('src/index')
    expect(index.useAuthUser).toBeDefined()
    expect(index.useAuthUser).toEqual(expect.any(Function))
  })
})

describe('index.js: withAuthUserSSR', () => {
  it('exports withAuthUserSSR', () => {
    expect.assertions(2)
    const index = require('src/index')
    expect(index.withAuthUserSSR).toBeDefined()
    expect(index.withAuthUserSSR).toEqual(expect.any(Function))
  })
})

describe('index.js: withAuthUserTokenSSR', () => {
  it('exports withAuthUserTokenSSR', () => {
    expect.assertions(2)
    const index = require('src/index')
    expect(index.withAuthUserTokenSSR).toBeDefined()
    expect(index.withAuthUserTokenSSR).toEqual(expect.any(Function))
  })
})

describe('index.js: setAuthCookies', () => {
  it('exports setAuthCookies', () => {
    expect.assertions(2)
    const index = require('src/index')
    expect(index.setAuthCookies).toBeDefined()
    expect(index.setAuthCookies).toEqual(expect.any(Function))
  })
})

describe('index.js: unsetAuthCookies', () => {
  it('exports unsetAuthCookies', () => {
    expect.assertions(2)
    const index = require('src/index')
    expect(index.unsetAuthCookies).toBeDefined()
    expect(index.unsetAuthCookies).toEqual(expect.any(Function))
  })
})
