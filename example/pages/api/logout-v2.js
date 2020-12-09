import { unsetAuthCookies } from 'next-firebase-auth'

const handler = async (req, res) => {
  await unsetAuthCookies(req, res)
  res.status(200).json({ status: true })
}

export default handler
