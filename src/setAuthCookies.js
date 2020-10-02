import { getCustomIdAndRefreshTokens } from 'src/firebaseAdmin'
import { setCookie } from 'src/cookies'

// TODO: use user config
const baseAuthCookieName = 'myDemo'

// eslint-disable-next-line
const setAuthCookies = async (req, res) => {
  if (!(req.headers && req.headers.authorization)) {
    return res.status(400).json({ error: 'Missing Authorization header value' })
  }

  // This should be the original Firebase ID token from
  // the Firebase JS SDK.
  const token = req.headers.authorization

  // Get a custom ID token and refresh token, given a valid
  // Firebase ID token.
  const { idToken, refreshToken, AuthUser } = await getCustomIdAndRefreshTokens(
    token
  )

  // Store the ID and refresh tokens in a cookie. This
  // cookie will be available to future requests to pages,
  // providing a valid Firebase ID token for server-side rendering.
  setCookie(
    `${baseAuthCookieName}.AuthUserTokens`,
    JSON.stringify({
      idToken,
      refreshToken,
    }),
    { req, res }
  )

  // TODO: need to serialize AuthUser
  // setCookie(
  //   `${baseAuthCookieName}.AuthUser`,
  //   JSON.stringify(AuthUser),
  //   { req, res }
  // )

  return {
    idToken,
    refreshToken,
    AuthUser,
  }
}

export default setAuthCookies
