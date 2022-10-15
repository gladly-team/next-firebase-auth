import React from 'react'
import { withUser } from 'next-firebase-auth'

const Demo = () => <div>Some content</div>

export default withUser()(Demo)
