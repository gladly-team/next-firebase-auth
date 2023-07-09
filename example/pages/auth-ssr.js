import React from 'react'
import { withUser, withUserTokenSSR, AuthAction } from 'next-firebase-auth'
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

export const getServerSideProps = withUserTokenSSR({
  whenAuthed: AuthAction.REDIRECT_TO_APP,
})()

export default withUser({
  whenAuthed: AuthAction.REDIRECT_TO_APP,
})(Auth)
