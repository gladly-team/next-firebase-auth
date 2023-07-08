import { getConfig } from 'src/config'

const getBaseCookieName = () => getConfig().cookies.name

export const getUserCookieName = () => {
  const baseAuthCookieName = getBaseCookieName()
  return `${baseAuthCookieName}.AuthUser` // do not modify
}

export const getUserSigCookieName = () => `${getUserCookieName()}.sig`

export const getUserTokensCookieName = () => {
  const baseAuthCookieName = getBaseCookieName()
  return `${baseAuthCookieName}.AuthUserTokens` // do not modify
}

export const getUserTokensSigCookieName = () =>
  `${getUserTokensCookieName()}.sig`
