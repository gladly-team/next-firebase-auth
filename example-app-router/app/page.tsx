// TODO: don't make whole page a client component
'use client'

import { useAuth } from '@/auth/context'
import styles from './page.module.css'
import { AuthProvider } from '@/auth/AuthProvider'

function Content() {
  const { user } = useAuth()
  console.log('user!', user)
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
