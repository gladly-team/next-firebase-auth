import { verifyIdToken } from 'src/firebaseAdmin'
import logDebug from 'src/logDebug'

/**
 * API Middleware for Firebase ID Token Authorization.
 * API endpoints wrapped with this middleware will be required to be executes with a
 * `bearer <id token>` Authorization header.
 * e.g.,
 * ```
 * await fetch('<baseUrl>/api/hello', { headers: {authorization: 'bearer <IDToken>'}});
 * ```
 * @param {*} handler
 * @returns Wrapped handler method that is used by NextJS.
 */
const withAuthUserTokenAPI = (handler) => async (req, res) => {
  if (
    !req.headers.authorization ||
    !req.headers.authorization.match(/^bearer .*$/i)
  ) {
    res.status(401).send({ message: 'Unauthorized', code: 1 })
    return
  }

  const token = req.headers.authorization.split(' ')[1]

  try {
    const authUser = await verifyIdToken(token)

    if (!authUser.id) {
      res.status(401).send({ message: 'Unauthorized', code: 2 })
      return
    }

    req.AuthUser = authUser
    handler(req, res)
  } catch (err) {
    logDebug('Error verifying Provided ID Token', err.message, err.stack)
    res.status(401).send({ message: 'Unauthorized', code: 3 })
  }
}

export default withAuthUserTokenAPI
