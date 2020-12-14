import React from 'react'
import { withAuthUser } from 'next-firebase-auth'
import FirebaseAuth from '../components/FirebaseAuth'

const Auth = () => (
  <div>
    <p>Sign in</p>
    <div>
      <FirebaseAuth />
    </div>
  </div>
)

// TODO: imrove withAuthUser API
export default withAuthUser({ redirectIfAuthed: true })(Auth)
