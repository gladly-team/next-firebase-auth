import { getConfig } from 'src/config'

const getBaseCookieName = () => getConfig().cookies.name

export const getAuthUserCookieName = () => {
  const baseAuthCookieName = getBaseCookieName()
  return `${baseAuthCookieName}.AuthUser`
}

export const getAuthUserTokensCookieName = () => {
  const baseAuthCookieName = getBaseCookieName()
  return `${baseAuthCookieName}.AuthUserTokens`
}
