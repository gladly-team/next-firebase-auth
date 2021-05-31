import { getConfig } from 'src/config'

const getBaseCookieName = () => getConfig().cookies.name
const isCookieUnified = () => getConfig().cookies.unified

export const getAuthUserCookieName = () => {
  const baseAuthCookieName = getBaseCookieName()
  if (isCookieUnified()) return baseAuthCookieName
  return `${baseAuthCookieName}.AuthUser`
}

export const getAuthUserTokensCookieName = () => {
  const baseAuthCookieName = getBaseCookieName()
  if (isCookieUnified()) return baseAuthCookieName
  return `${baseAuthCookieName}.AuthUserTokens`
}
