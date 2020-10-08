import createAuthUser from 'src/createAuthUser'

// An auth wrapper for a page's exported getServerSideProps.
// See this discussion on how best to use getServerSideProps
// with a higher-order component pattern:
// https://github.com/vercel/next.js/discussions/10925#discussioncomment-12471
const withAuthUserTokenSSR = ({ authRequired = false } = {}) => (
  getServerSidePropsFunc
) => {
  return async (ctx) => {
    // TODO: remove eslint comment
    // eslint-disable-next-line no-unused-vars
    const { req, res } = ctx

    // Get the user's token from their cookie, verify it (refreshing
    // as needed), and return the AuthUser object in props.
    // TODO
    const mockFirebaseAdminUser = {
      uid: 'abc',
      email: 'abc@example.com',
      email_verified: true,
    }
    const mockToken = 'some-token-abc'

    const AuthUser = createAuthUser({
      firebaseUserAdminSDK: mockFirebaseAdminUser,
      token: mockToken,
    })
    const AuthUserSerialized = AuthUser.serialize()

    // If auth is required but the user is not authed, don't return
    // any props.
    // Ideally, this should redirect on the server-side. See this
    // RFC on supporting redirects from getServerSideProps:
    // https://github.com/vercel/next.js/discussions/14890
    if (!AuthUser.id && authRequired) {
      return { props: {} }
    }

    // Evaluate the composed getServerSideProps().
    let composedProps = {}
    if (getServerSidePropsFunc) {
      // Add the AuthUser to Next.js context so pages can use
      // it in `getServerSideProps`, if needed.
      ctx.AuthUser = AuthUser
      composedProps = await getServerSidePropsFunc(ctx)
    }
    return {
      props: {
        AuthUserSerialized,
        ...composedProps,
      },
    }
  }
}

export default withAuthUserTokenSSR
