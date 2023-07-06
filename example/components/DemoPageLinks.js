import React from 'react'
import Link from 'next/link'

const styles = {
  content: {
    padding: '4px 32px 32px 32px',
    background: '#eeeeee',
    display: 'inline-block',
  },
  linkAnchor: {
    color: 'teal',
    display: 'block',
    lineHeight: '160%',
  },
}

const DemoPageLinks = () => (
  <div style={styles.content}>
    <h4>Examples</h4>
    <div>
      <Link href="/" style={styles.linkAnchor}>
        Home: SSR, no auth required
      </Link>
      <Link href="/ssr-auth-required" style={styles.linkAnchor}>
        Example: SSR + data fetching with ID token
      </Link>
      <Link href="/ssr-no-token" style={styles.linkAnchor}>
        Example: SSR + no ID token
      </Link>
      <Link href="/static-auth-required-loader" style={styles.linkAnchor}>
        Example: static + loader + data fetching with ID token
      </Link>
      <Link href="/auth" style={styles.linkAnchor}>
        Login page: static
      </Link>
      <Link href="/auth-ssr" style={styles.linkAnchor}>
        Login page: server-rendered
      </Link>
    </div>
  </div>
)

DemoPageLinks.displayName = 'DemoPageLinks'

export default DemoPageLinks
