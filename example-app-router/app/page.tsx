// TODO: don't make whole page a client component
'use client'

import { useAuth } from '@/auth/context'
import styles from './page.module.css'
import { AuthProvider } from '@/auth/AuthProvider'
import { useEffect } from 'react'


if ('serviceWorker' in navigator) {
  console.log('Registering service worker')
  navigator.serviceWorker.register('/service-worker.js', {scope: '/'}).then((registration) => {
      console.log("Registration succeeded.");
      // registration.unregister().then((boolean) => {
      //   console.log('Unregistration succeeeded?', boolean)
      // });
    })
    .catch((error) => {
      console.error(`Registration failed with ${error}`);
    });
}


function Content() {
  const { user } = useAuth()
  console.log('user!', user)

  useEffect(() => {
    fetch('/api/thing')
  }, [])

  return (
    <p>
      This is an example.
    </p>
  )
}

export default function Home() {
  return (
    <AuthProvider>
      <main className={styles.main}>
        <Content />
      </main>
    </AuthProvider>
  )
}
