/**
 * @jest-environment node
 */

// Allow importing firebase-admin as wildcard.
/* eslint-disable no-import-assign */

import * as admin from 'firebase-admin'
import createMockConfig from '../testHelpers/createMockConfig'
import { setConfig } from '../config'

jest.mock('firebase-admin')
jest.mock('src/config')

beforeEach(() => {
  const mockConfig = createMockConfig({ clientSide: false })
  setConfig(mockConfig)

  admin.credential.cert.mockImplementation((obj) => ({
    ...obj,
    _mockFirebaseCert: true,
  }))
  admin.apps = []
})

afterEach(() => {
  jest.clearAllMocks()
})

describe('index.server.js: getFirebaseAdmin', () => {
  it('exports getFirebaseAdmin', () => {
    expect.assertions(2)
    const indexServer = require('src/index.server').default
    expect(indexServer.getFirebaseAdmin).toBeDefined()
    expect(indexServer.init).toEqual(expect.any(Function))
  })

  it('getFirebaseAdmin returns admin', () => {
    expect.assertions(1)
    const indexServer = require('src/index.server').default
    const response = indexServer.getFirebaseAdmin()
    expect(response).toEqual(admin)
  })
})
