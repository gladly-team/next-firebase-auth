const createMockFetchResponse = () =>
  ({
    arrayBuffer: '',
    blob: '',
    body: {},
    bodyUsed: true,
    clone: () => null,
    formData: '',
    headers: {} as Headers,
    json: () => Promise.resolve({}),
    ok: true,
    redirected: false,
    status: 200,
    statusText: '',
    text: '',
    type: 'cors' as ResponseType,
    url: 'https://example.com/foo/',
  } as unknown as Response)

export default createMockFetchResponse
