/* eslint-disable import/no-unresolved */
import React from 'react'
import { withAuthUser, withUserSSR } from 'next-firebase-auth'

const Demo = () => <div>Some content</div>

export const getServerSideProps = withUserSSR()()

export default withAuthUser()(Demo)
