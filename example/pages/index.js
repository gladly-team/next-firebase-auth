import React from 'react'
import Link from 'next/link'
import {
  useAuthUser,
  withAuthUser,
  withAuthUserTokenSSR,
} from 'next-firebase-auth'

const Demo = () => {
  const AuthUser = useAuthUser()
  return (
    <div>
      <p>
        This page is does not require user auth, so it won't redirect to the
        login page if you are not signed in.
      </p>
      <p>
        If you remove getServerSideProps from this page, the page will be static
        and load the authed user on the client side.
      </p>
      {AuthUser.id ? (
        <div>
          <p>
            You're signed in. Email:
            {AuthUser.email}
          </p>
          <button
            type="button"
            onClick={() => {
              AuthUser.signOut()
            }}
          >
            Sign out
          </button>
        </div>
      ) : (
        <p>
          You are not signed in.{' '}
          <Link href="/auth">
            <a>Sign in</a>
          </Link>
        </p>
      )}
    </div>
  )
}

export const getServerSideProps = withAuthUserTokenSSR()()

export default withAuthUser({ authRequired: false })(Demo)
