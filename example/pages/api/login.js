import { setAuthCookies } from 'next-firebase-auth'
import initAuth from '../../utils/initAuth'

initAuth()

const handler = async (req, res) => {
  try {
    // Including unused return value to demonstrate codemod
    // eslint-disable-next-line no-unused-vars, @typescript-eslint/no-unused-vars
    const { AuthUser } = await setAuthCookies(req, res)
  } catch (e) {
    // eslint-disable-next-line no-console
    console.error(e)
    return res.status(500).json({ error: 'Unexpected error.' })
  }
  return res.status(200).json({ status: true })
}

export default handler
