/* globals window */
import React from 'react'
import { render } from '@testing-library/react'
import { setConfig } from 'src/config'
import getMockConfig from 'src/testHelpers/createMockConfig'
import {
  createMockSerializedAuthUser,
  createMockFirebaseUserClientSDK,
} from 'src/testHelpers/authUserInputs'
import useAuthUser from 'src/useAuthUser'
import createAuthUser, { AuthUser as AuthUserType } from 'src/createAuthUser'
import useFirebaseUser from 'src/useFirebaseUser'
import { AuthAction } from 'src/AuthAction'
import logDebug from 'src/logDebug'
import withAuthUser from 'src/withAuthUser'

// Note that we don't mock createAuthUser or useAuthUser.
const mockRouterPush = jest.fn()
const mockRouterReplace = jest.fn()
jest.mock('next/router', () => ({
  useRouter: () => ({ push: mockRouterPush, replace: mockRouterReplace }),
}))
jest.mock('src/useFirebaseUser')
jest.mock('src/isClientSide')
jest.mock('src/logDebug')

const mockUseFirebaseUser = jest.mocked(useFirebaseUser)

interface MockComponentProps {
  message?: string
}
const MockComponent = ({ message = '' }: MockComponentProps) => (
  <div>Hello! {message}</div>
)
MockComponent.defaultProps = {
  message: 'How are you?',
}

const getUseFirebaseUserResponse = () => ({
  user: null,
  claims: {},
  initialized: false,
  authRequestCompleted: false,
})

const originalWindowLocation = window.location

beforeEach(() => {
  Object.defineProperty(window, 'location', {
    configurable: true,
    enumerable: true,
    value: {
      replace: jest.fn(),
    },
  })

  // Default to client side context.
  const isClientSide = require('src/isClientSide').default
  isClientSide.mockReturnValue(true)

  setConfig(getMockConfig())

  mockUseFirebaseUser.mockReturnValue(getUseFirebaseUserResponse())
})

afterEach(() => {
  Object.defineProperty(window, 'location', {
    configurable: true,
    enumerable: true,
    value: originalWindowLocation,
  })

  jest.clearAllMocks()
})

describe('withAuthUser: rendering/redirecting', () => {
  it('renders the child component when there is no server-side or client-side user by default (rendering is the default setting)', () => {
    expect.assertions(1)
    mockUseFirebaseUser.mockReturnValue({
      ...getUseFirebaseUserResponse(),
      user: null, // no client-side user
      initialized: false, // not yet initialized
    })
    const MockCompWithUser = withAuthUser<MockComponentProps>()(MockComponent)
    const { queryByText } = render(<MockCompWithUser message="How are you?" />)
    expect(queryByText('Hello! How are you?')).toBeTruthy()
  })

  it('renders the child component when there is no server-side or client-side user and rendering without a user is allowed', () => {
    expect.assertions(1)
    mockUseFirebaseUser.mockReturnValue({
      ...getUseFirebaseUserResponse(),
      user: null, // no client-side user
      initialized: false, // not yet initialized
    })
    const MockCompWithUser = withAuthUser<MockComponentProps>({
      whenUnauthedBeforeInit: AuthAction.RENDER,
      whenUnauthedAfterInit: AuthAction.RENDER,
      whenAuthed: AuthAction.RENDER,
    })(MockComponent)
    const { queryByText } = render(<MockCompWithUser message="How are you?" />)
    expect(queryByText('Hello! How are you?')).toBeTruthy()
  })

  it('returns null if when there is no server-side or client-side user and "whenUnauthedBeforeInit" is set to render null', () => {
    expect.assertions(1)
    mockUseFirebaseUser.mockReturnValue({
      ...getUseFirebaseUserResponse(),
      user: null, // no client-side user
      initialized: false, // not yet initialized
    })
    const MockCompWithUser = withAuthUser<MockComponentProps>({
      whenUnauthedBeforeInit: AuthAction.RETURN_NULL,
      whenUnauthedAfterInit: AuthAction.RENDER,
      whenAuthed: AuthAction.RENDER,
    })(MockComponent)
    const { container } = render(<MockCompWithUser message="How are you?" />)
    expect(container.firstChild).toBeNull()
  })

  it('renders the child component when there is a server-side user and rendering without a user is *not* allowed', () => {
    expect.assertions(1)
    mockUseFirebaseUser.mockReturnValue({
      ...getUseFirebaseUserResponse(),
      user: null, // no client-side user
      initialized: false, // not yet initialized
    })
    const MockSerializedAuthUser = createMockSerializedAuthUser()
    const MockCompWithUser = withAuthUser<MockComponentProps>({
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
    const MockSerializedAuthUser = undefined // no server-side user
    mockUseFirebaseUser.mockReturnValue({
      ...getUseFirebaseUserResponse(),
      user: createMockFirebaseUserClientSDK(), // client-side user exists
      initialized: true,
      authRequestCompleted: true,
    })
    const MockCompWithUser = withAuthUser<MockComponentProps>({
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
    const MockSerializedAuthUser = undefined // no server-side user
    const MockCompWithUser = withAuthUser<MockComponentProps>({
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
    mockUseFirebaseUser.mockReturnValue({
      ...getUseFirebaseUserResponse(),
      user: createMockFirebaseUserClientSDK(),
      initialized: true,
      authRequestCompleted: true,
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
    const MockSerializedAuthUser = undefined // no server-side user
    mockUseFirebaseUser.mockReturnValue({
      ...getUseFirebaseUserResponse(),
      user: null, // no client-side user
      initialized: false, // not yet initialized
      authRequestCompleted: false,
    })
    const MyLoader = () => <div>Things are loading up!</div>
    const MockCompWithUser = withAuthUser<MockComponentProps>({
      whenUnauthedBeforeInit: AuthAction.SHOW_LOADER,
      whenUnauthedAfterInit: AuthAction.RENDER,
      LoaderComponent: MyLoader,
    })(MockComponent)
    const { queryByText } = render(
      <MockCompWithUser
        AuthUserSerialized={MockSerializedAuthUser}
        message="How are you?"
      />
    )
    expect(queryByText('Things are loading up!')).toBeTruthy()
  })

  it('returns null if no loading component is provided but we should show a loader', () => {
    expect.assertions(1)
    const MockSerializedAuthUser = undefined // no server-side user
    mockUseFirebaseUser.mockReturnValue({
      ...getUseFirebaseUserResponse(),
      user: null, // no client-side user
      initialized: false, // not yet initialized
    })
    const MockCompWithUser = withAuthUser<MockComponentProps>({
      whenUnauthedBeforeInit: AuthAction.SHOW_LOADER,
      whenUnauthedAfterInit: AuthAction.RENDER,
      LoaderComponent: undefined, // none defined
    })(MockComponent)
    const { container } = render(
      <MockCompWithUser
        AuthUserSerialized={MockSerializedAuthUser}
        message="How are you?"
      />
    )
    expect(container.firstChild).toBeNull()
  })

  it('redirects to login on the client side when there is no user (*before* Firebase initializes) and a redirecting strategy is set', () => {
    expect.assertions(1)
    const MockSerializedAuthUser = undefined // no server-side user
    mockUseFirebaseUser.mockReturnValue({
      ...getUseFirebaseUserResponse(),
      user: null, // no client-side user
      initialized: false, // not yet initialized
      authRequestCompleted: false,
    })
    const mockConfig = getMockConfig()
    setConfig({
      ...mockConfig,
      authPageURL: '/my-auth', // custom auth page
    })
    const MockCompWithUser = withAuthUser<MockComponentProps>({
      whenUnauthedBeforeInit: AuthAction.REDIRECT_TO_LOGIN,
      // A user would normally not set this to render when they're redirecting
      // before initialization. We do this just for testing clarity.
      whenUnauthedAfterInit: AuthAction.RENDER,
      whenAuthed: AuthAction.RENDER,
    })(MockComponent)
    render(
      <MockCompWithUser
        AuthUserSerialized={MockSerializedAuthUser}
        message="How are you?"
      />
    )
    expect(mockRouterReplace).toHaveBeenCalledWith('/my-auth')
  })

  it('logs a debugging message when redirecting to login', () => {
    expect.assertions(1)
    const MockSerializedAuthUser = undefined // no server-side user
    mockUseFirebaseUser.mockReturnValue({
      ...getUseFirebaseUserResponse(),
      user: null, // no client-side user
      initialized: false, // not yet initialized
      authRequestCompleted: false,
    })
    const mockConfig = getMockConfig()
    setConfig({
      ...mockConfig,
      authPageURL: '/my-auth', // custom auth page
    })
    const MockCompWithUser = withAuthUser<MockComponentProps>({
      whenUnauthedBeforeInit: AuthAction.REDIRECT_TO_LOGIN,
      // A user would normally not set this to render when they're redirecting
      // before initialization. We do this just for testing clarity.
      whenUnauthedAfterInit: AuthAction.RENDER,
      whenAuthed: AuthAction.RENDER,
    })(MockComponent)
    render(
      <MockCompWithUser
        AuthUserSerialized={MockSerializedAuthUser}
        message="How are you?"
      />
    )
    expect(logDebug).toHaveBeenCalledWith(
      '[withAuthUser] Redirecting to login.'
    )
  })

  it('redirects to login on the client side when there is no user and a redirecting strategy is set, but only *after* Firebase initializes and the auth cookie request is complete', () => {
    expect.assertions(3)
    const MockSerializedAuthUser = undefined // no server-side user
    mockUseFirebaseUser.mockReturnValue({
      ...getUseFirebaseUserResponse(),
      user: null, // no client-side user
      initialized: false, // not initialized
      authRequestCompleted: false, // login request not completed
    })
    const mockConfig = getMockConfig()
    setConfig({
      ...mockConfig,
      authPageURL: '/some-auth-page', // custom auth page
    })
    const MockCompWithUser = withAuthUser<MockComponentProps>({
      whenUnauthedBeforeInit: AuthAction.RENDER,
      whenUnauthedAfterInit: AuthAction.REDIRECT_TO_LOGIN,
      whenAuthed: AuthAction.RENDER,
    })(MockComponent)
    const { rerender } = render(
      <MockCompWithUser
        AuthUserSerialized={MockSerializedAuthUser}
        message="How are you?"
      />
    )
    expect(mockRouterReplace).not.toHaveBeenCalled()
    mockUseFirebaseUser.mockReturnValue({
      ...getUseFirebaseUserResponse(),
      user: null,
      initialized: true, // changed
      authRequestCompleted: false,
    })
    rerender(
      <MockCompWithUser
        AuthUserSerialized={MockSerializedAuthUser}
        message="How are you?"
      />
    )
    expect(mockRouterReplace).not.toHaveBeenCalled()
    mockUseFirebaseUser.mockReturnValue({
      ...getUseFirebaseUserResponse(),
      user: null,
      initialized: true,
      authRequestCompleted: true, // changed
    })
    rerender(
      <MockCompWithUser
        AuthUserSerialized={MockSerializedAuthUser}
        message="How are you?"
      />
    )
    expect(mockRouterReplace).toHaveBeenCalledWith('/some-auth-page')
  })

  it('does not redirect to login when server-side, even when a redirecting strategy is set (redirects here are client-side only)', () => {
    expect.assertions(1)
    const isClientSide = require('src/isClientSide').default
    isClientSide.mockReturnValue(false) // server-side
    const MockSerializedAuthUser = undefined // no server-side user
    mockUseFirebaseUser.mockReturnValue({
      ...getUseFirebaseUserResponse(),
      user: null, // no client-side user
      initialized: false, // not yet initialized
      authRequestCompleted: false,
    })
    const mockConfig = getMockConfig()
    setConfig({
      ...mockConfig,
      authPageURL: '/my-auth', // custom auth page
    })
    const MockCompWithUser = withAuthUser<MockComponentProps>({
      whenUnauthedBeforeInit: AuthAction.REDIRECT_TO_LOGIN,
      // A user would normally not set this to render when they're redirecting
      // before initialization. We do this just for testing clarity.
      whenUnauthedAfterInit: AuthAction.RENDER,
      whenAuthed: AuthAction.RENDER,
    })(MockComponent)
    render(
      <MockCompWithUser
        AuthUserSerialized={MockSerializedAuthUser}
        message="How are you?"
      />
    )
    expect(mockRouterReplace).not.toHaveBeenCalled()
  })

  it('throws if needing to redirect to login and "authPageURL" is not set in the config', () => {
    expect.assertions(1)
    const MockSerializedAuthUser = undefined // no server-side user
    mockUseFirebaseUser.mockReturnValue({
      ...getUseFirebaseUserResponse(),
      user: null, // no client-side user
      initialized: true, // already initialized
      authRequestCompleted: true,
    })
    const mockConfig = getMockConfig()
    setConfig({
      ...mockConfig,
      authPageURL: undefined, // needs to be set
    })
    const MockCompWithUser = withAuthUser<MockComponentProps>({
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
          AuthUserSerialized={MockSerializedAuthUser}
          message="How are you?"
        />
      )
    }).toThrow(
      'The "authPageURL" must be set to a non-empty string, an object literal containing "destination", or a function that returns either.'
    )
  })

  it('throws if needing to redirect to login and "authPageURL" is a function that does not resolve to a non-empty string', () => {
    expect.assertions(1)
    const MockSerializedAuthUser = undefined // no server-side user
    mockUseFirebaseUser.mockReturnValue({
      ...getUseFirebaseUserResponse(),
      user: null, // no client-side user exists
      initialized: true,
      authRequestCompleted: true,
    })
    const mockConfig = getMockConfig()
    setConfig({
      ...mockConfig,
      authPageURL: () => undefined as unknown as string, // should be set
    })
    const MockCompWithUser = withAuthUser<MockComponentProps>({
      whenUnauthedBeforeInit: AuthAction.REDIRECT_TO_LOGIN,
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

    expect(() =>
      render(
        <MockCompWithUser
          AuthUserSerialized={MockSerializedAuthUser}
          message="How are you?"
        />
      )
    ).toThrow(
      'The "authPageURL" must be set to a non-empty string, an object literal containing "destination", or a function that returns either.'
    )
  })

  it('calls the "authPageURL" function with an undefined context and unauthed AuthUser if redirecting to the login page on client', () => {
    expect.assertions(3)
    const MockSerializedAuthUser = undefined // no server-side user
    mockUseFirebaseUser.mockReturnValue({
      ...getUseFirebaseUserResponse(),
      user: null, // no client-side user
      initialized: true, // already initialized
      authRequestCompleted: true,
    })
    const mockConfig = getMockConfig()
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    let propsSpy: { [key: string]: any } = {}
    setConfig({
      ...mockConfig,
      authPageURL: (props) => {
        propsSpy = props
        return `/some-auth-page`
      }, // custom auth page
    })
    const MockCompWithUser = withAuthUser<MockComponentProps>({
      whenUnauthedBeforeInit: AuthAction.RENDER,
      whenUnauthedAfterInit: AuthAction.REDIRECT_TO_LOGIN,
      whenAuthed: AuthAction.RENDER,
    })(MockComponent)
    render(
      <MockCompWithUser
        AuthUserSerialized={MockSerializedAuthUser}
        message="How are you?"
      />
    )
    expect(propsSpy.ctx).toBeUndefined()
    expect(propsSpy.AuthUser.id).toBeNull()
    expect(mockRouterReplace).toHaveBeenCalledWith('/some-auth-page')
  })

  it('redirects to the app on the client side only when there is a user, a redirect-to-app-when-authed strategy is set, and the request to set cookies has completed', () => {
    expect.assertions(3)
    const MockSerializedAuthUser = undefined // no server-side user
    mockUseFirebaseUser.mockReturnValue({
      ...getUseFirebaseUserResponse(),
      user: createMockFirebaseUserClientSDK(), // client-side user exists
      claims: undefined,
      initialized: false,
      authRequestCompleted: false,
    })
    const mockConfig = getMockConfig()
    setConfig({
      ...mockConfig,
      appPageURL: '/my-app/here/', // custom app page
    })
    const MockCompWithUser = withAuthUser<MockComponentProps>({
      whenUnauthedBeforeInit: AuthAction.RENDER,
      whenUnauthedAfterInit: AuthAction.RENDER,
      whenAuthed: AuthAction.REDIRECT_TO_APP,
    })(MockComponent)
    const { rerender } = render(
      <MockCompWithUser
        AuthUserSerialized={MockSerializedAuthUser}
        message="How are you?"
      />
    )
    expect(mockRouterReplace).not.toHaveBeenCalled()
    mockUseFirebaseUser.mockReturnValue({
      ...getUseFirebaseUserResponse(),
      user: createMockFirebaseUserClientSDK(),
      claims: undefined,
      initialized: true, // changed
      authRequestCompleted: false,
    })
    rerender(
      <MockCompWithUser
        AuthUserSerialized={MockSerializedAuthUser}
        message="How are you?"
      />
    )
    expect(mockRouterReplace).not.toHaveBeenCalled()
    mockUseFirebaseUser.mockReturnValue({
      ...getUseFirebaseUserResponse(),
      user: createMockFirebaseUserClientSDK(),
      claims: undefined,
      initialized: true,
      authRequestCompleted: true, // changed
    })
    rerender(
      <MockCompWithUser
        AuthUserSerialized={MockSerializedAuthUser}
        message="How are you?"
      />
    )
    expect(mockRouterReplace).toHaveBeenCalledWith('/my-app/here/')
  })

  it('logs a debugging message when redirecting to the app', () => {
    expect.assertions(1)
    const MockSerializedAuthUser = undefined // no server-side user
    mockUseFirebaseUser.mockReturnValue({
      ...getUseFirebaseUserResponse(),
      user: createMockFirebaseUserClientSDK(), // client-side user exists
      claims: undefined,
      initialized: true,
      authRequestCompleted: true,
    })
    const mockConfig = getMockConfig()
    setConfig({
      ...mockConfig,
      appPageURL: '/my-app/here/', // custom app page
    })
    const MockCompWithUser = withAuthUser<MockComponentProps>({
      whenUnauthedBeforeInit: AuthAction.RENDER,
      whenUnauthedAfterInit: AuthAction.RENDER,
      whenAuthed: AuthAction.REDIRECT_TO_APP,
    })(MockComponent)
    render(
      <MockCompWithUser
        AuthUserSerialized={MockSerializedAuthUser}
        message="How are you?"
      />
    )
    expect(logDebug).toHaveBeenCalledWith('[withAuthUser] Redirecting to app.')
  })

  it('does not redirect to the app on the server side, even when we will redirect to the app on the client side', () => {
    expect.assertions(1)
    const isClientSide = require('src/isClientSide').default
    isClientSide.mockReturnValue(false) // server-side
    const MockSerializedAuthUser = undefined // no server-side user
    mockUseFirebaseUser.mockReturnValue({
      ...getUseFirebaseUserResponse(),
      user: createMockFirebaseUserClientSDK(), // client-side user exists
      claims: undefined,
      initialized: true,
      authRequestCompleted: true,
    })
    const mockConfig = getMockConfig()
    setConfig({
      ...mockConfig,
      appPageURL: '/my-app/here/', // custom app page
    })
    const MockCompWithUser = withAuthUser<MockComponentProps>({
      whenUnauthedBeforeInit: AuthAction.RENDER,
      whenUnauthedAfterInit: AuthAction.RENDER,
      whenAuthed: AuthAction.REDIRECT_TO_APP,
    })(MockComponent)
    render(
      <MockCompWithUser
        AuthUserSerialized={MockSerializedAuthUser}
        message="How are you?"
      />
    )
    expect(mockRouterReplace).not.toHaveBeenCalled()
  })

  it('throws if needing to redirect to the app and "appPageURL" is not set in the config', () => {
    expect.assertions(1)
    const MockSerializedAuthUser = undefined // no server-side user
    mockUseFirebaseUser.mockReturnValue({
      ...getUseFirebaseUserResponse(),
      user: createMockFirebaseUserClientSDK(), // client-side user exists
      initialized: true,
      authRequestCompleted: true,
    })
    const mockConfig = getMockConfig()
    setConfig({
      ...mockConfig,
      appPageURL: undefined, // should be set
    })
    const MockCompWithUser = withAuthUser<MockComponentProps>({
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
          AuthUserSerialized={MockSerializedAuthUser}
          message="How are you?"
        />
      )
    }).toThrow(
      'The "appPageURL" must be set to a non-empty string, an object literal containing "destination", or a function that returns either.'
    )
  })

  it('throws if needing to redirect to the app and "appPageURL" is a function that does not resolve to a non-empty string', () => {
    expect.assertions(1)
    const MockSerializedAuthUser = undefined // no server-side user
    mockUseFirebaseUser.mockReturnValue({
      ...getUseFirebaseUserResponse(),
      user: createMockFirebaseUserClientSDK(), // client-side user exists
      initialized: true,
      authRequestCompleted: true,
    })
    const mockConfig = getMockConfig()
    setConfig({
      ...mockConfig,
      appPageURL: () => undefined as unknown as string, // should be set
    })
    const MockCompWithUser = withAuthUser<MockComponentProps>({
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
          AuthUserSerialized={MockSerializedAuthUser}
          message="How are you?"
        />
      )
    }).toThrow(
      'The "appPageURL" must be set to a non-empty string, an object literal containing "destination", or a function that returns either.'
    )
  })

  it('calls "appPageURL" with an undefined context and valid AuthUser if redirecting to the app page and a function is provided', () => {
    expect.assertions(2)
    const MockSerializedAuthUser = undefined // no server-side user
    mockUseFirebaseUser.mockReturnValue({
      ...getUseFirebaseUserResponse(),
      user: createMockFirebaseUserClientSDK(), // client-side user exists
      initialized: true,
      authRequestCompleted: true,
    })
    const mockConfig = getMockConfig()
    let ctxSpy
    setConfig({
      ...mockConfig,
      appPageURL: ({ ctx, AuthUser }) => {
        ctxSpy = ctx
        return `/my-app/here/?email=${AuthUser?.email}` // custom app page
      },
    })
    const MockCompWithUser = withAuthUser<MockComponentProps>({
      whenUnauthedBeforeInit: AuthAction.RENDER,
      whenUnauthedAfterInit: AuthAction.RENDER,
      whenAuthed: AuthAction.REDIRECT_TO_APP,
    })(MockComponent)
    render(
      <MockCompWithUser
        AuthUserSerialized={MockSerializedAuthUser}
        message="How are you?"
      />
    )
    expect(ctxSpy).toBeUndefined()
    expect(mockRouterReplace).toHaveBeenCalledWith(
      '/my-app/here/?email=abc@example.com'
    )
  })

  it('renders null when redirecting to login and whenUnauthedBeforeInit === AuthAction.RETURN_NULL', () => {
    expect.assertions(1)
    const MockSerializedAuthUser = undefined // no server-side user
    mockUseFirebaseUser.mockReturnValue({
      ...getUseFirebaseUserResponse(),
      user: null, // no client-side user
      initialized: true, // already initialized
      authRequestCompleted: true,
    })
    const MockCompWithUser = withAuthUser<MockComponentProps>({
      whenUnauthedBeforeInit: AuthAction.RETURN_NULL,
      whenUnauthedAfterInit: AuthAction.REDIRECT_TO_LOGIN,
      whenAuthed: AuthAction.RENDER,
    })(MockComponent)
    const { container } = render(
      <MockCompWithUser
        AuthUserSerialized={MockSerializedAuthUser}
        message="How are you?"
      />
    )
    expect(container.firstChild).toBeNull()
  })

  it('renders the loader when redirecting to login and whenUnauthedBeforeInit === AuthAction.SHOW_LOADER', () => {
    expect.assertions(1)
    const MockSerializedAuthUser = undefined // no server-side user
    mockUseFirebaseUser.mockReturnValue({
      ...getUseFirebaseUserResponse(),
      user: null, // no client-side user
      initialized: true, // already initialized
      authRequestCompleted: true,
    })
    const MyLoader = () => <div>Things are loading up!</div>
    const MockCompWithUser = withAuthUser<MockComponentProps>({
      whenUnauthedBeforeInit: AuthAction.SHOW_LOADER,
      whenUnauthedAfterInit: AuthAction.REDIRECT_TO_LOGIN,
      whenAuthed: AuthAction.RENDER,
      LoaderComponent: MyLoader,
    })(MockComponent)
    const { queryByText } = render(
      <MockCompWithUser
        AuthUserSerialized={MockSerializedAuthUser}
        message="How are you?"
      />
    )
    expect(queryByText('Things are loading up!')).toBeTruthy()
  })

  it('renders the child component when redirecting to login and whenUnauthedBeforeInit === AuthAction.RENDER', () => {
    expect.assertions(1)
    const MockSerializedAuthUser = undefined // no server-side user
    mockUseFirebaseUser.mockReturnValue({
      ...getUseFirebaseUserResponse(),
      user: null, // no client-side user
      initialized: true, // already initialized
      authRequestCompleted: true,
    })
    const MockCompWithUser = withAuthUser<MockComponentProps>({
      whenUnauthedBeforeInit: AuthAction.RENDER,
      whenUnauthedAfterInit: AuthAction.REDIRECT_TO_LOGIN,
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

  it('renders null by default when redirecting to the app', () => {
    expect.assertions(1)
    const MockSerializedAuthUser = undefined // no server-side user
    mockUseFirebaseUser.mockReturnValue({
      ...getUseFirebaseUserResponse(),
      user: createMockFirebaseUserClientSDK(), // client-side user exists
      initialized: true,
      authRequestCompleted: true,
    })
    const MockCompWithUser = withAuthUser<MockComponentProps>({
      whenUnauthedBeforeInit: AuthAction.RENDER,
      whenUnauthedAfterInit: AuthAction.RENDER,
      whenAuthed: AuthAction.REDIRECT_TO_APP,
    })(MockComponent)
    const { container } = render(
      <MockCompWithUser
        AuthUserSerialized={MockSerializedAuthUser}
        message="How are you?"
      />
    )
    expect(container.firstChild).toBeNull()
  })

  it('renders the child component when redirecting to the app and whenAuthedBeforeRedirect === AuthAction.RENDER', () => {
    expect.assertions(1)
    const MockSerializedAuthUser = undefined // no server-side user
    mockUseFirebaseUser.mockReturnValue({
      ...getUseFirebaseUserResponse(),
      user: createMockFirebaseUserClientSDK(), // client-side user exists
      initialized: true,
      authRequestCompleted: true,
    })
    const MockCompWithUser = withAuthUser<MockComponentProps>({
      whenAuthedBeforeRedirect: AuthAction.RENDER,
      whenAuthed: AuthAction.REDIRECT_TO_APP,
    })(MockComponent)
    const { queryByText } = render(
      <MockCompWithUser
        AuthUserSerialized={MockSerializedAuthUser}
        message="How are you?"
      />
    )
    expect(queryByText('Hello! How are you?')).toBeTruthy()
  })

  it('renders the loader component when redirecting to the app and whenAuthedBeforeRedirect === AuthAction.SHOW_LOADER', () => {
    expect.assertions(1)
    const MockSerializedAuthUser = undefined // no server-side user
    mockUseFirebaseUser.mockReturnValue({
      ...getUseFirebaseUserResponse(),
      user: createMockFirebaseUserClientSDK(), // client-side user exists
      initialized: true,
      authRequestCompleted: true,
    })
    const MyLoader = () => <div>Things are loading up!</div>
    const MockCompWithUser = withAuthUser<MockComponentProps>({
      whenAuthedBeforeRedirect: AuthAction.SHOW_LOADER,
      whenAuthed: AuthAction.REDIRECT_TO_APP,
      LoaderComponent: MyLoader,
    })(MockComponent)
    const { queryByText } = render(
      <MockCompWithUser
        AuthUserSerialized={MockSerializedAuthUser}
        message="How are you?"
      />
    )
    expect(queryByText('Things are loading up!')).toBeTruthy()
  })

  it('renders null by default when redirecting to the app, even while waiting for authRequestCompleted', () => {
    expect.assertions(1)
    const MockSerializedAuthUser = undefined // no server-side user
    mockUseFirebaseUser.mockReturnValue({
      ...getUseFirebaseUserResponse(),
      user: createMockFirebaseUserClientSDK(), // client-side user exists
      initialized: true,
      authRequestCompleted: false, // waiting
    })
    const MockCompWithUser = withAuthUser<MockComponentProps>({
      whenUnauthedBeforeInit: AuthAction.RENDER,
      whenUnauthedAfterInit: AuthAction.RENDER,
      whenAuthed: AuthAction.REDIRECT_TO_APP,
    })(MockComponent)
    const { container } = render(
      <MockCompWithUser
        AuthUserSerialized={MockSerializedAuthUser}
        message="How are you?"
      />
    )
    expect(container.firstChild).toBeNull()
  })

  it('calls the "authPageURL" function with an undefined context and unauthed AuthUser if redirecting to the login outside the base path on client', () => {
    expect.assertions(3)
    const MockSerializedAuthUser = undefined // no server-side user
    mockUseFirebaseUser.mockReturnValue({
      ...getUseFirebaseUserResponse(),
      user: null, // no client-side user
      initialized: true, // already initialized
      authRequestCompleted: true,
    })
    const mockConfig = getMockConfig()
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    let propsSpy: { [key: string]: any } = {}
    setConfig({
      ...mockConfig,
      authPageURL: (props) => {
        propsSpy = props
        return {
          destination: `/some-auth-page`,
          permanent: false,
          basePath: false,
        }
      }, // custom auth page
    })
    const MockCompWithUser = withAuthUser<MockComponentProps>({
      whenUnauthedBeforeInit: AuthAction.RENDER,
      whenUnauthedAfterInit: AuthAction.REDIRECT_TO_LOGIN,
      whenAuthed: AuthAction.RENDER,
    })(MockComponent)
    render(
      <MockCompWithUser
        AuthUserSerialized={MockSerializedAuthUser}
        message="How are you?"
      />
    )
    expect(propsSpy.ctx).toBeUndefined()
    expect(propsSpy.AuthUser.id).toBeNull()
    expect(window.location.replace).toHaveBeenCalledWith('/some-auth-page')
  })

  it('calls location.replace (with appPageURL as a function returning an object) when redirecting to the login outside the base path on client', () => {
    expect.assertions(1)
    const MockSerializedAuthUser = undefined // no server-side user
    mockUseFirebaseUser.mockReturnValue({
      ...getUseFirebaseUserResponse(),
      user: createMockFirebaseUserClientSDK(), // client-side user exists
      claims: undefined,
      initialized: true,
      authRequestCompleted: true,
    })
    const mockConfig = getMockConfig()
    setConfig({
      ...mockConfig,
      appPageURL: () => ({
        destination: '/my-app/here/', // custom app page
        permanent: false,
        basePath: false,
      }),
    })
    const MockCompWithUser = withAuthUser<MockComponentProps>({
      whenUnauthedBeforeInit: AuthAction.RENDER,
      whenUnauthedAfterInit: AuthAction.RENDER,
      whenAuthed: AuthAction.REDIRECT_TO_APP,
    })(MockComponent)
    render(
      <MockCompWithUser
        AuthUserSerialized={MockSerializedAuthUser}
        message="How are you?"
      />
    )
    expect(window.location.replace).toHaveBeenCalledWith('/my-app/here/')
  })

  it('calls location.replace (with appPageURL as an object) when redirecting to the login outside the base path on client', () => {
    expect.assertions(1)
    const MockSerializedAuthUser = undefined // no server-side user
    mockUseFirebaseUser.mockReturnValue({
      ...getUseFirebaseUserResponse(),
      user: createMockFirebaseUserClientSDK(), // client-side user exists
      claims: undefined,
      initialized: true,
      authRequestCompleted: true,
    })
    const mockConfig = getMockConfig()
    setConfig({
      ...mockConfig,
      appPageURL: {
        destination: '/my-app/here/', // custom app page
        permanent: false,
        basePath: false,
      },
    })
    const MockCompWithUser = withAuthUser<MockComponentProps>({
      whenUnauthedBeforeInit: AuthAction.RENDER,
      whenUnauthedAfterInit: AuthAction.RENDER,
      whenAuthed: AuthAction.REDIRECT_TO_APP,
    })(MockComponent)
    render(
      <MockCompWithUser
        AuthUserSerialized={MockSerializedAuthUser}
        message="How are you?"
      />
    )
    expect(window.location.replace).toHaveBeenCalledWith('/my-app/here/')
  })

  it('calls router.replace (with appPageURL as an object) when redirecting to the login *within* the base path on client', () => {
    expect.assertions(1)
    const MockSerializedAuthUser = undefined // no server-side user
    mockUseFirebaseUser.mockReturnValue({
      ...getUseFirebaseUserResponse(),
      user: createMockFirebaseUserClientSDK(), // client-side user exists
      claims: undefined,
      initialized: true,
      authRequestCompleted: true,
    })
    const mockConfig = getMockConfig()
    setConfig({
      ...mockConfig,
      appPageURL: {
        destination: '/my-app/here/', // custom app page
        permanent: false,
        // basePath is not false
      },
    })
    const MockCompWithUser = withAuthUser<MockComponentProps>({
      whenUnauthedBeforeInit: AuthAction.RENDER,
      whenUnauthedAfterInit: AuthAction.RENDER,
      whenAuthed: AuthAction.REDIRECT_TO_APP,
    })(MockComponent)
    render(
      <MockCompWithUser
        AuthUserSerialized={MockSerializedAuthUser}
        message="How are you?"
      />
    )
    expect(mockRouterReplace).toHaveBeenCalledWith('/my-app/here/')
  })
})

describe('withAuthUser: AuthUser context', () => {
  it('sets the AuthUser context to an empty AuthUser when there is no server-side or client-side user', () => {
    expect.assertions(1)
    const MockSerializedAuthUser = undefined // no server-side user
    mockUseFirebaseUser.mockReturnValue({
      ...getUseFirebaseUserResponse(),
      user: null, // no client-side user exists
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

    const MockCompWithUser = withAuthUser<MockComponentProps>({
      whenUnauthedBeforeInit: AuthAction.RENDER,
      whenUnauthedAfterInit: AuthAction.RENDER,
      whenAuthed: AuthAction.RENDER,
    })(AnotherMockComponent)
    render(<MockCompWithUser AuthUserSerialized={MockSerializedAuthUser} />)
    expect(wrappedCompAuthUser).toEqual(expectedAuthUser)
  })

  it('sets the AuthUser context using the server-side user (when there is no client-side user)', () => {
    expect.assertions(1)
    const MockSerializedAuthUser = createMockSerializedAuthUser()
    const expectedAuthUser = {
      ...createAuthUser({
        serializedAuthUser: MockSerializedAuthUser,
      }),
      getIdToken: expect.any(Function),
      serialize: expect.any(Function),
      signOut: expect.any(Function),
    }
    mockUseFirebaseUser.mockReturnValue({
      ...getUseFirebaseUserResponse(),
      user: null, // no client-side user exists
      initialized: false,
    })

    let wrappedCompAuthUser
    const AnotherMockComponent = () => {
      // eslint-disable-next-line no-unused-vars
      wrappedCompAuthUser = useAuthUser()
      return <div>hi!</div>
    }

    const MockCompWithUser = withAuthUser<MockComponentProps>({
      whenUnauthedBeforeInit: AuthAction.RENDER,
      whenUnauthedAfterInit: AuthAction.RENDER,
      whenAuthed: AuthAction.RENDER,
    })(AnotherMockComponent)
    render(<MockCompWithUser AuthUserSerialized={MockSerializedAuthUser} />)
    expect(wrappedCompAuthUser).toEqual(expectedAuthUser)
  })

  it('sets the AuthUser context using the client-side user (when there is no server-side user)', () => {
    expect.assertions(1)
    const MockSerializedAuthUser = undefined // no server-side user

    const mockFirebaseUser = createMockFirebaseUserClientSDK()
    mockUseFirebaseUser.mockReturnValue({
      ...getUseFirebaseUserResponse(),
      user: mockFirebaseUser, // client-side user exists
      initialized: true,
      authRequestCompleted: true,
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

    const MockCompWithUser = withAuthUser<MockComponentProps>({
      whenUnauthedBeforeInit: AuthAction.RENDER,
      whenUnauthedAfterInit: AuthAction.RENDER,
      whenAuthed: AuthAction.RENDER,
    })(AnotherMockComponent)
    render(<MockCompWithUser AuthUserSerialized={MockSerializedAuthUser} />)
    expect(wrappedCompAuthUser).toEqual(expectedAuthUser)
  })

  it('sets the AuthUser context using the client-side user when both client-side and server-side user info exists', () => {
    expect.assertions(1)
    const MockSerializedAuthUser = createMockSerializedAuthUser() // server-side user exists
    const mockFirebaseUser = createMockFirebaseUserClientSDK()
    mockUseFirebaseUser.mockReturnValue({
      ...getUseFirebaseUserResponse(),
      user: mockFirebaseUser, // client-side user exists
      initialized: true,
      authRequestCompleted: true,
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

    const MockCompWithUser = withAuthUser<MockComponentProps>({
      whenUnauthedBeforeInit: AuthAction.RENDER,
      whenUnauthedAfterInit: AuthAction.RENDER,
      whenAuthed: AuthAction.RENDER,
    })(AnotherMockComponent)
    render(<MockCompWithUser AuthUserSerialized={MockSerializedAuthUser} />)
    expect(wrappedCompAuthUser).toEqual(expectedAuthUser)
  })

  it('sets the AuthUser context using the server-side user when both client-side and server-side user info exists but the Firebase JS SDK has not initialized', () => {
    expect.assertions(1)
    const MockSerializedAuthUser = createMockSerializedAuthUser() // server-side user exists
    mockUseFirebaseUser.mockReturnValue({
      ...getUseFirebaseUserResponse(),
      user: null,
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

    const MockCompWithUser = withAuthUser<MockComponentProps>({
      whenUnauthedBeforeInit: AuthAction.RENDER,
      whenUnauthedAfterInit: AuthAction.RENDER,
      whenAuthed: AuthAction.RENDER,
    })(AnotherMockComponent)
    render(<MockCompWithUser AuthUserSerialized={MockSerializedAuthUser} />)
    expect(wrappedCompAuthUser).toEqual(expectedAuthUser)
  })

  it('sets the AuthUser context to an empty AuthUser when the server-side user exists, but the Firebase JS SDK *has* initialized and has no user', () => {
    expect.assertions(1)
    const MockSerializedAuthUser = createMockSerializedAuthUser() // server-side user exists
    mockUseFirebaseUser.mockReturnValue({
      ...getUseFirebaseUserResponse(),
      user: null,
      initialized: true,
      authRequestCompleted: true,
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

    const MockCompWithUser = withAuthUser<MockComponentProps>({
      whenUnauthedBeforeInit: AuthAction.RENDER,
      whenUnauthedAfterInit: AuthAction.RENDER,
      whenAuthed: AuthAction.RENDER,
    })(AnotherMockComponent)
    render(<MockCompWithUser AuthUserSerialized={MockSerializedAuthUser} />)
    expect(wrappedCompAuthUser).toEqual(expectedAuthUser)
  })

  it('includes custom claims in the AuthUser context when using the server-side user', () => {
    expect.assertions(1)
    const MockSerializedAuthUser = createMockSerializedAuthUser({
      claims: { my: 'custom claims!' },
    })
    const expectedAuthUser = {
      ...createAuthUser({
        serializedAuthUser: MockSerializedAuthUser,
      }),
      getIdToken: expect.any(Function),
      serialize: expect.any(Function),
      signOut: expect.any(Function),
      claims: {
        my: 'custom claims!',
      },
    }
    mockUseFirebaseUser.mockReturnValue({
      ...getUseFirebaseUserResponse(),
      user: null, // no client-side user exists
      initialized: false,
    })

    let wrappedCompAuthUser
    const AnotherMockComponent = () => {
      // eslint-disable-next-line no-unused-vars
      wrappedCompAuthUser = useAuthUser()
      return <div>hi!</div>
    }

    const MockCompWithUser = withAuthUser<MockComponentProps>({
      whenUnauthedBeforeInit: AuthAction.RENDER,
      whenUnauthedAfterInit: AuthAction.RENDER,
      whenAuthed: AuthAction.RENDER,
    })(AnotherMockComponent)
    render(<MockCompWithUser AuthUserSerialized={MockSerializedAuthUser} />)
    expect(wrappedCompAuthUser).toEqual(expectedAuthUser)
  })

  it('includes custom claims in the AuthUser context when using the client-side user', () => {
    expect.assertions(1)
    const MockSerializedAuthUser = undefined // no server-side user

    const mockFirebaseUser = createMockFirebaseUserClientSDK()
    mockUseFirebaseUser.mockReturnValue({
      ...getUseFirebaseUserResponse(),
      user: mockFirebaseUser, // client-side user exists
      claims: {
        custom: 'data',
        very: 'cool',
      },
      initialized: true,
      authRequestCompleted: true,
    })
    const expectedAuthUser = {
      ...createAuthUser({
        firebaseUserClientSDK: mockFirebaseUser,
      }),
      clientInitialized: true,
      getIdToken: expect.any(Function),
      serialize: expect.any(Function),
      signOut: expect.any(Function),
      claims: {
        custom: 'data',
        very: 'cool',
      },
    }

    let wrappedCompAuthUser
    const AnotherMockComponent = () => {
      // eslint-disable-next-line no-unused-vars
      wrappedCompAuthUser = useAuthUser()
      return <div>hi!</div>
    }

    const MockCompWithUser = withAuthUser<MockComponentProps>({
      whenUnauthedBeforeInit: AuthAction.RENDER,
      whenUnauthedAfterInit: AuthAction.RENDER,
      whenAuthed: AuthAction.RENDER,
    })(AnotherMockComponent)
    render(<MockCompWithUser AuthUserSerialized={MockSerializedAuthUser} />)
    expect(wrappedCompAuthUser).toEqual(expectedAuthUser)
  })

  it('logs a debugging message when it renders the AuthUser', () => {
    expect.assertions(1)
    const MockSerializedAuthUser = createMockSerializedAuthUser()
    const mockFirebaseUser = createMockFirebaseUserClientSDK()
    mockUseFirebaseUser.mockReturnValue({
      ...getUseFirebaseUserResponse(),
      user: mockFirebaseUser,
      initialized: true,
      authRequestCompleted: true,
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

    const AnotherMockComponent = () => <div>hi!</div>
    const MockCompWithUser = withAuthUser<MockComponentProps>({
      whenUnauthedBeforeInit: AuthAction.RENDER,
      whenUnauthedAfterInit: AuthAction.RENDER,
      whenAuthed: AuthAction.RENDER,
    })(AnotherMockComponent)
    render(<MockCompWithUser AuthUserSerialized={MockSerializedAuthUser} />)
    expect(logDebug).toHaveBeenCalledWith(
      '[withAuthUser] Set AuthUser to:',
      expectedAuthUser
    )
  })

  it('provides the same AuthUser object reference after "authRequestCompleted" changes (that is, it does not cause a re-render)', () => {
    expect.assertions(1)
    const MockSerializedAuthUser = createMockSerializedAuthUser() // server-side user exists
    const mockFirebaseUser = createMockFirebaseUserClientSDK()
    const initialFirebaseUserResponse = {
      ...getUseFirebaseUserResponse(),
      user: mockFirebaseUser,
      initialized: true,
      authRequestCompleted: false,
    }
    mockUseFirebaseUser.mockReturnValue(initialFirebaseUserResponse)

    const authUsers: AuthUserType[] = []
    const AnotherMockComponent = () => {
      const authUser = useAuthUser()
      authUsers.push(authUser)
      return <div>hi!</div>
    }
    const MockCompWithUser = withAuthUser<MockComponentProps>({
      whenUnauthedBeforeInit: AuthAction.RENDER,
      whenUnauthedAfterInit: AuthAction.RENDER,
      whenAuthed: AuthAction.RENDER,
    })(AnotherMockComponent)
    const { rerender } = render(
      <MockCompWithUser AuthUserSerialized={MockSerializedAuthUser} />
    )
    mockUseFirebaseUser.mockReturnValue({
      ...initialFirebaseUserResponse,
      authRequestCompleted: true,
    })
    rerender(<MockCompWithUser AuthUserSerialized={MockSerializedAuthUser} />)
    expect(authUsers[0]).toEqual(authUsers[authUsers.length - 1])
  })
})
