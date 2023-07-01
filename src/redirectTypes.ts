import type { GetServerSidePropsContext } from 'next'
import type { ParsedUrlQuery } from 'querystring'
import { AuthUser } from './createAuthUser'

export type URLResolveFunction = (obj: {
  ctx?: GetServerSidePropsContext<ParsedUrlQuery>
  AuthUser?: AuthUser
}) => string | RedirectObject

export type RedirectObject = {
  destination: string | URLResolveFunction
  basePath: boolean
  permanent?: boolean
}

export type PageURL = string | RedirectObject | URLResolveFunction

export interface RedirectInput {
  ctx?: GetServerSidePropsContext<ParsedUrlQuery>
  AuthUser?: AuthUser
  redirectURL?: PageURL
}

export interface RedirectDestination {
  destination: string
  basePath: boolean
  permanent?: boolean
}

export type RedirectConfigName = string

export interface RedirectConfig extends RedirectInput {
  redirectConfigName: RedirectConfigName
}
