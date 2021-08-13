import { jest, expect, describe, beforeEach, it } from '@jest/globals'
import { setConfig } from 'src/config'
import getFirebaseAdminApp from 'src/initFirebaseAdminSDK'

import createMockConfig from 'src/testHelpers/createMockConfig'
import { createMockFirebaseUserAdminSDK } from 'src/testHelpers/authUserInputs'
import createAuthUser from 'src/createAuthUser'
import withAuthUserTokenAPI from '../withAuthUserTokenAPI'

const token = 'some-token'

const mockFirebaseUser = createMockFirebaseUserAdminSDK()
const mockUser = createAuthUser({
  firebaseUserAdminSDK: mockFirebaseUser,
  token,
})

const headers = {
  authorization: 'Bearer testtoken',
}

const mockSend = jest.fn()
const mockResponse = {
  send: mockSend,
  status: () => ({
    send: mockSend,
  }),
}

let env = null

describe('Invalid (no ID) user returned', () => {
  beforeEach(() => {
    const mockConfig = createMockConfig()
    setConfig({
      ...mockConfig,
      firebaseClientInitConfig: {
        ...mockConfig.firebaseClientInitConfig,
        apiKey: 'some-key',
      },
    })

    const mockVerifyIdToken = jest.fn().mockResolvedValue(null)
    // const { verifyIdToken } = require('src/firebaseAdmin')

    // eslint-disable-next-line no-unused-vars
    const { verifyIdToken } = require('src/firebaseAdmin')
    const admin = getFirebaseAdminApp()
    admin.auth().verifyIdToken.mockResolvedValue({})

    jest.mock('src/firebaseAdmin', () => ({
      verifyIdToken: mockVerifyIdToken,
    }))
    env = { ...process.env }
  })

  afterEach(() => {
    process.env = env
    env = null
  })

  it('Should require a User ID to complete Authorization', async () => {
    const mock = jest.fn().mockImplementation((req, res) => {
      res.send('Success')
    })

    await withAuthUserTokenAPI(mock)({ headers }, mockResponse)

    expect(mockSend).toHaveBeenCalledWith({ code: 2, message: 'Unauthorized' })
  })
})

describe('Invalid token testing (null user returned)', () => {
  beforeEach(() => {
    const mockConfig = createMockConfig()
    setConfig({
      ...mockConfig,
      firebaseClientInitConfig: {
        ...mockConfig.firebaseClientInitConfig,
        apiKey: 'some-key',
      },
    })

    const mockVerifyIdToken = jest.fn().mockResolvedValue(null)
    // const { verifyIdToken } = require('src/firebaseAdmin')

    // eslint-disable-next-line no-unused-vars
    const { verifyIdToken } = require('src/firebaseAdmin')
    const admin = getFirebaseAdminApp()
    admin.auth().verifyIdToken.mockResolvedValue(null)

    jest.mock('src/firebaseAdmin', () => ({
      verifyIdToken: mockVerifyIdToken,
    }))
    env = { ...process.env }
  })

  afterEach(() => {
    process.env = env
    env = null
  })

  it('Require a user to provide a HTTP Authorization Header', async () => {
    const mock = jest.fn().mockImplementation((req, res) => {
      res.send('Success')
    })

    await withAuthUserTokenAPI(mock)({ headers: {} }, mockResponse)

    expect(mockSend).toHaveBeenCalledWith({ code: 1, message: 'Unauthorized' })
  })

  it('Require a user to provide a HTTP Authorization Bearer Header', async () => {
    const mock = jest.fn().mockImplementation((req, res) => {
      res.send('Success')
    })

    await withAuthUserTokenAPI(mock)(
      { headers: { authorization: 'basic fail' } },
      mockResponse
    )

    expect(mockSend).toHaveBeenCalledWith({ code: 1, message: 'Unauthorized' })
  })

  it('When an invalid token is used, reject', async () => {
    const mock = jest.fn().mockImplementation((req, res) => {
      res.send('Success')
    })

    await withAuthUserTokenAPI(mock)({ headers }, mockResponse)

    expect(mockSend).toHaveBeenCalledWith({ code: 3, message: 'Unauthorized' })
  })
})

describe('Valid token testing', () => {
  beforeEach(() => {
    const mockConfig = createMockConfig()
    setConfig({
      ...mockConfig,
      firebaseClientInitConfig: {
        ...mockConfig.firebaseClientInitConfig,
        apiKey: 'some-key',
      },
    })
    const mockVerifyIdToken = jest.fn().mockResolvedValue(mockUser)
    // const { verifyIdToken } = require('src/firebaseAdmin')

    // eslint-disable-next-line no-unused-vars
    const { verifyIdToken } = require('src/firebaseAdmin')
    const admin = getFirebaseAdminApp()
    admin.auth().verifyIdToken.mockResolvedValue(mockFirebaseUser)

    jest.mock('src/firebaseAdmin', () => ({
      verifyIdToken: mockVerifyIdToken,
    }))
    env = { ...process.env }
  })

  afterEach(() => {
    process.env = env
    env = null
  })

  it('should verify a token', async () => {
    const mock = jest.fn().mockImplementation((req, res) => {
      res.send('Success')
    })

    await withAuthUserTokenAPI(mock)({ headers }, mockResponse)

    expect(mockSend).toHaveBeenCalledWith('Success')
  })

  it('Should reject as the User ID is null', async () => {
    const mockVerifyIdToken = jest
      .fn()
      .mockResolvedValue({ ...mockUser, id: null })
    jest.mock('src/firebaseAdmin', () => ({
      verifyIdToken: mockVerifyIdToken,
    }))

    const mock = jest.fn().mockImplementation((req, res) => {
      res.send('Success')
    })

    await withAuthUserTokenAPI(mock)({ headers }, mockResponse)

    expect(mockSend).toHaveBeenCalledWith('Success')
  })
})
