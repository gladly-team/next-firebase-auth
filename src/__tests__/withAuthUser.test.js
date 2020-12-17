import React from 'react'
import { render } from '@testing-library/react'
import { setConfig } from 'src/config'
import getMockConfig from 'src/testHelpers/createMockConfig'
import {
  createMockSerializedAuthUser,
  createMockFirebaseUserClientSDK,
} from 'src/testHelpers/authUserInputs'
import useAuthUser from 'src/useAuthUser'
import createAuthUser from 'src/createAuthUser'
import useFirebaseUser from 'src/useFirebaseUser'

// We don't mock createAuthUser or useAuthUser.
jest.mock('next/router')
jest.mock('src/useFirebaseUser')
jest.mock('src/isClientSide')
jest.mock('src/isClientSide')

const MockComponent = ({ message }) => <div>Hello! {message}</div>

beforeEach(() => {
  // Default to client side context.
  const isClientSide = require('src/isClientSide').default
  isClientSide.mockReturnValue(true)

  const mockConfig = getMockConfig()
  setConfig({
    ...mockConfig,
    firebaseAdminInitConfig: undefined,
    cookies: undefined,
    // TODO: set the default loading strategies
  })

  useFirebaseUser.mockReturnValue({
    user: undefined,
    initialized: false,
  })
})

afterEach(() => {
  jest.clearAllMocks()
})

describe('withAuthUser', () => {
  it('renders the child component when there is no server-side or client-side user and rendering without a user is allowed', () => {
    expect.assertions(1)
    const withAuthUser = require('src/withAuthUser').default
    const MockCompWithUser = withAuthUser({
      authRequired: false,
      redirectIfAuthed: false,
    })(MockComponent)
    const { queryByText } = render(<MockCompWithUser message="How are you?" />)
    expect(queryByText('Hello! How are you?')).toBeTruthy()
  })

  it('does not render the child component when there is no server-side or client-side user and rendering without a user is *not* allowed', () => {
    expect.assertions(1)
    const withAuthUser = require('src/withAuthUser').default
    const MockCompWithUser = withAuthUser({
      authRequired: true,
      redirectIfAuthed: false,
    })(MockComponent)
    const { queryByText } = render(<MockCompWithUser message="How are you?" />)
    expect(queryByText('Hello! How are you?')).toBeNull()
  })

  it('renders the child component when there is a server-side user and rendering without a user is *not* allowed', () => {
    expect.assertions(1)
    const withAuthUser = require('src/withAuthUser').default
    const MockSerializedAuthUser = createMockSerializedAuthUser()
    const MockCompWithUser = withAuthUser({
      authRequired: true,
      redirectIfAuthed: false,
    })(MockComponent)
    const { queryByText } = render(
      <MockCompWithUser
        AuthUserSerialized={MockSerializedAuthUser}
        message="How are you?"
      />
    )
    expect(queryByText('Hello! How are you?')).toBeTruthy()
  })

  it('renders the child component when there is a client-side user (but no server-side user) and rendering without a user is *not* allowed', () => {
    expect.assertions(1)
    const withAuthUser = require('src/withAuthUser').default
    const MockSerializedAuthUser = undefined // no server-side user
    useFirebaseUser.mockReturnValue({
      user: createMockFirebaseUserClientSDK(), // client-side user exists
      initialized: true,
    })
    const MockCompWithUser = withAuthUser({
      authRequired: true,
      redirectIfAuthed: false,
    })(MockComponent)
    const { queryByText } = render(
      <MockCompWithUser
        AuthUserSerialized={MockSerializedAuthUser}
        message="How are you?"
      />
    )
    expect(queryByText('Hello! How are you?')).toBeTruthy()
  })

  it('renders the child component when there is a client-side user after initial rendering (but no server-side user) and rendering without a user is *not* allowed', () => {
    expect.assertions(2)
    const withAuthUser = require('src/withAuthUser').default
    const MockSerializedAuthUser = undefined // no server-side user
    const MockCompWithUser = withAuthUser({
      authRequired: true,
      redirectIfAuthed: false,
    })(MockComponent)
    const { queryByText, rerender } = render(
      <MockCompWithUser
        AuthUserSerialized={MockSerializedAuthUser}
        message="How are you?"
      />
    )

    // The wrapped component will only render after the client-side
    // user is available.
    expect(queryByText('Hello! How are you?')).toBeNull()
    useFirebaseUser.mockReturnValue({
      user: createMockFirebaseUserClientSDK(),
      initialized: true,
    })
    rerender(
      <MockCompWithUser
        AuthUserSerialized={MockSerializedAuthUser}
        message="How are you?"
      />
    )
    expect(queryByText('Hello! How are you?')).toBeTruthy()
  })

  it('sets the AuthUser context to an empty AuthUser when there is no server-side or client-side user', () => {
    expect.assertions(1)
    const withAuthUser = require('src/withAuthUser').default
    const MockSerializedAuthUser = undefined // no server-side user
    useFirebaseUser.mockReturnValue({
      user: undefined, // no client-side user exists
      initialized: false,
    })
    const expectedAuthUser = {
      ...createAuthUser(),
      getIdToken: expect.any(Function),
      serialize: expect.any(Function),
      signOut: expect.any(Function),
    }

    let wrappedCompAuthUser
    const AnotherMockComponent = () => {
      // eslint-disable-next-line no-unused-vars
      wrappedCompAuthUser = useAuthUser()
      return <div>hi!</div>
    }

    const MockCompWithUser = withAuthUser({
      authRequired: false,
      redirectIfAuthed: false,
    })(AnotherMockComponent)
    render(<MockCompWithUser AuthUserSerialized={MockSerializedAuthUser} />)
    expect(wrappedCompAuthUser).toEqual(expectedAuthUser)
  })

  it('sets the AuthUser context using the server-side user (when there is no client-side user)', () => {
    expect.assertions(1)
    const withAuthUser = require('src/withAuthUser').default
    const MockSerializedAuthUser = createMockSerializedAuthUser()
    const expectedAuthUser = {
      ...createAuthUser({
        serializedAuthUser: MockSerializedAuthUser,
      }),
      getIdToken: expect.any(Function),
      serialize: expect.any(Function),
      signOut: expect.any(Function),
    }
    useFirebaseUser.mockReturnValue({
      user: undefined, // no client-side user exists
      initialized: false,
    })

    let wrappedCompAuthUser
    const AnotherMockComponent = () => {
      // eslint-disable-next-line no-unused-vars
      wrappedCompAuthUser = useAuthUser()
      return <div>hi!</div>
    }

    const MockCompWithUser = withAuthUser({
      authRequired: true,
      redirectIfAuthed: false,
    })(AnotherMockComponent)
    render(<MockCompWithUser AuthUserSerialized={MockSerializedAuthUser} />)
    expect(wrappedCompAuthUser).toEqual(expectedAuthUser)
  })

  it('sets the AuthUser context using the client-side user (when there is no server-side user)', () => {
    expect.assertions(1)
    const withAuthUser = require('src/withAuthUser').default
    const MockSerializedAuthUser = undefined // no server-side user

    const mockFirebaseUser = createMockFirebaseUserClientSDK()
    useFirebaseUser.mockReturnValue({
      user: mockFirebaseUser, // client-side user exists
      initialized: true,
    })
    const expectedAuthUser = {
      ...createAuthUser({
        firebaseUserClientSDK: mockFirebaseUser,
      }),
      clientInitialized: true,
      getIdToken: expect.any(Function),
      serialize: expect.any(Function),
      signOut: expect.any(Function),
    }

    let wrappedCompAuthUser
    const AnotherMockComponent = () => {
      // eslint-disable-next-line no-unused-vars
      wrappedCompAuthUser = useAuthUser()
      return <div>hi!</div>
    }

    const MockCompWithUser = withAuthUser({
      authRequired: true,
      redirectIfAuthed: false,
    })(AnotherMockComponent)
    render(<MockCompWithUser AuthUserSerialized={MockSerializedAuthUser} />)
    expect(wrappedCompAuthUser).toEqual(expectedAuthUser)
  })

  it('sets the AuthUser context using the client-side user when both client-side and server-side user info exists', () => {
    expect.assertions(1)
    const withAuthUser = require('src/withAuthUser').default
    const MockSerializedAuthUser = createMockSerializedAuthUser() // server-side user exists
    const mockFirebaseUser = createMockFirebaseUserClientSDK()
    useFirebaseUser.mockReturnValue({
      user: mockFirebaseUser, // client-side user exists
      initialized: true,
    })

    // Will use the client-side user when both exist.
    const expectedAuthUser = {
      ...createAuthUser({
        firebaseUserClientSDK: mockFirebaseUser,
      }),
      clientInitialized: true,
      getIdToken: expect.any(Function),
      serialize: expect.any(Function),
      signOut: expect.any(Function),
    }

    let wrappedCompAuthUser
    const AnotherMockComponent = () => {
      // eslint-disable-next-line no-unused-vars
      wrappedCompAuthUser = useAuthUser()
      return <div>hi!</div>
    }

    const MockCompWithUser = withAuthUser({
      authRequired: true,
      redirectIfAuthed: false,
    })(AnotherMockComponent)
    render(<MockCompWithUser AuthUserSerialized={MockSerializedAuthUser} />)
    expect(wrappedCompAuthUser).toEqual(expectedAuthUser)
  })

  it('sets the AuthUser context using the server-side user when both client-side and server-side user info exists but the Firebase JS SDK has not initialized', () => {
    expect.assertions(1)
    const withAuthUser = require('src/withAuthUser').default
    const MockSerializedAuthUser = createMockSerializedAuthUser() // server-side user exists
    useFirebaseUser.mockReturnValue({
      user: undefined,
      initialized: false,
    })

    // Will use the server-side user when the Firebase JS SDK has not
    // yet initialized.
    const expectedAuthUser = {
      ...createAuthUser({
        serializedAuthUser: MockSerializedAuthUser,
      }),
      getIdToken: expect.any(Function),
      serialize: expect.any(Function),
      signOut: expect.any(Function),
    }

    let wrappedCompAuthUser
    const AnotherMockComponent = () => {
      // eslint-disable-next-line no-unused-vars
      wrappedCompAuthUser = useAuthUser()
      return <div>hi!</div>
    }

    const MockCompWithUser = withAuthUser({
      authRequired: true,
      redirectIfAuthed: false,
    })(AnotherMockComponent)
    render(<MockCompWithUser AuthUserSerialized={MockSerializedAuthUser} />)
    expect(wrappedCompAuthUser).toEqual(expectedAuthUser)
  })

  it('sets the AuthUser context to an empty AuthUser when the server-side user exists, but the Firebase JS SDK *has* initialized and has no user', () => {
    expect.assertions(1)
    const withAuthUser = require('src/withAuthUser').default
    const MockSerializedAuthUser = createMockSerializedAuthUser() // server-side user exists
    useFirebaseUser.mockReturnValue({
      user: undefined,
      initialized: true,
    })

    // Will use the (unauthenticated) user when the Firebase JS SDK
    // has initialized, even if a server-side user exists. In this
    // case, cookies are set but Firebase JS SDK does not have auth
    // info.
    const expectedAuthUser = {
      ...createAuthUser(),
      clientInitialized: true,
      getIdToken: expect.any(Function),
      serialize: expect.any(Function),
      signOut: expect.any(Function),
    }

    let wrappedCompAuthUser
    const AnotherMockComponent = () => {
      // eslint-disable-next-line no-unused-vars
      wrappedCompAuthUser = useAuthUser()
      return <div>hi!</div>
    }

    const MockCompWithUser = withAuthUser({
      authRequired: false,
      redirectIfAuthed: false,
    })(AnotherMockComponent)
    render(<MockCompWithUser AuthUserSerialized={MockSerializedAuthUser} />)
    expect(wrappedCompAuthUser).toEqual(expectedAuthUser)
  })
})
