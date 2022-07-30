import getUserFromCookies from 'src/getUserFromCookies'

afterEach(() => {
  jest.clearAllMocks()
})

describe('getUserFromCookies', () => {
  // TODO
  it('returns the expected user from a request object', async () => {
    expect.assertions(1)
    const req = {} // TODO
    const user = await getUserFromCookies({ req })
    expect(user).toEqual({})
  })
})
