// TODO: remove eslint-disable
/* eslint-disable no-console */
import React from 'react'
import '../styles/globals.css'
import { getApp, getApps } from 'firebase/app'
import initAuth from '../utils/initAuth'

initAuth()

// Calling getApp() here reproduces the error of:
// "Need to provide options, when not being deployed to hosting via source"
console.log('Firebase apps:', getApp())
console.log('Firebase apps:', getApps().length)

const MyApp = ({ Component, pageProps }) => (
  // eslint-disable-next-line react/jsx-props-no-spreading
  <Component {...pageProps} />
)

export default MyApp
