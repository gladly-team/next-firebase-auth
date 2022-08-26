import React, { useCallback, useState } from 'react'
import Header from '../components/Header'
import DemoPageLinks from '../components/DemoPageLinks'

const styles = {
  content: {
    padding: 32,
  },
  infoTextContainer: {
    marginBottom: 32,
  },
}

// The same as Test1 but without NFA.
const Test2 = () => {
  const [clicks, setClicks] = useState(0)
  const onClick = useCallback(() => {
    setClicks((currentClicks) => currentClicks + 1)
  }, [])
  return (
    <div>
      <Header />
      <div style={styles.content}>
        <div style={styles.infoTextContainer}>
          <h3>HMR test 2: with NFA</h3>
          <p>This page is NOT wrapped in `withAuthUser`.</p>
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

export default Test2
