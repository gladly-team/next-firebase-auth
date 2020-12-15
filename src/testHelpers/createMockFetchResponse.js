const createMockFetchResponse = () => ({
  body: {},
  bodyUsed: true,
  headers: {},
  json: () => Promise.resolve({}),
  ok: true,
  redirected: false,
  status: 200,
  statusText: '',
  type: 'cors',
  url: 'https://example.com/foo/',
})

export default createMockFetchResponse
