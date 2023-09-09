
import { headers } from 'next/headers'
import styles from '../page.module.css'


function Content() {
  return (
    <p>
      SSR example.
    </p>
  )
}

export default function SSR() {
  const headersList = headers()
  // console.log('headersList', headersList)
  console.log('headersList.get("Authorization")', headersList.get("Authorization"))
  return (
    <main className={styles.main}>
      <Content />
    </main>
  )
}
