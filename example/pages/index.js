import React from 'react'
import {
  useAuthUser,
  withAuthUser,
  withAuthUserTokenSSR,
} from 'next-firebase-auth'
import { getApp } from 'firebase-admin/app'
// import { getFirestore } from 'firebase-admin/firestore'
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

// eslint-disable-next-line arrow-body-style
export const getServerSideProps = withAuthUserTokenSSR()(async () => {
  const app = getApp()
  // eslint-disable-next-line no-unused-vars
  // const firestore = getFirestore()
  return {
    props: {},
  }
})

export default withAuthUser()(Demo)
