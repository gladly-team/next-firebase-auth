import { getConfig } from 'src/config'

const getBaseCookieName = () => {
  return getConfig().cookies.cookieName
}

export const getAuthUserCookieName = () => {
  const baseAuthCookieName = getBaseCookieName()
  return `${baseAuthCookieName}.AuthUser`
}

export const getAuthUserTokensCookieName = () => {
  const baseAuthCookieName = getBaseCookieName()
  return `${baseAuthCookieName}.AuthUserTokens`
}
