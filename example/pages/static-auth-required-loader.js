import React, { useCallback, useEffect, useState } from 'react'
import { useAuthUser, withAuthUser, AuthAction } from 'next-firebase-auth'
import Header from '../components/Header'
import DemoPageLinks from '../components/DemoPageLinks'
import FullPageLoader from '../components/FullPageLoader'
import getAbsoluteURL from '../utils/getAbsoluteURL'

const styles = {
  content: {
    padding: 32,
  },
  infoTextContainer: {
    marginBottom: 32,
  },
}

const Demo = () => {
  const AuthUser = useAuthUser() // the user is guaranteed to be authenticated

  const [favoriteColor, setFavoriteColor] = useState()
  const fetchData = useCallback(async () => {
    const token = await AuthUser.getIdToken()
    const endpoint = getAbsoluteURL('/api/example')
    const response = await fetch(endpoint, {
      method: 'GET',
      headers: {
        Authorization: token,
      },
    })
    const data = await response.json()
    if (!response.ok) {
      // eslint-disable-next-line no-console
      console.error(
        `Data fetching failed with status ${response.status}: ${JSON.stringify(
          data
        )}`
      )
      return null
    }
    return data
  }, [AuthUser])

  useEffect(() => {
    const fetchFavoriteColor = async () => {
      const data = await fetchData()
      setFavoriteColor(data ? data.favoriteColor : 'unknown :(')
    }
    fetchFavoriteColor()
  }, [fetchData])

  return (
    <div>
      <Header email={AuthUser.email} signOut={AuthUser.signOut} />
      <div style={styles.content}>
        <div style={styles.infoTextContainer}>
          <h3>Example: static + loader</h3>
          <p>
            This page requires is static but requires authentication. Before the
            Firebase client SDK initializes, it shows a loader. After
            initializing, if the user is not authenticated, it client-side
            redirects to the login page.
          </p>
          <p>Your favorite color is: {favoriteColor}</p>
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
})(Demo)
