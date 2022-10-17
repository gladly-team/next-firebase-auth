/* eslint-disable import/no-unresolved, no-unused-vars */
import { setAuthCookies } from 'next-firebase-auth'

const handler = async (req, res) => {
  try {
    const { idToken, refreshToken } = await setAuthCookies(req, res)
  } catch (e) {
    return res.status(500).json({ error: 'Unexpected error.' })
  }
  return res.status(200).json({ status: true })
}

export default handler
