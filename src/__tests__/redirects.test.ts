import { GetServerSidePropsContext } from 'next'
import type { ParsedUrlQuery } from 'querystring'
import { getLoginRedirectInfo, getAppRedirectInfo } from 'src/redirects'
import getMockConfig from 'src/testHelpers/createMockConfig'
import { setConfig } from 'src/config'
import { AuthUser as AuthUserType } from 'src/createAuthUser'
import { RedirectInput } from 'src/redirectTypes'

describe('redirects', () => {
  const redirectOperations = [
    {
      redirectConfigName: 'authPageURL',
      redirectFunc: getLoginRedirectInfo,
    },
    {
      redirectConfigName: 'appPageURL',
      redirectFunc: getAppRedirectInfo,
    },
  ]

  redirectOperations.forEach(({ redirectConfigName, redirectFunc }) => {
    describe(`${redirectFunc.name} : ${redirectConfigName} tests`, () => {
      describe('with global config', () => {
        it('returns a redirect object when "redirectDestination" is set to a string and it is provided by the global config', () => {
          const mockConfig = getMockConfig()
          setConfig({
            ...mockConfig,
            appPageURL: '/foo',
            authPageURL: '/foo',
          })
          const result = redirectFunc({})

          expect(result).toEqual({
            destination: '/foo',
            basePath: true,
            permanent: false,
          })
        })
      })

      describe('with config specified in "redirectURL"', () => {
        it('returns a redirect object when "redirectDestination" set to a string', () => {
          const redirectURL = '/example'
          const result = redirectFunc({
            redirectURL,
          })

          expect(result).toEqual({
            destination: '/example',
            basePath: true,
            permanent: false,
          })
        })

        it('returns a redirect object when "redirectDestination" set to a minimally valid object', () => {
          const result = redirectFunc({
            redirectURL: '/abc', // Only required field
          })

          expect(result).toEqual({
            destination: '/abc',
            basePath: true,
            permanent: false,
          })
        })

        it('returns a redirect object when "redirectDestination" set to a full and valid object', () => {
          const result = redirectFunc({
            redirectURL: {
              destination: '/',
              basePath: false,
              permanent: false,
            },
          })

          expect(result).toEqual({
            destination: '/',
            basePath: false,
            permanent: false,
          })
        })

        it('returns a redirect object when "redirectDestination" set to a function returning a string', () => {
          const result = redirectFunc({
            redirectURL: () => '/blah',
          })

          expect(result).toEqual({
            destination: '/blah',
            basePath: true,
            permanent: false,
          })
        })

        it('returns a redirect object when "redirectDestination" set to a function returning a valid object with a computed "destination"', () => {
          const result = redirectFunc({
            redirectURL: ({ ctx, AuthUser }) => ({
              basePath: true,
              destination: `/${ctx?.query.id}/${AuthUser?.id}`,
              permanent: false,
            }),
            ctx: {
              query: { id: 'context-id' },
            } as unknown as GetServerSidePropsContext<ParsedUrlQuery>,
            AuthUser: { id: 'user-id' } as AuthUserType,
          })

          expect(result).toEqual({
            destination: '/context-id/user-id',
            basePath: true,
            permanent: false,
          })
        })

        it('returns a redirect object when "redirectDestination" set to a function returning a valid object with additional parameters', () => {
          const result = redirectFunc({
            redirectURL: () => ({
              destination: '/',
              basePath: false,
              permanent: false,
              anotherProp: true,
            }),
          })

          expect(result).toEqual({
            destination: '/',
            basePath: false,
            permanent: false,
            anotherProp: true,
          })
        })

        it('returns a redirect object when defaults are overridden', () => {
          const result = redirectFunc({
            ctx: {
              id: 'context-id',
            } as unknown as GetServerSidePropsContext<ParsedUrlQuery>,
            AuthUser: { id: 'user-id' } as AuthUserType,
            redirectURL: () => ({
              destination: `/hello`,
              basePath: false,
              permanent: true,
            }),
          })

          expect(result).toEqual({
            destination: '/hello',
            basePath: false,
            permanent: true,
          })
        })
      })

      describe('failed states', () => {
        beforeEach(() => {
          const mockConfig = getMockConfig()
          setConfig({
            ...mockConfig,
            [redirectConfigName]: undefined,
          })
        })

        it('throws when empty parameter object is passed in', () => {
          expect(() => redirectFunc({})).toThrow(
            `The "${redirectConfigName}" must be set to a non-empty string, an object literal containing "destination", or a function that returns either.`
          )
        })

        it('throws when "destination" is an empty string', () => {
          expect(() =>
            redirectFunc({
              redirectURL: '',
            })
          ).toThrow(
            `The "${redirectConfigName}" must be set to a non-empty string, an object literal containing "destination", or a function that returns either.`
          )
        })

        it('throws when "destination" is a number', () => {
          expect(() =>
            redirectFunc({
              redirectURL: 42,
            } as unknown as RedirectInput)
          ).toThrow(
            `The "${redirectConfigName}" must be set to a non-empty string, an object literal containing "destination", or a function that returns either.`
          )
        })
      })
    })
  })
})
