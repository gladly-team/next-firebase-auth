describe('index.js: fetchAds', () => {
  it('exports todo', () => {
    expect.assertions(2)
    const index = require('src/index')
    expect(index.todo).toBeDefined()
    expect(index.todo).toEqual(expect.any(Function))
  })
})
