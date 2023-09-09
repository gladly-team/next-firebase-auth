
import { useAuth } from '@/auth/context'
import styles from './page.module.css'

function Content() {
  return (
    <p>
      SSR example.
    </p>
  )
}

export default function SSR() {
  return (
    <main className={styles.main}>
      <Content />
    </main>
  )
}
