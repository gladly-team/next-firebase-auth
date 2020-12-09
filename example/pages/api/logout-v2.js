import { unsetAuthCookies } from 'next-firebase-auth'

// TODO: change route to /logout after we support customizable
// endpoints.
const handler = async (req, res) => {
  await unsetAuthCookies(req, res)
  res.status(200).json({ status: true })
}

export default handler
