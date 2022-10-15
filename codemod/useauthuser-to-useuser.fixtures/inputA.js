/* eslint-disable import/no-unresolved */
import React from 'react'
import { withAuthUser, useAuthUser } from 'next-firebase-auth'

const Demo = () => {
  const user = useAuthUser()
  return <div>Some content: {user.email}</div>
}

export default withAuthUser()(Demo)
