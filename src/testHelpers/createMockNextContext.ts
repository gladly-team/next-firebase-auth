// https://nextjs.org/docs/api-reference/data-fetching/getInitialProps#context-object
const createMockNextContext = ({ serverSide = true } = {}) => ({
  query: {
    abc: 'def',
    pathname: '/my-path',
  },
  asPath: '/my-path?abc=def',
  req: serverSide ? {} : undefined,
  res: serverSide ? {} : undefined,
  err: undefined,
})

export default createMockNextContext
