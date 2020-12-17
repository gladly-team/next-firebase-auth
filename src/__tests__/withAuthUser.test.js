import React from 'react'
import { render } from '@testing-library/react'
import { setConfig } from 'src/config'
import getMockConfig from 'src/testHelpers/createMockConfig'
// import { createMockSerializedAuthUser } from 'src/testHelpers/authUserInputs'
// import useAuthUser from 'src/useAuthUser'

// We don't mock createAuthUser.
jest.mock('next/router')
jest.mock('src/useAuthUser')
jest.mock('src/useFirebaseUser')
jest.mock('src/isClientSide')

const MockComponent = ({ message }) => (
  <div data-testid="mock-comp">Hello! {message}</div>
)
beforeEach(() => {
  const mockConfig = getMockConfig()
  setConfig({
    ...mockConfig,
    firebaseAdminInitConfig: undefined,
    cookies: undefined,
    // TODO: set the default loading strategies
  })
})

afterEach(() => {
  jest.clearAllMocks()
})

describe('withAuthUser', () => {
  it('renders the child component when there is no server-side or client-side user and rendering is allowed', async () => {
    expect.assertions(1)
    const withAuthUser = require('src/withAuthUser').default
    const MockCompWithUser = withAuthUser({
      authRequired: false,
      redirectIfAuthed: false,
    })(MockComponent)
    const { queryByText } = render(<MockCompWithUser message="How are you?" />)
    expect(queryByText('Hello! How are you?')).toBeTruthy()
  })

  it('does not render the child component when there is no server-side or client-side user and rendering is *not* allowed', async () => {
    expect.assertions(1)
    const withAuthUser = require('src/withAuthUser').default
    const MockCompWithUser = withAuthUser({
      authRequired: true,
      redirectIfAuthed: false,
    })(MockComponent)
    const { queryByText } = render(<MockCompWithUser message="How are you?" />)
    expect(queryByText('Hello! How are you?')).toBeNull()
  })
})
