import { User as FirebaseUser } from 'firebase/auth'

export interface User {
  id: string | null
  email: string | null
  emailVerified: boolean
  phoneNumber: string | null
  displayName: string | null
  photoURL: string | null
  claims: Record<string, string | boolean>
  tenantId: string | null
  getIdToken: (forceRefresh?: boolean) => Promise<string | null>
  clientInitialized: boolean
  firebaseUser: FirebaseUser | null
  signOut: () => Promise<void>
  serialize: (a?: { includeToken?: boolean }) => string
}
