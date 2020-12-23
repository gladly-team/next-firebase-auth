import { verifyIdToken } from 'next-firebase-auth'
import initAuth from '../../utils/initAuth'

initAuth()

const handler = async (req, res) => {
  if (!(req.headers && req.headers.authorization)) {
    return res.status(400).json({ error: 'Missing Authorization header value' })
  }
  const token = req.headers.authorization
  try {
    await verifyIdToken(token)
  } catch (e) {
    // eslint-disable-next-line no-console
    console.error(e)
    return res.status(403).json({ error: 'Not authorized' })
  }

  const colors = [
    'sea foam green',
    'light purple',
    'teal',
    'taupe',
    'dark grey',
  ]
  const favoriteColor = colors[Math.floor(Math.random() * colors.length)]

  return res.status(200).json({ favoriteColor })
}

export default handler
