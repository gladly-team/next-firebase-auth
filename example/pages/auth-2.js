import React from 'react'
import {
  withAuthUser,
  withAuthUserTokenSSR,
  AuthStrategy,
} from 'next-firebase-auth'
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
    <div style={styles.textContainer}>
      <p>
        This auth page is <b>not</b> static. It will server-side redirect to the
        app if the user is already authenticated.
      </p>
    </div>
    <div>
      <FirebaseAuth />
    </div>
  </div>
)

export const getServerSideProps = withAuthUserTokenSSR({
  whenAuthed: AuthStrategy.REDIRECT_TO_APP,
})()

// TODO: improve withAuthUser API
export default withAuthUser({ redirectIfAuthed: true })(Auth)
