/* eslint-disable import/no-unresolved */
import React from 'react'
import { withAuthUser, withUserTokenSSR } from 'next-firebase-auth'

const Demo = () => <div>Some content</div>

export const getServerSideProps = withUserTokenSSR()()

export default withAuthUser()(Demo)
