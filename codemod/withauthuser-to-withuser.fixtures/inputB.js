/* eslint-disable import/no-unresolved */
import React from 'react'

// Test renamed and multiple imports
import { withAuthUser as includeUser, useAuthUser } from 'next-firebase-auth'

const Demo = () => {
  const user = useAuthUser()
  return <div>Some content: {user.email}</div>
}

export default includeUser()(Demo)
