import {
  getRedirectToLoginDestination,
  getRedirectToAppDestination,
} from 'src/redirects'
import getMockConfig from 'src/testHelpers/createMockConfig'
import { setConfig } from 'src/config'

describe('redirects', () => {
  const redirectOperations = [
    ({
      redirectConfigName: 'authPageURL',
      redirectFunc: getRedirectToLoginDestination,
    },
    {
      redirectConfigName: 'appPageURL',
      redirectFunc: getRedirectToAppDestination,
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

      describe('with config specified in "options"', () => {
        it('returns a redirect object when "redirectDestination" set to a string', () => {
          const destination = '/'
          const result = redirectFunc({
            options: {
              [redirectConfigName]: destination,
            },
          })

          expect(result).toEqual({
            destination,
            basePath: true,
            permanent: false,
          })
        })

        it('returns a redirect object when "redirectDestination" set to a minimally valid object', () => {
          const result = redirectFunc({
            options: {
              [redirectConfigName]: {
                destination: '/', // Only required field
              },
            },
          })

          expect(result).toEqual({
            destination: '/',
            basePath: true,
            permanent: false,
          })
        })

        it('returns a redirect object when "redirectDestination" set to a full and valid object', () => {
          const result = redirectFunc({
            options: {
              [redirectConfigName]: {
                destination: '/',
                basePath: false,
              },
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
            options: {
              [redirectConfigName]: () => '/',
            },
          })

          expect(result).toEqual({
            destination: '/',
            basePath: true,
            permanent: false,
          })
        })

        it('returns a redirect object when "redirectDestination" set to a function returning a valid object with a computed "destination"', () => {
          const result = redirectFunc({
            options: {
              [redirectConfigName]: ({ ctx, AuthUser }) => ({
                destination: `//${ctx.id}/${AuthUser.id}`,
              }),
            },
            ctx: { id: 'context-id' },
            AuthUser: { id: 'user-id' },
          })

          expect(result).toEqual({
            destination: '//context-id/user-id',
            basePath: true,
            permanent: false,
          })
        })

        it('returns a redirect object when "redirectDestination" set to a function returning a valid object with additional parameters', () => {
          const result = redirectFunc({
            options: {
              [redirectConfigName]: () => ({
                destination: '/',
                basePath: false,
                anotherProp: true,
              }),
            },
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
            options: {
              [redirectConfigName]: () => ({
                destination: `/`,
                basePath: false,
                permanent: true,
              }),
            },
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
        it('throws when undefined parameters are passed in', () => {
          expect(() => redirectFunc()).toThrow(
            `The "${redirectConfigName}" must be set to a non-empty string, an object literal containing "destination", or a function that returns either.`
          )
        })

        it('throws when empty parameter object is passed in', () => {
          expect(() => redirectFunc({})).toThrow(
            `The "${redirectConfigName}" must be set to a non-empty string, an object literal containing "destination", or a function that returns either.`
          )
        })

        it('throws when "destination" is an empty string', () => {
          expect(() =>
            redirectFunc({
              destination: '',
            })
          ).toThrow(
            `The "${redirectConfigName}" must be set to a non-empty string, an object literal containing "destination", or a function that returns either.`
          )
        })

        it('throws when "destination" is a number', () => {
          expect(() =>
            redirectFunc({
              destination: 42,
            })
          ).toThrow(
            `The "${redirectConfigName}" must be set to a non-empty string, an object literal containing "destination", or a function that returns either.`
          )
        })
      })
    })
  })
})
