/* eslint-disable import/no-unresolved */
import React from 'react'
import { withAuthUser, withAuthUserTokenSSR } from 'next-firebase-auth'

const Demo = () => <div>Some content</div>

export const getServerSideProps = withAuthUserTokenSSR()()

export default withAuthUser()(Demo)
