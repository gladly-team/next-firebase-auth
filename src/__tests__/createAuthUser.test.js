import firebase from 'firebase/app'
import {
  createMockFirebaseUserClientSDK,
  createMockFirebaseUserAdminSDK,
  createMockSerializedAuthUser,
} from 'src/testHelpers/authUserInputs'

jest.mock('firebase/auth')
jest.mock('firebase/app')

afterEach(() => {
  jest.clearAllMocks()
})

describe('createAuthUser: basic tests', () => {
  it('returns the expected data for an unauthenticated user', () => {
    expect.assertions(1)
    const createAuthUser = require('src/createAuthUser').default
    expect(createAuthUser()).toEqual({
      claims: {},
      clientInitialized: false,
      email: null,
      emailVerified: false,
      phoneNumber: null,
      displayName: null,
      photoURL: null,
      getIdToken: expect.any(Function),
      id: null,
      firebaseUser: null,
      signOut: expect.any(Function),
      serialize: expect.any(Function),
    })
  })

  it('throws if all user inputs are defined', () => {
    expect.assertions(1)
    const createAuthUser = require('src/createAuthUser').default
    expect(() => {
      createAuthUser({
        firebaseUserClientSDK: createMockFirebaseUserClientSDK(),
        firebaseUserAdminSDK: createMockFirebaseUserAdminSDK(),
        serializedAuthUser: createMockSerializedAuthUser(),
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
        firebaseUserClientSDK: createMockFirebaseUserClientSDK(),
        firebaseUserAdminSDK: createMockFirebaseUserAdminSDK(),
        serializedAuthUser: undefined,
      })
    }).toThrow(
      'createAuthUser cannot receive more than one of the following properties: "firebaseUserClientSDK", "firebaseUserAdminSDK", "serializedAuthUser"'
    )
  })

  it('throws if "clientInitialized" is true but "firebaseUserAdminSDK" is set (only the client should set clientInitialized)', () => {
    expect.assertions(1)
    const createAuthUser = require('src/createAuthUser').default
    expect(() => {
      createAuthUser({
        firebaseUserAdminSDK: createMockFirebaseUserAdminSDK(),
        clientInitialized: true,
      })
    }).toThrow(
      'The "clientInitialized" value can only be true when called with the "firebaseUserClientSDK" property or no user.'
    )
  })

  it('throws if "clientInitialized" is true but "serializedAuthUser" is set (only the client should set clientInitialized)', () => {
    expect.assertions(1)
    const createAuthUser = require('src/createAuthUser').default
    expect(() => {
      createAuthUser({
        serializedAuthUser: createMockSerializedAuthUser(),
        clientInitialized: true,
      })
    }).toThrow(
      'The "clientInitialized" value can only be true when called with the "firebaseUserClientSDK" property or no user.'
    )
  })

  it('does not throw if "clientInitialized" is true and no user property is defined (here, the user is logged out on the client side)', () => {
    expect.assertions(1)
    const createAuthUser = require('src/createAuthUser').default
    expect(() => {
      createAuthUser({
        firebaseUserClientSDK: undefined,
        firebaseUserAdminSDK: undefined,
        serializedAuthUser: undefined,
        clientInitialized: true,
      })
    }).not.toThrow()
  })

  it('throws if "token" is defined but "firebaseUserAdminSDK" is not defined (only the server should manually set the token this way)', () => {
    expect.assertions(1)
    const createAuthUser = require('src/createAuthUser').default
    expect(() => {
      createAuthUser({
        firebaseUserClientSDK: createMockFirebaseUserClientSDK(),
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
    const firebaseUserJSSDK = createMockFirebaseUserClientSDK()
    expect(
      createAuthUser({ firebaseUserClientSDK: firebaseUserJSSDK })
    ).toEqual({
      id: 'abc-123',
      email: 'abc@example.com',
      emailVerified: true,
      phoneNumber: '+1800-123-4567',
      displayName: 'Abc Cdf',
      photoURL: 'https://abc.googleusercontent.com/cdf/profile_photo.png',
      clientInitialized: false,
      getIdToken: expect.any(Function),
      firebaseUser: firebaseUserJSSDK,
      signOut: expect.any(Function),
      serialize: expect.any(Function),
      claims: {},
    })
  })

  it('returns the expected data when custom claims are included', () => {
    expect.assertions(1)
    const createAuthUser = require('src/createAuthUser').default
    const customClaims = {
      foo: 'bar',
      has: 'cheese',
      likes: 'cats',
      registered: true,
    }
    const firebaseUserJSSDK = createMockFirebaseUserClientSDK()
    expect(
      createAuthUser({
        firebaseUserClientSDK: firebaseUserJSSDK,
        claims: customClaims,
      })
    ).toEqual({
      id: 'abc-123',
      email: 'abc@example.com',
      emailVerified: true,
      phoneNumber: '+1800-123-4567',
      displayName: 'Abc Cdf',
      photoURL: 'https://abc.googleusercontent.com/cdf/profile_photo.png',
      clientInitialized: false,
      getIdToken: expect.any(Function),
      firebaseUser: firebaseUserJSSDK,
      signOut: expect.any(Function),
      serialize: expect.any(Function),
      claims: customClaims,
    })
  })

  it('does not throw when custom claims are defined but the client user is not defined', () => {
    expect.assertions(1)
    const createAuthUser = require('src/createAuthUser').default
    expect(() => {
      createAuthUser({
        firebaseUserClientSDK: undefined,
        claims: {
          foo: 'bar',
          has: 'cheese',
          likes: 'cats',
          registered: true,
        },
      })
    }).not.toThrow()
  })

  it('returns the expected value from getIdToken', async () => {
    expect.assertions(1)
    const createAuthUser = require('src/createAuthUser').default
    const AuthUser = createAuthUser({
      firebaseUserClientSDK: createMockFirebaseUserClientSDK(),
    })
    const token = await AuthUser.getIdToken()
    expect(token).toEqual('my-id-token-abc-123')
  })

  it('returns the expected value from serialize', async () => {
    expect.assertions(1)
    const createAuthUser = require('src/createAuthUser').default
    const AuthUser = createAuthUser({
      firebaseUserClientSDK: createMockFirebaseUserClientSDK(),
    })
    const AuthUserSerialized = AuthUser.serialize()
    expect(AuthUserSerialized).toEqual(
      JSON.stringify({
        id: 'abc-123',
        claims: {},
        email: 'abc@example.com',
        emailVerified: true,
        phoneNumber: '+1800-123-4567',
        displayName: 'Abc Cdf',
        photoURL: 'https://abc.googleusercontent.com/cdf/profile_photo.png',
        clientInitialized: false,
        _token: null,
      })
    )
  })

  it("calls Firebase's signOut method when we call AuthUser.signOut", async () => {
    expect.assertions(1)
    const createAuthUser = require('src/createAuthUser').default
    const AuthUser = createAuthUser({
      firebaseUserClientSDK: createMockFirebaseUserClientSDK(),
    })
    await AuthUser.signOut()
    expect(firebase.auth().signOut).toHaveBeenCalled()
  })

  it("does not call Firebase's signOut method when we call AuthUser.signOut and the user is unauthed", async () => {
    expect.assertions(1)
    const createAuthUser = require('src/createAuthUser').default
    const AuthUser = createAuthUser({
      firebaseUserClientSDK: null,
    })
    await AuthUser.signOut()
    expect(firebase.auth().signOut).not.toHaveBeenCalled()
  })
})

describe('createAuthUser: firebaseUserAdminSDK', () => {
  it('returns the expected data', () => {
    expect.assertions(1)
    const createAuthUser = require('src/createAuthUser').default
    expect(
      createAuthUser({ firebaseUserAdminSDK: createMockFirebaseUserAdminSDK() })
    ).toEqual({
      id: 'def-456',
      email: 'def@example.com',
      emailVerified: true,
      phoneNumber: '+1800-234-5678',
      displayName: 'Def Ghi',
      photoURL: 'https://def.googleusercontent.com/ghi/profile_photo.png',
      clientInitialized: false,
      getIdToken: expect.any(Function),
      firebaseUser: null,
      signOut: expect.any(Function),
      serialize: expect.any(Function),
      claims: {},
    })
  })

  it('includes includes all custom claims that are not standard claims', () => {
    expect.assertions(1)
    const createAuthUser = require('src/createAuthUser').default
    const firebaseUserAdminSDK = {
      ...createMockFirebaseUserAdminSDK(),
      foo: 'bar',
      haz: 'cheese',
    }
    expect(createAuthUser({ firebaseUserAdminSDK })).toEqual({
      id: 'def-456',
      email: 'def@example.com',
      emailVerified: true,
      phoneNumber: '+1800-234-5678',
      displayName: 'Def Ghi',
      photoURL: 'https://def.googleusercontent.com/ghi/profile_photo.png',
      clientInitialized: false,
      getIdToken: expect.any(Function),
      firebaseUser: null,
      signOut: expect.any(Function),
      serialize: expect.any(Function),
      claims: {
        foo: 'bar',
        haz: 'cheese',
      },
    })
  })

  it('throws if claims are provided as an input', () => {
    expect.assertions(1)
    const createAuthUser = require('src/createAuthUser').default
    const firebaseUserAdminSDK = createMockFirebaseUserAdminSDK()
    expect(() => {
      createAuthUser({ firebaseUserAdminSDK, claims: { some: 'stuff' } })
    }).toThrow(
      'The "claims" value can only be set in conjunction with the "firebaseUserClientSDK" property.'
    )
  })

  it('returns the expected value from getIdToken when a token is not provided', async () => {
    expect.assertions(1)
    const createAuthUser = require('src/createAuthUser').default
    const AuthUser = createAuthUser({
      firebaseUserAdminSDK: createMockFirebaseUserAdminSDK(),
      // token: undefined, // no token
    })
    const token = await AuthUser.getIdToken()
    expect(token).toBeNull()
  })

  it('returns the expected value from getIdToken when a token is provided', async () => {
    expect.assertions(1)
    const createAuthUser = require('src/createAuthUser').default
    const AuthUser = createAuthUser({
      firebaseUserAdminSDK: createMockFirebaseUserAdminSDK(),
      token: 'my-id-token-def-456',
    })
    const token = await AuthUser.getIdToken()
    expect(token).toEqual('my-id-token-def-456')
  })

  it('returns the expected value from serialize when a token is not provided', async () => {
    expect.assertions(1)
    const createAuthUser = require('src/createAuthUser').default
    const AuthUser = createAuthUser({
      firebaseUserAdminSDK: createMockFirebaseUserAdminSDK(),
      // token: undefined, // no token
    })
    const AuthUserSerialized = AuthUser.serialize()
    expect(AuthUserSerialized).toEqual(
      JSON.stringify({
        id: 'def-456',
        claims: {},
        email: 'def@example.com',
        emailVerified: true,
        phoneNumber: '+1800-234-5678',
        displayName: 'Def Ghi',
        photoURL: 'https://def.googleusercontent.com/ghi/profile_photo.png',
        clientInitialized: false,
        _token: null,
      })
    )
  })

  it('returns the expected value from serialize when a token is provided', async () => {
    expect.assertions(1)
    const createAuthUser = require('src/createAuthUser').default
    const AuthUser = createAuthUser({
      firebaseUserAdminSDK: createMockFirebaseUserAdminSDK(),
      token: 'my-id-token-def-456',
    })
    const AuthUserSerialized = AuthUser.serialize()
    expect(AuthUserSerialized).toEqual(
      JSON.stringify({
        id: 'def-456',
        claims: {},
        email: 'def@example.com',
        emailVerified: true,
        phoneNumber: '+1800-234-5678',
        displayName: 'Def Ghi',
        photoURL: 'https://def.googleusercontent.com/ghi/profile_photo.png',
        clientInitialized: false,
        _token: 'my-id-token-def-456',
      })
    )
  })

  it('returns custom claims in the expected value from serialize if provided', async () => {
    expect.assertions(1)
    const createAuthUser = require('src/createAuthUser').default
    const customClaims = {
      foo: 'bar',
      has: 'cheese',
      likes: 'cats',
      registered: true,
    }
    const AuthUser = createAuthUser({
      firebaseUserAdminSDK: {
        ...createMockFirebaseUserAdminSDK(),
        ...customClaims,
      },
      token: 'my-id-token-def-456',
    })
    const AuthUserSerialized = AuthUser.serialize()
    expect(AuthUserSerialized).toEqual(
      JSON.stringify({
        id: 'def-456',
        claims: customClaims,
        email: 'def@example.com',
        emailVerified: true,
        phoneNumber: '+1800-234-5678',
        displayName: 'Def Ghi',
        photoURL: 'https://def.googleusercontent.com/ghi/profile_photo.png',
        clientInitialized: false,
        _token: 'my-id-token-def-456',
      })
    )
  })

  it('excludes the token when serializing and the "includeToken" option is false', async () => {
    expect.assertions(1)
    const createAuthUser = require('src/createAuthUser').default
    const AuthUser = createAuthUser({
      firebaseUserAdminSDK: createMockFirebaseUserAdminSDK(),
      token: 'my-id-token-def-456',
    })
    const AuthUserSerialized = AuthUser.serialize({ includeToken: false })
    expect(AuthUserSerialized).toEqual(
      JSON.stringify({
        id: 'def-456',
        claims: {},
        email: 'def@example.com',
        emailVerified: true,
        phoneNumber: '+1800-234-5678',
        displayName: 'Def Ghi',
        photoURL: 'https://def.googleusercontent.com/ghi/profile_photo.png',
        clientInitialized: false,
        _token: undefined,
      })
    )
  })

  it("does not call Firebase's signOut method when we call AuthUser.signOut (it should be a noop)", async () => {
    expect.assertions(1)
    const createAuthUser = require('src/createAuthUser').default
    const AuthUser = createAuthUser({
      firebaseUserAdminSDK: createMockFirebaseUserAdminSDK(),
      token: 'my-id-token-def-456',
    })
    await AuthUser.signOut()
    expect(firebase.auth().signOut).not.toHaveBeenCalled()
  })
})

describe('createAuthUser: serializedAuthUser', () => {
  it('returns the expected data', () => {
    expect.assertions(1)
    const createAuthUser = require('src/createAuthUser').default
    expect(
      createAuthUser({ serializedAuthUser: createMockSerializedAuthUser() })
    ).toEqual({
      id: 'ghi-789',
      email: 'ghi@example.com',
      emailVerified: true,
      phoneNumber: '+1800-345-6789',
      displayName: 'Ghi Jkl',
      photoURL: 'https://ghi.googleusercontent.com/jkl/profile_photo.png',
      clientInitialized: false,
      getIdToken: expect.any(Function),
      firebaseUser: null,
      signOut: expect.any(Function),
      serialize: expect.any(Function),
      claims: {},
    })
  })

  it('returns custom claims if they are provided', () => {
    expect.assertions(1)
    const customClaims = {
      foo: 'bar',
      has: 'cheese',
      likes: 'cats',
      registered: true,
    }
    const createAuthUser = require('src/createAuthUser').default
    const serializedAuthUser = createMockSerializedAuthUser({
      claims: customClaims,
    })
    expect(createAuthUser({ serializedAuthUser })).toEqual({
      id: 'ghi-789',
      email: 'ghi@example.com',
      emailVerified: true,
      phoneNumber: '+1800-345-6789',
      displayName: 'Ghi Jkl',
      photoURL: 'https://ghi.googleusercontent.com/jkl/profile_photo.png',
      clientInitialized: false,
      getIdToken: expect.any(Function),
      firebaseUser: null,
      signOut: expect.any(Function),
      serialize: expect.any(Function),
      claims: customClaims,
    })
  })

  it('throws if claims are provided as an input', () => {
    expect.assertions(1)
    const createAuthUser = require('src/createAuthUser').default
    expect(() => {
      createAuthUser({
        serializedAuthUser: createMockSerializedAuthUser(),
        claims: { some: 'stuff' },
      })
    }).toThrow(
      'The "claims" value can only be set in conjunction with the "firebaseUserClientSDK" property.'
    )
  })

  it('returns the original values from serialize and back', async () => {
    expect.assertions(2)
    const createAuthUser = require('src/createAuthUser').default
    const mockSerializedAuthUser = createMockSerializedAuthUser()
    const AuthUser = createAuthUser({
      serializedAuthUser: mockSerializedAuthUser,
    })
    const AuthUserSerialized = AuthUser.serialize()
    expect(AuthUserSerialized).toEqual(mockSerializedAuthUser)
    expect(createAuthUser({ serializedAuthUser: AuthUserSerialized })).toEqual({
      ...AuthUser,
      getIdToken: expect.any(Function),
      serialize: expect.any(Function),
      signOut: expect.any(Function),
    })
  })

  it("does not call Firebase's signOut method when we call AuthUser.signOut (it should be a noop)", async () => {
    expect.assertions(1)
    const createAuthUser = require('src/createAuthUser').default
    const AuthUser = createAuthUser({
      serializedAuthUser: createMockSerializedAuthUser(),
    })
    await AuthUser.signOut()
    expect(firebase.auth().signOut).not.toHaveBeenCalled()
  })
})
