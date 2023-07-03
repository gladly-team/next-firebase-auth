/* eslint-disable import/no-unresolved */
import React from 'react'
import {
  AuthAction,
  withAuthUser,
  withAuthUserTokenSSR,
} from 'next-firebase-auth'

const Demo = () => <div>Some content</div>

export const getServerSideProps = withAuthUserTokenSSR({
  whenUnauthed: AuthAction.REDIRECT_TO_LOGIN,
  // eslint-disable-next-line no-unused-vars
})(async ({ user: AuthUser, req }) => {
  // eslint-disable-next-line no-unused-vars
  const { id } = AuthUser
  return {
    props: {
      foo: 'bar',
    },
  }
})

export default withAuthUser()(Demo)
