import {
  getRedirectToLoginDestination,
  getRedirectToAppDestination,
} from 'src/redirects'

describe('redirects', () => {
  const redirectOperations = [
    ({
      configParameter: 'authPageURL',
      redirectFunc: getRedirectToLoginDestination,
    },
    {
      configParameter: 'appPageURL',
      redirectFunc: getRedirectToAppDestination,
    }),
  ]

  redirectOperations.forEach(({ configParameter, redirectFunc }) => {
    describe(`${redirectFunc.name} : ${configParameter} tests`, () => {
      it('returns a redirect object when "redirectDestination" set to a string', () => {
        const redirectDestination = '/my-app'
        const result = redirectFunc({
          redirectDestination,
        })

        expect(result).toEqual({
          destination: redirectDestination,
          basePath: true,
          permanent: false,
        })
      })

      it('returns a redirect object when "redirectDestination" set to a minimally valid object', () => {
        const redirectDestination = {
          destination: '/my-app', // Only required field
        }

        const result = redirectFunc({
          redirectDestination,
        })

        expect(result).toEqual({
          destination: '/my-app',
          basePath: true,
          permanent: false,
        })
      })

      it('returns a redirect object when "redirectDestination" set to a full and valid object', () => {
        const redirectDestination = {
          destination: '/my-app',
          basePath: false,
        }

        const result = redirectFunc({
          redirectDestination,
        })

        expect(result).toEqual({
          destination: redirectDestination.destination,
          basePath: false,
          permanent: false,
        })
      })

      it('returns a redirect object when "redirectDestination" set to a function returning a string', () => {
        const redirectDestination = () => '/my-app'

        const result = redirectFunc({
          redirectDestination,
        })

        expect(result).toEqual({
          destination: '/my-app',
          basePath: true,
          permanent: false,
        })
      })

      it('returns a redirect object when "redirectDestination" set to a function returning a valid object with a computed "destination"', () => {
        const redirectDestination = ({ ctx, AuthUser }) => ({
          destination: `/my-app/${ctx.id}/${AuthUser.id}`,
        })

        const result = redirectFunc({
          ctx: { id: 'context-id' },
          AuthUser: { id: 'user-id' },
          redirectDestination,
        })

        expect(result).toEqual({
          destination: '/my-app/context-id/user-id',
          basePath: true,
          permanent: false,
        })
      })

      it('returns a redirect object when "redirectDestination" set to a function returning a valid object with additional parameters', () => {
        const redirectDestination = () => ({
          destination: '/my-app',
          basePath: false,
          anotherProp: true,
        })

        const result = redirectFunc({
          redirectDestination,
        })

        expect(result).toEqual({
          destination: '/my-app',
          basePath: false,
          permanent: false,
          anotherProp: true,
        })
      })

      it('returns a redirect object when defaults are overridden', () => {
        const redirectDestination = () => ({
          destination: `/my-app`,
          basePath: false,
          permanent: true,
        })

        const result = redirectFunc({
          ctx: { id: 'context-id' },
          AuthUser: { id: 'user-id' },
          redirectDestination,
        })

        expect(result).toEqual({
          destination: '/my-app',
          basePath: false,
          permanent: true,
        })
      })

      it('throws when undefined parameters are passed in', () => {
        expect(() => redirectFunc()).toThrow(
          `The "${configParameter}" must be set to a non-empty string, an object literal containing "destination", or a function that returns either.`
        )
      })

      it('throws when empty parameter object is passed in', () => {
        expect(() => redirectFunc({})).toThrow(
          `The "${configParameter}" must be set to a non-empty string, an object literal containing "destination", or a function that returns either.`
        )
      })

      it('throws when "destination" is an empty string', () => {
        expect(() =>
          redirectFunc({
            destination: '',
          })
        ).toThrow(
          `The "${configParameter}" must be set to a non-empty string, an object literal containing "destination", or a function that returns either.`
        )
      })

      it('throws when "destination" is a number', () => {
        expect(() =>
          redirectFunc({
            destination: 42,
          })
        ).toThrow(
          `The "${configParameter}" must be set to a non-empty string, an object literal containing "destination", or a function that returns either.`
        )
      })
    })
  })
})
