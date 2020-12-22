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

import AuthAction from 'src/AuthAction'

// Note that we don't mock createAuthUser or useAuthUser.
const mockRouterPush = jest.fn()
jest.mock('next/router', () => ({
  useRouter: () => ({ push: mockRouterPush }),
}))
jest.mock('src/useFirebaseUser')
jest.mock('src/isClientSide')

const MockComponent = ({ message }) => <div>Hello! {message}</div>

beforeEach(() => {
  // Default to client side context.
  const isClientSide = require('src/isClientSide').default
  isClientSide.mockReturnValue(true)

  setConfig(getMockConfig())

  useFirebaseUser.mockReturnValue({
    user: undefined,
    initialized: false,
  })
})

afterEach(() => {
  jest.clearAllMocks()
})

describe('withAuthUser: rendering/redirecting', () => {
  it('renders the child component when there is no server-side or client-side user by default (rendering is the default setting)', () => {
    expect.assertions(1)
    const withAuthUser = require('src/withAuthUser').default
    useFirebaseUser.mockReturnValue({
      user: undefined, // no client-side user
      initialized: false, // not yet initialized
    })
    const MockCompWithUser = withAuthUser()(MockComponent)
    const { queryByText } = render(<MockCompWithUser message="How are you?" />)
    expect(queryByText('Hello! How are you?')).toBeTruthy()
  })

  it('renders the child component when there is no server-side or client-side user and rendering without a user is allowed', () => {
    expect.assertions(1)
    const withAuthUser = require('src/withAuthUser').default
    useFirebaseUser.mockReturnValue({
      user: undefined, // no client-side user
      initialized: false, // not yet initialized
    })
    const MockCompWithUser = withAuthUser({
      whenUnauthedBeforeInit: AuthAction.RENDER,
      whenUnauthedAfterInit: AuthAction.RENDER,
      whenAuthed: AuthAction.RENDER,
    })(MockComponent)
    const { queryByText } = render(<MockCompWithUser message="How are you?" />)
    expect(queryByText('Hello! How are you?')).toBeTruthy()
  })

  it('returns null if when there is no server-side or client-side user and "whenUnauthedBeforeInit" is set to render null', () => {
    expect.assertions(1)
    const withAuthUser = require('src/withAuthUser').default
    useFirebaseUser.mockReturnValue({
      user: undefined, // no client-side user
      initialized: false, // not yet initialized
    })
    const MockCompWithUser = withAuthUser({
      whenUnauthedBeforeInit: AuthAction.RETURN_NULL,
      whenUnauthedAfterInit: AuthAction.RENDER,
      whenAuthed: AuthAction.RENDER,
    })(MockComponent)
    const { container } = render(<MockCompWithUser message="How are you?" />)
    expect(container.firstChild).toBeNull()
  })

  it('renders the child component when there is a server-side user and rendering without a user is *not* allowed', () => {
    expect.assertions(1)
    const withAuthUser = require('src/withAuthUser').default
    useFirebaseUser.mockReturnValue({
      user: undefined, // no client-side user
      initialized: false, // not yet initialized
    })
    const MockSerializedAuthUser = createMockSerializedAuthUser()
    const MockCompWithUser = withAuthUser({
      whenUnauthedBeforeInit: AuthAction.RENDER,
      whenUnauthedAfterInit: AuthAction.RENDER,
      whenAuthed: AuthAction.RENDER,
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
      whenUnauthedBeforeInit: AuthAction.RENDER,
      whenUnauthedAfterInit: AuthAction.RENDER,
      whenAuthed: AuthAction.RENDER,
    })(MockComponent)
    const { queryByText } = render(
      <MockCompWithUser
        AuthUserSerialized={MockSerializedAuthUser}
        message="How are you?"
      />
    )
    expect(queryByText('Hello! How are you?')).toBeTruthy()
  })

  it('renders the child component when there is a client-side user after Firebase initializes (but no server-side user) and rendering without a user should return null', () => {
    expect.assertions(2)
    const withAuthUser = require('src/withAuthUser').default
    const MockSerializedAuthUser = undefined // no server-side user
    const MockCompWithUser = withAuthUser({
      whenUnauthedBeforeInit: AuthAction.RETURN_NULL,
      whenUnauthedAfterInit: AuthAction.RENDER,
      whenAuthed: AuthAction.RENDER,
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

  it('shows the provided loading component on the client side when there is no user (*before* Firebase initializes) and a "show loader" strategy is set', () => {
    expect.assertions(1)
    const withAuthUser = require('src/withAuthUser').default
    const MockSerializedAuthUser = undefined // no server-side user
    useFirebaseUser.mockReturnValue({
      user: undefined, // no client-side user
      initialized: false, // not yet initialized
    })
    const MyLoader = () => <div>Things are loading up!</div>
    const MockCompWithUser = withAuthUser({
      whenUnauthedBeforeInit: AuthAction.SHOW_LOADER,
      whenUnauthedAfterInit: AuthAction.RENDER,
      redirectIfAuthed: true,
      LoaderComponent: MyLoader,
    })(MockComponent)
    const { queryByText } = render(
      <MockCompWithUser
        serializedAuthUser={MockSerializedAuthUser}
        message="How are you?"
      />
    )
    expect(queryByText('Things are loading up!')).toBeTruthy()
  })

  it('returns null if no loading component is provided but we should show a loader', () => {
    expect.assertions(1)
    const withAuthUser = require('src/withAuthUser').default
    const MockSerializedAuthUser = undefined // no server-side user
    useFirebaseUser.mockReturnValue({
      user: undefined, // no client-side user
      initialized: false, // not yet initialized
    })
    const MockCompWithUser = withAuthUser({
      whenUnauthedBeforeInit: AuthAction.SHOW_LOADER,
      whenUnauthedAfterInit: AuthAction.RENDER,
      redirectIfAuthed: true,
      LoaderComponent: undefined, // none defined
    })(MockComponent)
    const { container } = render(
      <MockCompWithUser
        serializedAuthUser={MockSerializedAuthUser}
        message="How are you?"
      />
    )
    expect(container.firstChild).toBeNull()
  })

  it('redirects to login on the client side when there is no user (*before* Firebase initializes) and a redirecting strategy is set', () => {
    expect.assertions(1)
    const withAuthUser = require('src/withAuthUser').default
    const MockSerializedAuthUser = undefined // no server-side user
    useFirebaseUser.mockReturnValue({
      user: undefined, // no client-side user
      initialized: false, // not yet initialized
    })
    const mockConfig = getMockConfig()
    setConfig({
      ...mockConfig,
      authPageURL: '/my-auth', // custom auth page
    })
    const MockCompWithUser = withAuthUser({
      whenUnauthedBeforeInit: AuthAction.REDIRECT_TO_LOGIN,
      // A user would normally not set this to render when they're redirecting
      // before initialization. We do this just for testing clarity.
      whenUnauthedAfterInit: AuthAction.RENDER,
      whenAuthed: AuthAction.RENDER,
    })(MockComponent)
    render(
      <MockCompWithUser
        serializedAuthUser={MockSerializedAuthUser}
        message="How are you?"
      />
    )
    expect(mockRouterPush).toHaveBeenCalledWith('/my-auth')
  })

  it('redirects to login on the client side when there is no user (*after* Firebase initializes) and a redirecting strategy is set', () => {
    expect.assertions(1)
    const withAuthUser = require('src/withAuthUser').default
    const MockSerializedAuthUser = undefined // no server-side user
    useFirebaseUser.mockReturnValue({
      user: undefined, // no client-side user
      initialized: true, // already initialized
    })
    const mockConfig = getMockConfig()
    setConfig({
      ...mockConfig,
      authPageURL: '/some-auth-page', // custom auth page
    })
    const MockCompWithUser = withAuthUser({
      whenUnauthedBeforeInit: AuthAction.RENDER,
      whenUnauthedAfterInit: AuthAction.REDIRECT_TO_LOGIN,
      whenAuthed: AuthAction.RENDER,
    })(MockComponent)
    render(
      <MockCompWithUser
        serializedAuthUser={MockSerializedAuthUser}
        message="How are you?"
      />
    )
    expect(mockRouterPush).toHaveBeenCalledWith('/some-auth-page')
  })

  it('does not redirect to login when server-side, even when a redirecting strategy is set (redirects here are client-side only)', () => {
    expect.assertions(1)
    const withAuthUser = require('src/withAuthUser').default
    const isClientSide = require('src/isClientSide').default
    isClientSide.mockReturnValue(false) // server-side
    const MockSerializedAuthUser = undefined // no server-side user
    useFirebaseUser.mockReturnValue({
      user: undefined, // no client-side user
      initialized: false, // not yet initialized
    })
    const mockConfig = getMockConfig()
    setConfig({
      ...mockConfig,
      authPageURL: '/my-auth', // custom auth page
    })
    const MockCompWithUser = withAuthUser({
      whenUnauthedBeforeInit: AuthAction.REDIRECT_TO_LOGIN,
      // A user would normally not set this to render when they're redirecting
      // before initialization. We do this just for testing clarity.
      whenUnauthedAfterInit: AuthAction.RENDER,
      whenAuthed: AuthAction.RENDER,
    })(MockComponent)
    render(
      <MockCompWithUser
        serializedAuthUser={MockSerializedAuthUser}
        message="How are you?"
      />
    )
    expect(mockRouterPush).not.toHaveBeenCalled()
  })

  it('throws if needing to redirect to login and "authPageURL" is not set in the config', () => {
    expect.assertions(1)
    const withAuthUser = require('src/withAuthUser').default
    const MockSerializedAuthUser = undefined // no server-side user
    useFirebaseUser.mockReturnValue({
      user: undefined, // no client-side user
      initialized: true, // already initialized
    })
    const mockConfig = getMockConfig()
    setConfig({
      ...mockConfig,
      authPageURL: undefined, // needs to be set
    })
    const MockCompWithUser = withAuthUser({
      whenUnauthedBeforeInit: AuthAction.RENDER,
      whenUnauthedAfterInit: AuthAction.REDIRECT_TO_LOGIN,
      whenAuthed: AuthAction.RENDER,
    })(MockComponent)

    // Suppress two expected console errors from our intentional
    // error during render.
    // https://spectrum.chat/testing-library/help/testing-components-that-should-throw~5b290c2e-6f70-4420-bedf-976c68ba83da
    jest
      .spyOn(console, 'error')
      .mockImplementationOnce(() => {})
      .mockImplementationOnce(() => {})

    expect(() => {
      render(
        <MockCompWithUser
          serializedAuthUser={MockSerializedAuthUser}
          message="How are you?"
        />
      )
    }).toThrow(
      'The "authPageURL" config setting must be set when using `REDIRECT_TO_LOGIN`.'
    )
  })

  it('redirects to the app on the client side when there is a user and a redirect-to-app-when-authed strategy is set', () => {
    expect.assertions(1)
    const withAuthUser = require('src/withAuthUser').default
    const MockSerializedAuthUser = undefined // no server-side user
    useFirebaseUser.mockReturnValue({
      user: createMockFirebaseUserClientSDK(), // client-side user exists
      initialized: true,
    })
    const mockConfig = getMockConfig()
    setConfig({
      ...mockConfig,
      appPageURL: '/my-app/here/', // custom app page
    })
    const MockCompWithUser = withAuthUser({
      whenUnauthedBeforeInit: AuthAction.RENDER,
      whenUnauthedAfterInit: AuthAction.RENDER,
      whenAuthed: AuthAction.REDIRECT_TO_APP,
    })(MockComponent)
    render(
      <MockCompWithUser
        serializedAuthUser={MockSerializedAuthUser}
        message="How are you?"
      />
    )
    expect(mockRouterPush).toHaveBeenCalledWith('/my-app/here/')
  })

  it('does not redirect to the app on the server side, even when we will redirect to the app on the client side', () => {
    expect.assertions(1)
    const withAuthUser = require('src/withAuthUser').default
    const isClientSide = require('src/isClientSide').default
    isClientSide.mockReturnValue(false) // server-side
    const MockSerializedAuthUser = undefined // no server-side user
    useFirebaseUser.mockReturnValue({
      user: createMockFirebaseUserClientSDK(), // client-side user exists
      initialized: true,
    })
    const mockConfig = getMockConfig()
    setConfig({
      ...mockConfig,
      appPageURL: '/my-app/here/', // custom app page
    })
    const MockCompWithUser = withAuthUser({
      whenUnauthedBeforeInit: AuthAction.RENDER,
      whenUnauthedAfterInit: AuthAction.RENDER,
      whenAuthed: AuthAction.REDIRECT_TO_APP,
    })(MockComponent)
    render(
      <MockCompWithUser
        serializedAuthUser={MockSerializedAuthUser}
        message="How are you?"
      />
    )
    expect(mockRouterPush).not.toHaveBeenCalled()
  })

  it('throws if needing to redirect to the app and "appPageURL" is not set in the config', () => {
    expect.assertions(1)
    const withAuthUser = require('src/withAuthUser').default
    const MockSerializedAuthUser = undefined // no server-side user
    useFirebaseUser.mockReturnValue({
      user: createMockFirebaseUserClientSDK(), // client-side user exists
      initialized: true,
    })
    const mockConfig = getMockConfig()
    setConfig({
      ...mockConfig,
      appPageURL: undefined, // should be set
    })
    const MockCompWithUser = withAuthUser({
      whenUnauthedBeforeInit: AuthAction.RENDER,
      whenUnauthedAfterInit: AuthAction.RENDER,
      whenAuthed: AuthAction.REDIRECT_TO_APP,
    })(MockComponent)

    // Suppress two expected console errors from our intentional
    // error during render.
    // https://spectrum.chat/testing-library/help/testing-components-that-should-throw~5b290c2e-6f70-4420-bedf-976c68ba83da
    jest
      .spyOn(console, 'error')
      .mockImplementationOnce(() => {})
      .mockImplementationOnce(() => {})

    expect(() => {
      render(
        <MockCompWithUser
          serializedAuthUser={MockSerializedAuthUser}
          message="How are you?"
        />
      )
    }).toThrow(
      'The "appPageURL" config setting must be set when using `REDIRECT_TO_APP`.'
    )
  })

  it('renders null when redirecting to the login', () => {
    expect.assertions(1)
    const withAuthUser = require('src/withAuthUser').default
    const MockSerializedAuthUser = undefined // no server-side user
    useFirebaseUser.mockReturnValue({
      user: undefined, // no client-side user
      initialized: true, // already initialized
    })
    const MockCompWithUser = withAuthUser({
      whenUnauthedBeforeInit: AuthAction.RENDER,
      whenUnauthedAfterInit: AuthAction.REDIRECT_TO_LOGIN,
      whenAuthed: AuthAction.RENDER,
    })(MockComponent)
    const { container } = render(
      <MockCompWithUser
        serializedAuthUser={MockSerializedAuthUser}
        message="How are you?"
      />
    )
    expect(container.firstChild).toBeNull()
  })

  it('renders null when redirecting to the app', () => {
    expect.assertions(1)
    const withAuthUser = require('src/withAuthUser').default
    const MockSerializedAuthUser = undefined // no server-side user
    useFirebaseUser.mockReturnValue({
      user: createMockFirebaseUserClientSDK(), // client-side user exists
      initialized: true,
    })
    const MockCompWithUser = withAuthUser({
      whenUnauthedBeforeInit: AuthAction.RENDER,
      whenUnauthedAfterInit: AuthAction.RENDER,
      whenAuthed: AuthAction.REDIRECT_TO_APP,
    })(MockComponent)
    const { container } = render(
      <MockCompWithUser
        serializedAuthUser={MockSerializedAuthUser}
        message="How are you?"
      />
    )
    expect(container.firstChild).toBeNull()
  })
})

describe('withAuthUser: AuthUser context', () => {
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
      whenUnauthedBeforeInit: AuthAction.RENDER,
      whenUnauthedAfterInit: AuthAction.RENDER,
      whenAuthed: AuthAction.RENDER,
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
      whenUnauthedBeforeInit: AuthAction.RENDER,
      whenUnauthedAfterInit: AuthAction.RENDER,
      whenAuthed: AuthAction.RENDER,
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
      whenUnauthedBeforeInit: AuthAction.RENDER,
      whenUnauthedAfterInit: AuthAction.RENDER,
      whenAuthed: AuthAction.RENDER,
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
      whenUnauthedBeforeInit: AuthAction.RENDER,
      whenUnauthedAfterInit: AuthAction.RENDER,
      whenAuthed: AuthAction.RENDER,
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
      whenUnauthedBeforeInit: AuthAction.RENDER,
      whenUnauthedAfterInit: AuthAction.RENDER,
      whenAuthed: AuthAction.RENDER,
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
      whenUnauthedBeforeInit: AuthAction.RENDER,
      whenUnauthedAfterInit: AuthAction.RENDER,
      whenAuthed: AuthAction.RENDER,
    })(AnotherMockComponent)
    render(<MockCompWithUser AuthUserSerialized={MockSerializedAuthUser} />)
    expect(wrappedCompAuthUser).toEqual(expectedAuthUser)
  })
})
