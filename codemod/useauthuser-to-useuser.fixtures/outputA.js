/* eslint-disable import/no-unresolved */
import React from 'react'
import { withAuthUser, useUser } from 'next-firebase-auth'

const Demo = () => {
  const user = useUser()
  return <div>Some content: {user.email}</div>
}

export default withAuthUser()(Demo)
