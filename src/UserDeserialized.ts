export interface UserDeserialized {
  id?: string
  claims?: object
  email?: string
  emailVerified: boolean
  phoneNumber?: string
  displayName?: string
  photoURL?: string
  clientInitialized: boolean
  _token?: string
  tenantId: string
}
