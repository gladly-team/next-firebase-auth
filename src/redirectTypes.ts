import type { GetServerSidePropsContext, Redirect } from 'next'
import type { ParsedUrlQuery } from 'querystring'
import { AuthUser } from './createAuthUser'

export type URLResolveFunction = (obj: {
  ctx?: GetServerSidePropsContext<ParsedUrlQuery>
  AuthUser?: AuthUser
}) => string | Redirect

export type RedirectObject = Redirect

export type PageURL = string | Redirect | URLResolveFunction

export interface RedirectInput {
  ctx?: GetServerSidePropsContext<ParsedUrlQuery>
  AuthUser?: AuthUser
  redirectURL?: PageURL
}

export type RedirectConfigName = string

export interface RedirectConfig extends RedirectInput {
  redirectConfigName: RedirectConfigName
}
