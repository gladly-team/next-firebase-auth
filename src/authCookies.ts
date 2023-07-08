import { getConfig } from 'src/config'

const getBaseCookieName = () => getConfig().cookies.name

export const getAuthUserCookieName = () => {
  const baseAuthCookieName = getBaseCookieName()
  return `${baseAuthCookieName}.AuthUser` // do not modify
}

export const getAuthUserSigCookieName = () => `${getAuthUserCookieName()}.sig`

export const getAuthUserTokensCookieName = () => {
  const baseAuthCookieName = getBaseCookieName()
  return `${baseAuthCookieName}.AuthUserTokens` // do not modify
}

export const getAuthUserTokensSigCookieName = () =>
  `${getAuthUserTokensCookieName()}.sig`
