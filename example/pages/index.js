import React from 'react'
import {
  useAuthUser,
  withAuthUser,
  withAuthUserTokenSSR,
} from 'next-firebase-auth'
import Header from '../components/Header'

const Demo = () => {
  const AuthUser = useAuthUser()
  return (
    <div>
      <Header email={AuthUser.email} signOut={AuthUser.signOut} />
      <p>
        This page is does not require user auth, so it won't redirect to the
        login page if you are not signed in.
      </p>
      <p>
        If you remove getServerSideProps from this page, the page will be static
        and load the authed user on the client side.
      </p>
    </div>
  )
}

export const getServerSideProps = withAuthUserTokenSSR()()

export default withAuthUser({ authRequired: false })(Demo)
