import React from 'react'
import { render } from '@testing-library/react'
import { setConfig } from 'src/config'
import getMockConfig from 'src/testHelpers/createMockConfig'
import {
  createMockSerializedAuthUser,
  createMockFirebaseUserClientSDK,
} from 'src/testHelpers/authUserInputs'
// import useAuthUser from 'src/useAuthUser'
import useFirebaseUser from 'src/useFirebaseUser'

// We don't mock createAuthUser or useAuthUser.
jest.mock('next/router')
jest.mock('src/useFirebaseUser')
jest.mock('src/isClientSide')

const MockComponent = ({ message }) => <div>Hello! {message}</div>

beforeEach(() => {
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
})
