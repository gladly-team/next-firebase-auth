import { getLoginRedirectInfo, getAppRedirectInfo } from 'src/redirects'
import getMockConfig from 'src/testHelpers/createMockConfig'
import { setConfig } from 'src/config'

describe('redirects', () => {
  const redirectOperations = [
    ({
      redirectConfigName: 'authPageURL',
      redirectFunc: getLoginRedirectInfo,
    },
    {
      redirectConfigName: 'appPageURL',
      redirectFunc: getAppRedirectInfo,
    }),
  ]

  redirectOperations.forEach(({ redirectConfigName, redirectFunc }) => {
    describe(`${redirectFunc.name} : ${redirectConfigName} tests`, () => {
      describe('with global config', () => {
        it('returns a redirect object when "redirectDestination" is set to a string and it is provided by the global config', () => {
          setConfig(getMockConfig())
          const result = redirectFunc({})
          const mockConfig = getMockConfig()
          setConfig({
            ...mockConfig,
            authPageURL: '/',
          })

          expect(result).toEqual({
            destination: '/',
            basePath: true,
            permanent: false,
          })
        })
      })

      describe('with config specified in "redirectURL"', () => {
        it('returns a redirect object when "redirectDestination" set to a string', () => {
          const redirectURL = '/'
          const result = redirectFunc({
            redirectURL,
          })

          expect(result).toEqual({
            destination: '/',
            basePath: true,
            permanent: false,
          })
        })

        it('returns a redirect object when "redirectDestination" set to a minimally valid object', () => {
          const result = redirectFunc({
            redirectURL: '/', // Only required field
          })

          expect(result).toEqual({
            destination: '/',
            basePath: true,
            permanent: false,
          })
        })

        it('returns a redirect object when "redirectDestination" set to a full and valid object', () => {
          const result = redirectFunc({
            redirectURL: {
              destination: '/',
              basePath: false,
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
            redirectURL: () => '/',
          })

          expect(result).toEqual({
            destination: '/',
            basePath: true,
            permanent: false,
          })
        })

        it('returns a redirect object when "redirectDestination" set to a function returning a valid object with a computed "destination"', () => {
          const result = redirectFunc({
            redirectURL: ({ ctx, AuthUser }) => ({
              destination: `/${ctx.id}/${AuthUser.id}`,
            }),
            ctx: { id: 'context-id' },
            AuthUser: { id: 'user-id' },
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
            ctx: { id: 'context-id' },
            AuthUser: { id: 'user-id' },
            redirectURL: () => ({
              destination: `/`,
              basePath: false,
              permanent: true,
            }),
          })

          expect(result).toEqual({
            destination: '/',
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
              options: {
                [redirectConfigName]: '',
              },
            })
          ).toThrow(
            `The "${redirectConfigName}" must be set to a non-empty string, an object literal containing "destination", or a function that returns either.`
          )
        })

        it('throws when "destination" is a number', () => {
          expect(() =>
            redirectFunc({
              options: {
                [redirectConfigName]: 42,
              },
            })
          ).toThrow(
            `The "${redirectConfigName}" must be set to a non-empty string, an object literal containing "destination", or a function that returns either.`
          )
        })
      })
    })
  })
})
