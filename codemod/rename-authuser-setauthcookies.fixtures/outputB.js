/* eslint-disable import/no-unresolved */
import { setAuthCookies } from 'next-firebase-auth'
// eslint-disable-next-line no-unused-vars
import someOtherFunction from '@foo/bar'

const handler = async (req, res) => {
  // Ensure we don't affect other variables named `AuthUser`.
  // eslint-disable-next-line no-unused-vars
  const AuthUser = someOtherFunction()
  try {
    await setAuthCookies(req, res)
  } catch (e) {
    return res.status(500).json({ error: 'Unexpected error.' })
  }
  return res.status(200).json({ status: true })
}

export default handler
