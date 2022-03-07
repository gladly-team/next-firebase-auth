import {
  GetServerSideProps,
  GetServerSidePropsContext,
  GetServerSidePropsResult,
} from 'next'
import { type AuthUser, withAuthUserSSR, withAuthUserTokenSSR } from '.'

declare function describe(name: string, test: () => void | Promise<void>): void
declare function it(name: string, test: () => void | Promise<void>): void
declare const SSP_CONTEXT: GetServerSidePropsContext

describe('withAuthUserSSR typings', () => {
  it('with no getter should return GetServerSideProps', () => {
    const getSSP = withAuthUserSSR()()
    type T = $Assert<typeof getSSP, GetServerSideProps>
  })

  it('should infer proper prop types', async () => {
    const SProp = Symbol('SParams')
    const getSSP = withAuthUserSSR()(async () => ({
      props: { s: 'test', n: 42, [SProp]: true as const },
    }))
    const ssp = await getSSP(SSP_CONTEXT)
    type T =
      | $Assert<
          typeof getSSP,
          GetServerSideProps<{ s: string; n: number; [SProp]: true }>
        >
      | $Assert<
          typeof ssp,
          GetServerSidePropsResult<{ s: string; n: number; [SProp]: true }>,
          'Wrong result props type'
        >
  })

  it('getter should have AuthUser of proper type', () => {
    withAuthUserSSR()(async ({ AuthUser }) => {
      type T = $Assert<typeof AuthUser, AuthUser>
      return { props: {} }
    })
  })

  it('getter should have params and previewData of proper types when type of GetServerSideProps is explicit', () => {
    const SParams = Symbol('SParams')
    const SPreview = Symbol('SPreview')
    type Props = { p: 1 }
    type Params = { [SParams]: 'p' }
    type Preview = { [SPreview]: 'p' }

    const getSSP: GetServerSideProps<Props, Params, Preview> =
      withAuthUserSSR()(async ({ params, previewData }) => {
        type T =
          | $Assert<typeof params, Params | undefined, 'Wrong params type'>
          | $Assert<
              typeof previewData,
              Preview | undefined,
              'Wrong previewData type'
            >
        return { props: { p: 1 } }
      })
  })

  it('should produce mismatch props error when type of GetServerSideProps is explicit', () => {
    type Props = { p: 1 }

    // @ts-expect-error ts(2322)
    // Type '{ p: 2; }' is not assignable to type 'Props'.
    //   Types of property 'p' are incompatible.
    //     Type '2' is not assignable to type '1'.
    const getSSP: GetServerSideProps<Props> = withAuthUserSSR()(async () => ({
      props: { p: 2 },
    }))
  })
})

describe('withAuthUserTokenSSR typings', () => {
  it('should have same type as withAuthUserSSR', () => {
    type T = $Assert<typeof withAuthUserTokenSSR, typeof withAuthUserSSR>
  })
})

// ========================================================================
// Type assertion from https://github.com/hyoo-ru/mam_mol/tree/master/type

/**
 * Asserts for equality of `Actual` and `Expected` types.
 * Don't use `never` as `Expected` - use `$AssertNever` instead.
 */
type $Assert<
  Actual,
  Expected extends
    | $Equals<Actual, Expected>
    | $Error<
        Message,
        {
          actual: Actual
          expected: Expected
        }
      >,
  Message = 'Assert failed'
> = Actual

/**
 * Asserts for `Actual` type is `never`.
 *
 *  $AssertNever< $Equals< 1 , 2 > >
 */
type $AssertNever<Actual extends never> = Actual

/**
 * Return `unknown` when `A` and `B` are the same type. `never` otherwise.
 *
 *  $Equals< unknown , any > & number // never
 *  $Equals< never , never > & number // number
 */
type $Equals<A, B> = (<X>() => X extends A ? 1 : 2) extends <X>() => X extends B
  ? 1
  : 2
  ? unknown
  : never

type $Error<Message, Info = unknown> = Message & { $err: Info }
