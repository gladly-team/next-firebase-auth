import React from 'react'
import '../styles/globals.css'

import { init as initAuth } from 'next-firebase-auth'

const isServerSide = typeof window === 'undefined'
initAuth({
  debug: false,
  // onAuthStateChanged: () => {},
  // authRequiredRedirectURL: '/auth',
  // appRedirectURL: '/demo',
  // Don't set the Firebase admin config on the client side.
  ...(isServerSide && {
    firebaseAdminInitConfig: {
      credential: {
        projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
        clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
        // https://stackoverflow.com/a/41044630/1332513
        privateKey: process.env.FIREBASE_PRIVATE_KEY.replace(/\\n/g, '\n'),
      },
      databaseURL: process.env.NEXT_PUBLIC_FIREBASE_DATABASE_URL,
    },
  }),
  firebaseClientInitConfig: {
    apiKey: process.env.NEXT_PUBLIC_FIREBASE_PUBLIC_API_KEY,
    authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
    databaseURL: process.env.NEXT_PUBLIC_FIREBASE_DATABASE_URL,
    projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  },
  cookies: {
    cookieName: 'myDemo',
    // FIXME: use real keys
    ...(isServerSide && { keys: ['fake-key', 'another-fake-key'] }),
  },
})

function MyApp({ Component, pageProps }) {
  // eslint-disable-next-line react/jsx-props-no-spreading
  return <Component {...pageProps} />
}

export default MyApp
