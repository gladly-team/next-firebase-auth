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

const DemoPageLinks = () => (
  <div style={styles.content}>
    <h4>Examples</h4>
    <div>
      <Link href="/">
        <a style={styles.linkAnchor}>Home (no auth required)</a>
      </Link>
      <Link href="/auth-required">
        <a style={styles.linkAnchor}>
          Authentication required: server-side redirect
        </a>
      </Link>
      <Link href="/auth">
        <a style={styles.linkAnchor}>Login page (static)</a>
      </Link>
    </div>
  </div>
)

DemoPageLinks.displayName = 'DemoPageLinks'

export default DemoPageLinks
