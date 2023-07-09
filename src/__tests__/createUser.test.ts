import { signOut } from 'firebase/auth'
import {
  createMockFirebaseUserClientSDK,
  createMockFirebaseUserAdminSDK,
  createMockSerializedUser,
} from 'src/testHelpers/userInputs'

jest.mock('firebase/auth')
jest.mock('firebase/app')

afterEach(() => {
  jest.clearAllMocks()
})

describe('createUser: basic tests', () => {
  it('returns the expected data for an unauthenticated user', () => {
    expect.assertions(1)
    const createUser = require('src/createUser').default
    expect(createUser()).toEqual({
      claims: {},
      clientInitialized: false,
      email: null,
      emailVerified: false,
      tenantId: null,
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
    const createUser = require('src/createUser').default
    expect(() => {
      createUser({
        firebaseUserClientSDK: createMockFirebaseUserClientSDK(),
        firebaseUserAdminSDK: createMockFirebaseUserAdminSDK(),
        serializedUser: createMockSerializedUser(),
      })
    }).toThrow(
      'createUser cannot receive more than one of the following properties: "firebaseUserClientSDK", "firebaseUserAdminSDK", "serializedUser"'
    )
  })

  it('throws if more than one user input is defined', () => {
    expect.assertions(1)
    const createUser = require('src/createUser').default
    expect(() => {
      createUser({
        firebaseUserClientSDK: createMockFirebaseUserClientSDK(),
        firebaseUserAdminSDK: createMockFirebaseUserAdminSDK(),
        serializedUser: undefined,
      })
    }).toThrow(
      'createUser cannot receive more than one of the following properties: "firebaseUserClientSDK", "firebaseUserAdminSDK", "serializedUser"'
    )
  })

  it('throws if "clientInitialized" is true but "firebaseUserAdminSDK" is set (only the client should set clientInitialized)', () => {
    expect.assertions(1)
    const createUser = require('src/createUser').default
    expect(() => {
      createUser({
        firebaseUserAdminSDK: createMockFirebaseUserAdminSDK(),
        clientInitialized: true,
      })
    }).toThrow(
      'The "clientInitialized" value can only be true when called with the "firebaseUserClientSDK" property or no user.'
    )
  })

  it('throws if "clientInitialized" is true but "serializedUser" is set (only the client should set clientInitialized)', () => {
    expect.assertions(1)
    const createUser = require('src/createUser').default
    expect(() => {
      createUser({
        serializedUser: createMockSerializedUser(),
        clientInitialized: true,
      })
    }).toThrow(
      'The "clientInitialized" value can only be true when called with the "firebaseUserClientSDK" property or no user.'
    )
  })

  it('does not throw if "clientInitialized" is true and no user property is defined (here, the user is logged out on the client side)', () => {
    expect.assertions(1)
    const createUser = require('src/createUser').default
    expect(() => {
      createUser({
        firebaseUserClientSDK: undefined,
        firebaseUserAdminSDK: undefined,
        serializedUser: undefined,
        clientInitialized: true,
      })
    }).not.toThrow()
  })

  it('throws if "token" is defined but "firebaseUserAdminSDK" is not defined (only the server should manually set the token this way)', () => {
    expect.assertions(1)
    const createUser = require('src/createUser').default
    expect(() => {
      createUser({
        firebaseUserClientSDK: createMockFirebaseUserClientSDK(),
        token: 'some-token-val',
      })
    }).toThrow(
      'The "token" value can only be set if the "firebaseUserAdminSDK" property is defined.'
    )
  })
})

describe('createUser: firebaseUserClientSDK', () => {
  it('returns the expected data', () => {
    expect.assertions(1)
    const createUser = require('src/createUser').default
    const firebaseUserJSSDK = createMockFirebaseUserClientSDK()
    expect(createUser({ firebaseUserClientSDK: firebaseUserJSSDK })).toEqual({
      id: 'abc-123',
      email: 'abc@example.com',
      emailVerified: true,
      phoneNumber: '+1800-123-4567',
      tenantId: null,
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
    const createUser = require('src/createUser').default
    const customClaims = {
      foo: 'bar',
      has: 'cheese',
      likes: 'cats',
      registered: true,
    }
    const firebaseUserJSSDK = createMockFirebaseUserClientSDK()
    expect(
      createUser({
        firebaseUserClientSDK: firebaseUserJSSDK,
        claims: customClaims,
      })
    ).toEqual({
      id: 'abc-123',
      email: 'abc@example.com',
      emailVerified: true,
      phoneNumber: '+1800-123-4567',
      tenantId: null,
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
    const createUser = require('src/createUser').default
    expect(() => {
      createUser({
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
    const createUser = require('src/createUser').default
    const user = createUser({
      firebaseUserClientSDK: createMockFirebaseUserClientSDK(),
    })
    const token = await user.getIdToken()
    expect(token).toEqual('my-id-token-abc-123')
  })

  it('returns the expected value from serialize', async () => {
    expect.assertions(1)
    const createUser = require('src/createUser').default
    const user = createUser({
      firebaseUserClientSDK: createMockFirebaseUserClientSDK(),
    })
    const userSerialized = user.serialize()
    expect(userSerialized).toEqual(
      JSON.stringify({
        id: 'abc-123',
        claims: {},
        email: 'abc@example.com',
        emailVerified: true,
        tenantId: null,
        phoneNumber: '+1800-123-4567',
        displayName: 'Abc Cdf',
        photoURL: 'https://abc.googleusercontent.com/cdf/profile_photo.png',
        clientInitialized: false,
        _token: null,
      })
    )
  })

  it("calls Firebase's signOut method when we call user.signOut", async () => {
    expect.assertions(1)
    const createUser = require('src/createUser').default
    const user = createUser({
      firebaseUserClientSDK: createMockFirebaseUserClientSDK(),
    })
    await user.signOut()
    expect(signOut).toHaveBeenCalled()
  })

  it("does not call Firebase's signOut method when we call user.signOut and the user is unauthed", async () => {
    expect.assertions(1)
    const createUser = require('src/createUser').default
    const user = createUser({
      firebaseUserClientSDK: null,
    })
    await user.signOut()
    expect(signOut).not.toHaveBeenCalled()
  })
})

describe('createUser: firebaseUserAdminSDK', () => {
  it('returns the expected data', () => {
    expect.assertions(1)
    const createUser = require('src/createUser').default
    expect(
      createUser({ firebaseUserAdminSDK: createMockFirebaseUserAdminSDK() })
    ).toEqual({
      id: 'def-456',
      email: 'def@example.com',
      emailVerified: true,
      phoneNumber: '+1800-234-5678',
      tenantId: null,
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
    const createUser = require('src/createUser').default
    const firebaseUserAdminSDK = {
      ...createMockFirebaseUserAdminSDK(),
      foo: 'bar',
      haz: 'cheese',
    }
    expect(createUser({ firebaseUserAdminSDK })).toEqual({
      id: 'def-456',
      email: 'def@example.com',
      emailVerified: true,
      phoneNumber: '+1800-234-5678',
      tenantId: null,
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
    const createUser = require('src/createUser').default
    const firebaseUserAdminSDK = createMockFirebaseUserAdminSDK()
    expect(() => {
      createUser({ firebaseUserAdminSDK, claims: { some: 'stuff' } })
    }).toThrow(
      'The "claims" value can only be set in conjunction with the "firebaseUserClientSDK" property.'
    )
  })

  it('returns the expected value from getIdToken when a token is not provided', async () => {
    expect.assertions(1)
    const createUser = require('src/createUser').default
    const user = createUser({
      firebaseUserAdminSDK: createMockFirebaseUserAdminSDK(),
      // token: undefined, // no token
    })
    const token = await user.getIdToken()
    expect(token).toBeNull()
  })

  it('returns the expected value from getIdToken when a token is provided', async () => {
    expect.assertions(1)
    const createUser = require('src/createUser').default
    const user = createUser({
      firebaseUserAdminSDK: createMockFirebaseUserAdminSDK(),
      token: 'my-id-token-def-456',
    })
    const token = await user.getIdToken()
    expect(token).toEqual('my-id-token-def-456')
  })

  it('returns the expected value from serialize when a token is not provided', async () => {
    expect.assertions(1)
    const createUser = require('src/createUser').default
    const user = createUser({
      firebaseUserAdminSDK: createMockFirebaseUserAdminSDK(),
      // token: undefined, // no token
    })
    const userSerialized = user.serialize()
    expect(userSerialized).toEqual(
      JSON.stringify({
        id: 'def-456',
        claims: {},
        email: 'def@example.com',
        emailVerified: true,
        tenantId: null,
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
    const createUser = require('src/createUser').default
    const user = createUser({
      firebaseUserAdminSDK: createMockFirebaseUserAdminSDK(),
      token: 'my-id-token-def-456',
    })
    const userSerialized = user.serialize()
    expect(userSerialized).toEqual(
      JSON.stringify({
        id: 'def-456',
        claims: {},
        email: 'def@example.com',
        emailVerified: true,
        tenantId: null,
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
    const createUser = require('src/createUser').default
    const customClaims = {
      foo: 'bar',
      has: 'cheese',
      likes: 'cats',
      registered: true,
    }
    const user = createUser({
      firebaseUserAdminSDK: {
        ...createMockFirebaseUserAdminSDK(),
        ...customClaims,
      },
      token: 'my-id-token-def-456',
    })
    const userSerialized = user.serialize()
    expect(userSerialized).toEqual(
      JSON.stringify({
        id: 'def-456',
        claims: customClaims,
        email: 'def@example.com',
        emailVerified: true,
        tenantId: null,
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
    const createUser = require('src/createUser').default
    const user = createUser({
      firebaseUserAdminSDK: createMockFirebaseUserAdminSDK(),
      token: 'my-id-token-def-456',
    })
    const userSerialized = user.serialize({ includeToken: false })
    expect(userSerialized).toEqual(
      JSON.stringify({
        id: 'def-456',
        claims: {},
        email: 'def@example.com',
        emailVerified: true,
        tenantId: null,
        phoneNumber: '+1800-234-5678',
        displayName: 'Def Ghi',
        photoURL: 'https://def.googleusercontent.com/ghi/profile_photo.png',
        clientInitialized: false,
        _token: undefined,
      })
    )
  })

  it("does not call Firebase's signOut method when we call user.signOut (it should be a noop)", async () => {
    expect.assertions(1)
    const createUser = require('src/createUser').default
    const user = createUser({
      firebaseUserAdminSDK: createMockFirebaseUserAdminSDK(),
      token: 'my-id-token-def-456',
    })
    await user.signOut()
    expect(signOut).not.toHaveBeenCalled()
  })
})

describe('createUser: serializedUser', () => {
  it('returns the expected data', () => {
    expect.assertions(1)
    const createUser = require('src/createUser').default
    expect(createUser({ serializedUser: createMockSerializedUser() })).toEqual({
      id: 'ghi-789',
      email: 'ghi@example.com',
      emailVerified: true,
      phoneNumber: '+1800-345-6789',
      tenantId: null,
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
    const createUser = require('src/createUser').default
    const serializedUser = createMockSerializedUser({
      claims: customClaims,
    })
    expect(createUser({ serializedUser })).toEqual({
      id: 'ghi-789',
      email: 'ghi@example.com',
      emailVerified: true,
      phoneNumber: '+1800-345-6789',
      tenantId: null,
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
    const createUser = require('src/createUser').default
    expect(() => {
      createUser({
        serializedUser: createMockSerializedUser(),
        claims: { some: 'stuff' },
      })
    }).toThrow(
      'The "claims" value can only be set in conjunction with the "firebaseUserClientSDK" property.'
    )
  })

  it('returns the original values from serialize and back', async () => {
    expect.assertions(2)
    const createUser = require('src/createUser').default
    const mockserializedUser = createMockSerializedUser()
    const user = createUser({
      serializedUser: mockserializedUser,
    })
    const userSerialized = user.serialize()
    expect(userSerialized).toEqual(mockserializedUser)
    expect(createUser({ serializedUser: userSerialized })).toEqual({
      ...user,
      getIdToken: expect.any(Function),
      serialize: expect.any(Function),
      signOut: expect.any(Function),
    })
  })

  it("does not call Firebase's signOut method when we call user.signOut (it should be a noop)", async () => {
    expect.assertions(1)
    const createUser = require('src/createUser').default
    const user = createUser({
      serializedUser: createMockSerializedUser(),
    })
    await user.signOut()
    expect(signOut).not.toHaveBeenCalled()
  })

  it('returns expected data when tenantId set in firebaseUserClientSDK', () => {
    expect.assertions(1)
    const createUser = require('src/createUser').default
    const firebaseUserJSSDK = createMockFirebaseUserClientSDK({
      tenantId: 'some-tenant-id',
    })
    expect(
      createUser({
        firebaseUserClientSDK: firebaseUserJSSDK,
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
      claims: {},
      tenantId: 'some-tenant-id',
    })
  })

  it('returns expected data when tenantId set in firebaseUserAdminSDK', () => {
    expect.assertions(1)
    const createUser = require('src/createUser').default
    const firebaseUserAdminSDK = createMockFirebaseUserAdminSDK({
      tenant: 'some-tenant-id',
    })
    expect(
      createUser({
        firebaseUserAdminSDK,
      })
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
      tenantId: 'some-tenant-id',
    })
  })

  it('returns the expected data when tenantId in serializedUser', () => {
    expect.assertions(1)
    const createUser = require('src/createUser').default
    expect(
      createUser({
        serializedUser: createMockSerializedUser({
          tenantId: 'some-tenant-id',
        }),
      })
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
      tenantId: 'some-tenant-id',
    })
  })
})
