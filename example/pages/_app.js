import React from 'react'
import '../styles/globals.css'
import initAuth from '../utils/initAuth'

initAuth()

function MyApp({ Component, pageProps }) {
  // eslint-disable-next-line react/jsx-props-no-spreading
  return <Component {...pageProps} />
}

export default MyApp
