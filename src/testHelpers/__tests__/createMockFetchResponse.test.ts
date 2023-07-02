import createMockFetchResponse from 'src/testHelpers/createMockFetchResponse'

describe('mockReq', () => {
  it('returns the expected object', () => {
    expect.assertions(1)
    expect(createMockFetchResponse()).toMatchObject({
      body: expect.any(Object),
      bodyUsed: true,
      headers: {},
      json: expect.any(Function),
      ok: true,
      redirected: false,
      status: 200,
      statusText: '',
      type: 'cors',
      url: 'https://example.com/foo/',
    })
  })
})
