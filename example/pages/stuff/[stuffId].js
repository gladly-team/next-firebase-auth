import React from 'react'
import { AuthAction, useUser, withUser } from 'next-firebase-auth'
import { useRouter } from 'next/router'
import Header from '../../components/Header'
import DemoPageLinks from '../../components/DemoPageLinks'

const styles = {
  content: {
    padding: 32,
  },
  infoTextContainer: {
    marginBottom: 32,
  },
}

const StuffPage = () => {
  const user = useUser()
  const router = useRouter()
  const { stuffId } = router.query
  return (
    <div>
      <Header email={user.email} signOut={user.signOut} />
      <div style={styles.content}>
        <div style={styles.infoTextContainer}>
          <h3>Stuff - A dynamic page example</h3>
          <p>You're looking at this stuff: {stuffId}</p>
        </div>
        <DemoPageLinks />
      </div>
    </div>
  )
}

export default withUser({
  whenUnauthedAfterInit: AuthAction.REDIRECT_TO_LOGIN,
})(StuffPage)
