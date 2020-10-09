import {
  getMockFirebaseUserClientSDK,
  getMockFirebaseUserAdminSDK,
  getMockSerializedAuthUser,
} from 'src/test-utils'

describe('createAuthUser: basic tests', () => {
  it('returns the expected data for an unauthenticated user', () => {
    expect.assertions(1)
    const createAuthUser = require('src/createAuthUser').default
    expect(createAuthUser()).toEqual({
      clientInitialized: false,
      email: null,
      emailVerified: false,
      getIdToken: expect.any(Function),
      id: null,
      serialize: expect.any(Function),
    })
  })

  it('throws if all user inputs are defined', () => {
    expect.assertions(1)
    const createAuthUser = require('src/createAuthUser').default
    expect(() => {
      createAuthUser({
        firebaseUserClientSDK: getMockFirebaseUserClientSDK(),
        firebaseUserAdminSDK: getMockFirebaseUserAdminSDK(),
        serializedAuthUser: getMockSerializedAuthUser(),
      })
    }).toThrow(
      'createAuthUser cannot receive more than one of the following properties: "firebaseUserClientSDK", "firebaseUserAdminSDK", "serializedAuthUser"'
    )
  })

  it('throws if more than one user input is defined', () => {
    expect.assertions(1)
    const createAuthUser = require('src/createAuthUser').default
    expect(() => {
      createAuthUser({
        firebaseUserClientSDK: getMockFirebaseUserClientSDK(),
        firebaseUserAdminSDK: getMockFirebaseUserAdminSDK(),
        serializedAuthUser: undefined,
      })
    }).toThrow(
      'createAuthUser cannot receive more than one of the following properties: "firebaseUserClientSDK", "firebaseUserAdminSDK", "serializedAuthUser"'
    )
  })

  it('throws if "clientInitialized" is true but "firebaseUserClientSDK is not defined (only the client should set clientInitialized)', () => {
    expect.assertions(1)
    const createAuthUser = require('src/createAuthUser').default
    expect(() => {
      createAuthUser({
        firebaseUserAdminSDK: getMockFirebaseUserAdminSDK(),
        clientInitialized: true,
      })
    }).toThrow(
      'The "clientInitialized" value can only be true if the "firebaseUserClientSDK" property is defined.'
    )
  })

  it('throws if "token" is defined but "firebaseUserAdminSDK" is not defined (only the server should manually set the token this way)', () => {
    expect.assertions(1)
    const createAuthUser = require('src/createAuthUser').default
    expect(() => {
      createAuthUser({
        firebaseUserClientSDK: getMockFirebaseUserClientSDK(),
        token: 'some-token-val',
      })
    }).toThrow(
      'The "token" value can only be set if the "firebaseUserAdminSDK" property is defined.'
    )
  })
})

describe('createAuthUser: firebaseUserClientSDK', () => {
  it('returns the expected data', () => {
    expect.assertions(1)
    const createAuthUser = require('src/createAuthUser').default
    expect(
      createAuthUser({ firebaseUserClientSDK: getMockFirebaseUserClientSDK() })
    ).toEqual({
      id: 'abc-123',
      email: 'abc@example.com',
      emailVerified: true,
      clientInitialized: false,
      getIdToken: expect.any(Function),
      serialize: expect.any(Function),
    })
  })

  it('returns the expected value from getIdToken', async () => {
    expect.assertions(1)
    const createAuthUser = require('src/createAuthUser').default
    const AuthUser = createAuthUser({
      firebaseUserClientSDK: getMockFirebaseUserClientSDK(),
    })
    const token = await AuthUser.getIdToken()
    expect(token).toEqual('my-id-token-abc-123')
  })

  it('returns the expected value from serialize', async () => {
    expect.assertions(1)
    const createAuthUser = require('src/createAuthUser').default
    const AuthUser = createAuthUser({
      firebaseUserClientSDK: getMockFirebaseUserClientSDK(),
    })
    const AuthUserSerialized = AuthUser.serialize()
    expect(AuthUserSerialized).toEqual(
      JSON.stringify({
        id: 'abc-123',
        email: 'abc@example.com',
        emailVerified: true,
        clientInitialized: false,
        _token: null,
      })
    )
  })
})

describe('createAuthUser: firebaseUserAdminSDK', () => {
  it('returns the expected data', () => {
    expect.assertions(1)
    const createAuthUser = require('src/createAuthUser').default
    expect(
      createAuthUser({ firebaseUserAdminSDK: getMockFirebaseUserAdminSDK() })
    ).toEqual({
      id: 'def-456',
      email: 'def@example.com',
      emailVerified: true,
      clientInitialized: false,
      getIdToken: expect.any(Function),
      serialize: expect.any(Function),
    })
  })

  it('returns the expected value from getIdToken when a token is not provided', async () => {
    expect.assertions(1)
    const createAuthUser = require('src/createAuthUser').default
    const AuthUser = createAuthUser({
      firebaseUserAdminSDK: getMockFirebaseUserAdminSDK(),
      // token: undefined, // no token
    })
    const token = await AuthUser.getIdToken()
    expect(token).toEqual(null)
  })

  it('returns the expected value from getIdToken when a token is provided', async () => {
    expect.assertions(1)
    const createAuthUser = require('src/createAuthUser').default
    const AuthUser = createAuthUser({
      firebaseUserAdminSDK: getMockFirebaseUserAdminSDK(),
      token: 'my-id-token-def-456',
    })
    const token = await AuthUser.getIdToken()
    expect(token).toEqual('my-id-token-def-456')
  })

  it('returns the expected value from serialize when a token is not provided', async () => {
    expect.assertions(1)
    const createAuthUser = require('src/createAuthUser').default
    const AuthUser = createAuthUser({
      firebaseUserAdminSDK: getMockFirebaseUserAdminSDK(),
      // token: undefined, // no token
    })
    const AuthUserSerialized = AuthUser.serialize()
    expect(AuthUserSerialized).toEqual(
      JSON.stringify({
        id: 'def-456',
        email: 'def@example.com',
        emailVerified: true,
        clientInitialized: false,
        _token: null,
      })
    )
  })

  it('returns the expected value from serialize when a token is provided', async () => {
    expect.assertions(1)
    const createAuthUser = require('src/createAuthUser').default
    const AuthUser = createAuthUser({
      firebaseUserAdminSDK: getMockFirebaseUserAdminSDK(),
      token: 'my-id-token-def-456',
    })
    const AuthUserSerialized = AuthUser.serialize()
    expect(AuthUserSerialized).toEqual(
      JSON.stringify({
        id: 'def-456',
        email: 'def@example.com',
        emailVerified: true,
        clientInitialized: false,
        _token: 'my-id-token-def-456',
      })
    )
  })
})

describe('createAuthUser: serializedAuthUser', () => {
  it('returns the expected data', () => {
    expect.assertions(1)
    const createAuthUser = require('src/createAuthUser').default
    expect(
      createAuthUser({ serializedAuthUser: getMockSerializedAuthUser() })
    ).toEqual({
      id: 'ghi-789',
      email: 'ghi@example.com',
      emailVerified: true,
      clientInitialized: false,
      getIdToken: expect.any(Function),
      serialize: expect.any(Function),
    })
  })

  it('returns the original values from serialize and back', async () => {
    expect.assertions(2)
    const createAuthUser = require('src/createAuthUser').default
    const mockSerializedAuthUser = getMockSerializedAuthUser()
    const AuthUser = createAuthUser({
      serializedAuthUser: mockSerializedAuthUser,
    })
    const AuthUserSerialized = AuthUser.serialize()
    expect(AuthUserSerialized).toEqual(mockSerializedAuthUser)
    expect(createAuthUser({ serializedAuthUser: AuthUserSerialized })).toEqual({
      ...AuthUser,
      getIdToken: expect.any(Function),
      serialize: expect.any(Function),
    })
  })
})
