import { getConfig } from 'src/config'

const getBaseCookieName = (): string => getConfig().cookies.name

export const getAuthUserCookieName = (): string => {
  const baseAuthCookieName = getBaseCookieName()
  return `${baseAuthCookieName}.AuthUser`
}

export const getAuthUserTokensCookieName = (): string => {
  const baseAuthCookieName = getBaseCookieName()
  return `${baseAuthCookieName}.AuthUserTokens`
}
