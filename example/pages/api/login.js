import { setAuthCookies } from 'next-firebase-auth'

const handler = async (req, res) => {
  await setAuthCookies(req, res)
  return res.status(200).json({ status: true })
}

export default handler
