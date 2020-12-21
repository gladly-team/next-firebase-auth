const handler = async (req, res) => {
  if (!(req.headers && req.headers.authorization)) {
    return res.status(400).json({ error: 'Missing Authorization header value' })
  }

  // TODO: verify ID token
  // const token = req.headers.authorization

  const colors = ['sea foam green', 'light purple', 'teal']
  const favoriteColor = colors[Math.floor(Math.random() * colors.length)]

  return res.status(200).json({ favoriteColor })
}

export default handler
