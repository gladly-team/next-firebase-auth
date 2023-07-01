// https://nextjs.org/docs/api-reference/data-fetching/getInitialProps#context-object
const createMockNextContext = ({ serverSide = true } = {}) => ({
  pathname: '/my-path',
  query: {
    abc: 'def',
  },
  asPath: '/my-path?abc=def',
  req: serverSide ? {} : undefined,
  res: serverSide ? {} : undefined,
  err: undefined,
})

export default createMockNextContext
