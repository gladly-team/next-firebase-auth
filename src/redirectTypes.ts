import type { GetServerSidePropsContext, Redirect } from 'next'
import type { ParsedUrlQuery } from 'querystring'
import { User } from './createUser'

export type URLResolveFunction = (obj: {
  ctx?: GetServerSidePropsContext<ParsedUrlQuery>
  user?: User
}) => string | Redirect

export type RedirectObject = Redirect

export type PageURL = string | Redirect | URLResolveFunction

export interface RedirectInput {
  ctx?: GetServerSidePropsContext<ParsedUrlQuery>
  user?: User
  redirectURL?: PageURL
}

export type RedirectConfigName = string

export interface RedirectConfig extends RedirectInput {
  redirectConfigName: RedirectConfigName
}
