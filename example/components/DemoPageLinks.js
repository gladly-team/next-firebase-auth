import React from 'react'
import Link from 'next/link'

const styles = {
  content: {
    padding: `4px 32px 32px 32px`,
    background: '#eeeeee',
    display: 'inline-block',
  },
  linkAnchor: {
    color: 'teal',
    display: 'block',
    lineHeight: '160%',
  },
}

// TODO: add client and server data-fetching examples that use
//   the user's ID and token.
const DemoPageLinks = () => (
  <div style={styles.content}>
    <h4>Examples</h4>
    <div>
      <Link href="/">
        <a style={styles.linkAnchor}>Home: no auth required, static</a>
      </Link>
      <Link href="/ssr-auth-required">
        <a style={styles.linkAnchor}>
          Example: auth required, server-side redirect
        </a>
      </Link>
      <Link href="/static-auth-required-loader">
        <a style={styles.linkAnchor}>
          Example: auth required, static page with loader
        </a>
      </Link>
      <Link href="/auth">
        <a style={styles.linkAnchor}>Login page: static</a>
      </Link>
      <Link href="/auth-ssr">
        <a style={styles.linkAnchor}>Login page: server-rendered</a>
      </Link>
    </div>
  </div>
)

DemoPageLinks.displayName = 'DemoPageLinks'

export default DemoPageLinks
