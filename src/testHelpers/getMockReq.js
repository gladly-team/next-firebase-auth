/* eslint-env jest */

/**
 * Return a mock HTTP request object for testing. It is an
 * incomplete set of values.
 * @return {Object}
 */
const getMockReq = () => ({
  readable: true,
  socket: {},
  connection: {},
  httpVersionMajor: 1,
  httpVersionMinor: 1,
  httpVersion: '1.1',
  complete: true,
  headers: {
    host: 'example.com',
    connection: 'keep-alive',
    'cache-control': 'max-age=0',
    'upgrade-insecure-requests': '1',
    'user-agent':
      'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_4) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/83.0.4103.23 Safari/537.36',
    accept:
      'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.9',
    'sec-fetch-site': 'same-origin',
    'sec-fetch-mode': 'navigate',
    'sec-fetch-user': '?1',
    'sec-fetch-dest': 'document',
    referer: 'https://example.com/some-page/',
    'accept-encoding': 'gzip, deflate, br',
    'accept-language': 'en-US,en;q=0.9,es;q=0.8,es-419;q=0.7',
    cookie: 'someCookie=foo; somethingElse=bar',
  },
  rawHeaders: {
    // stuff here
  },
  trailers: {},
  rawTrailers: {},
  aborted: false,
  upgrade: false,
  url: '/some-page/',
  method: 'GET',
  statusCode: null,
  statusMessage: null,
  client: {
    // stuff here
  },
})

export default getMockReq
