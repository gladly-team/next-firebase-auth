import React from 'react'
import {
  useAuthUser,
  withAuthUser,
  withAuthUserTokenSSR,
  AuthAction,
} from 'next-firebase-auth'
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

const Demo = () => {
  const AuthUser = useAuthUser()
  return (
    <div>
      <Header email={AuthUser.email} signOut={AuthUser.signOut} />
      <div style={styles.content}>
        <div style={styles.infoTextContainer}>
          <h3>Example: SSR</h3>
          <p>
            This page requires authentication. It will do a server-side redirect
            (307) to the login page if the auth cookies are not set.
          </p>
        </div>
        <DemoPageLinks />
      </div>
    </div>
  )
}

export const getServerSideProps = withAuthUserTokenSSR({
  whenUnauthed: AuthAction.REDIRECT_TO_LOGIN,
})()

export default withAuthUser({
  whenUnauthedBeforeInit: AuthAction.REDIRECT_TO_LOGIN,
  whenUnauthedAfterInit: AuthAction.REDIRECT_TO_LOGIN,
})(Demo)
