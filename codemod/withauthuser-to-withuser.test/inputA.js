/* eslint-disable import/no-unresolved */
import React from 'react'
import { withAuthUser } from 'next-firebase-auth'

const Demo = () => <div>Some content</div>

export default withAuthUser()(Demo)
