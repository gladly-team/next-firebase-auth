import React from 'react'
import { withAuthUser } from 'next-firebase-auth'
import FirebaseAuth from '../components/FirebaseAuth'

const styles = {
  content: {
    padding: `8px 32px`,
  },
  textContainer: {
    display: 'flex',
    justifyContent: 'center',
    margin: 16,
  },
}

const Auth = () => (
  <div style={styles.content}>
    <h3>Sign in</h3>
    <div>
      <FirebaseAuth />
    </div>
    <div style={styles.textContainer}>
      <p>
        This auth page is static. It won't server-side redirect if the user is
        already authenticated.
      </p>
    </div>
  </div>
)

// TODO: improve withAuthUser API
export default withAuthUser({ redirectIfAuthed: true })(Auth)
