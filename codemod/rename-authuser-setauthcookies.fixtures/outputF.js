/* eslint-disable import/no-unresolved, no-unused-vars */
import { setAuthCookies } from 'next-firebase-auth'

const handler = async (req, res) => {
  try {
    // eslint-disable-next-line prettier/prettier
    const { idToken, refreshToken, user: foo } = await setAuthCookies(req, res)
    const { email } = foo
  } catch (e) {
    return res.status(500).json({ error: 'Unexpected error.' })
  }
  return res.status(200).json({ status: true })
}

export default handler
