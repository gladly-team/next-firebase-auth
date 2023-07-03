/* eslint-disable import/no-unresolved */
import { setAuthCookies } from 'next-firebase-auth'

const handler = async (req, res) => {
  try {
    setAuthCookies(req, res).then((response) => {
      // eslint-disable-next-line no-unused-vars
      const { user: AuthUser } = response
    })
  } catch (e) {
    return res.status(500).json({ error: 'Unexpected error.' })
  }
  return res.status(200).json({ status: true })
}

export default handler
