/* eslint-disable import/no-unresolved */
import React from 'react'
import { withAuthUser, withAuthUserSSR } from 'next-firebase-auth'

const Demo = () => <div>Some content</div>

export const getServerSideProps = withAuthUserSSR()()

export default withAuthUser()(Demo)
