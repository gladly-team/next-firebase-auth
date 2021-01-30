import React from 'react'
import { useAuthUser, withAuthUser, withAuthUserSSR } from 'next-firebase-auth'
import Header from '../components/Header'
import DemoPageLinks from '../components/DemoPageLinks'

const styles = {
  content: {
    padding: 32,
  },
  infoTextContainer: {
    marginBottom: 32,
  },
}

const Demo = ({ emailVerified }) => {
  const AuthUser = useAuthUser()
  return (
    <div>
      <Header email={AuthUser.email} signOut={AuthUser.signOut} />
      <div style={styles.content}>
        <div style={styles.infoTextContainer}>
          <h3>Example: SSR + custom routing</h3>
          <p>
            This page requires authentication. It will do a{' '}
            <strong>custom/dynamic</strong>
            server-side redirect (307) to the login page if the user is not
            authenticated.
          </p>
          <p>
            The custom logic also does the following (which does not actually
            work, it's only for the purpose of illustrating what can be done):
            <ul>
              <li>
                If authenticated, but no email, it will generate a 404 page.
              </li>
              <li>
                If authenticated, but email is not verified, it performs a
                custom redirect to the login page and injects query parameters
                in the URL.
              </li>
            </ul>
          </p>
          <p>
            This page leverages the standard `redirect` and 'notFound' objects
            returned by `getServerSideProps` to perform the custom routing.
          </p>
          <p>User's email is verified: {emailVerified ? 'yes' : 'no'}</p>
        </div>
        <DemoPageLinks />
      </div>
    </div>
  )
}

// Here we don't rely on the built-in REDIRECT_TO_LOGIN option of
// withAuthUserSSR, we do custom checks on the AuthUser and dynamic routing accordingly.
export const getServerSideProps = withAuthUserSSR()(async (ctx) => {
  // Retrieve AuthUser (that was injected by withAuthUserSSR) from the context.
  const { AuthUser } = ctx
  // If the user is not authenticated at all, do a simple custom redirect
  // to login page (equivalent to REDIRECT_TO_LOGIN parameter of withAuthUserSSR).
  if (!AuthUser || !AuthUser.id) {
    return {
      redirect: {
        destination: '/login',
        permanent: false,
      },
    }
  }
  // If the user is authenticated but has no email, let's assume that's a
  // big crime for the app, so display a 404 page.
  if (!AuthUser.email) {
    return {
      notFound: true,
    }
  }
  // If the user is authenticated, has an email, but the email is not verified,
  // we perform a custom redirect to the login page and inject query parameters
  // that the login page must handle.
  if (!AuthUser.emailVerified) {
    return {
      redirect: {
        destination: `/login?verifyEmail=true&thenGoToPage=${encodeURIComponent(
          ctx.resolvedUrl
        )}`,
        permanent: false,
      },
    }
  }
  // And finally if everything is OK, we return a props object as usual.
  return {
    props: {
      email: AuthUser.email,
      emailVerified: AuthUser.emailVerified,
      someOtherProp: 'any other data can be added',
    },
  }
})

export default withAuthUser()(Demo)
