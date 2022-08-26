import React, { useCallback, useState } from 'react'
import { withAuthUser, AuthAction, useAuthUser } from 'next-firebase-auth'
import Header from '../components/Header'
import DemoPageLinks from '../components/DemoPageLinks'
import FullPageLoader from '../components/FullPageLoader'

const styles = {
  content: {
    padding: 32,
  },
  infoTextContainer: {
    marginBottom: 32,
  },
}

/*
  For issue:
  https://github.com/gladly-team/next-firebase-auth/issues/163

  Manually testing, HMR works in:
  - 1.0.0-canary.17
  - 1.0.0-canary.14
  - 1.0.0-canary.12 <-- release that fixed it

  HMR does NOT work in:
  - 1.0.0-canary.11
  - 1.0.0-canary.8
  - 1.0.0-canary.1
  - 1.0.0-canary.0

  This is with other dependencies:
    "firebase": "^9.9.1",
    "firebase-admin": "^11.0.0",
    "next": "12.2.3",
    "next-absolute-url": "^1.2.2",
    "react": "18.2.0",
    "react-dom": "18.2.0",
    "react-firebaseui": "^6.0.0"
 */
const Test1 = () => {
  const AuthUser = useAuthUser()
  const [clicks, setClicks] = useState(0)
  const onClick = useCallback(() => {
    setClicks((currentClicks) => currentClicks + 1)
  }, [])
  return (
    <div>
      <Header email={AuthUser.email} signOut={AuthUser.signOut} />
      <div style={styles.content}>
        <div style={styles.infoTextContainer}>
          <h3>HMR test 1: with NFA</h3>
          <p>This page is wrapped in `withAuthUser`.</p>
          <p>To test HMR, click the button then edit this paragraph's text!</p>
          <p>Clicks: {clicks}</p>
          <button type="button" onClick={onClick}>
            Click me
          </button>
        </div>
        <DemoPageLinks />
      </div>
    </div>
  )
}

export default withAuthUser({
  whenUnauthedBeforeInit: AuthAction.SHOW_LOADER,
  whenUnauthedAfterInit: AuthAction.REDIRECT_TO_LOGIN,
  LoaderComponent: FullPageLoader,
})(Test1)
