'use client'

import { getApp, getApps, initializeApp } from 'firebase/app'
import { getAuth, connectAuthEmulator } from 'firebase/auth'

export default function initFirebase() {
  // Only initialize on the client side.
  if (typeof window === 'undefined') {
    return
  }
  if (!getApps().length) {
    initializeApp({
      apiKey: process.env.NEXT_PUBLIC_FIREBASE_PUBLIC_API_KEY,
      authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
      projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID
    })
    console.log('Initialized the Firebase JS SDK.')
  } else {
    console.log(
      'Did not initialize the Firebase JS SDK because an app already exists.'
    )
  }
}

