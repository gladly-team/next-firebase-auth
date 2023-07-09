import React from 'react'
import { useUser, withUser, withUserTokenSSR } from 'next-firebase-auth'
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
  const user = useUser()
  return (
    <div>
      <Header email={user.email} signOut={user.signOut} />
      <div style={styles.content}>
        <div style={styles.infoTextContainer}>
          <h3>Home</h3>
          <p>
            This page does not require authentication, so it won't redirect to
            the login page if you are not signed in.
          </p>
          <p>
            If you remove `getServerSideProps` from this page, it will be static
            and load the authed user only on the client side.
          </p>
        </div>
        <DemoPageLinks />
      </div>
    </div>
  )
}

export const getServerSideProps = withUserTokenSSR()()

export default withUser()(Demo)
