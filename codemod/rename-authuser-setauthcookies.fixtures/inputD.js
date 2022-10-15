/* eslint-disable import/no-unresolved */
import setAuthCookies from 'another-module'

const handler = async (req, res) => {
  try {
    // eslint-disable-next-line no-unused-vars
    const AuthUser = await setAuthCookies(req, res)
  } catch (e) {
    return res.status(500).json({ error: 'Unexpected error.' })
  }
  return res.status(200).json({ status: true })
}

export default handler
