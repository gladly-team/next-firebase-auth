/**
 * List of standard claims in the DecodedIdToken
 * https://firebase.google.com/docs/reference/admin/node/firebase-admin.auth.decodedidtoken
 */
export const STANDARD_CLAIMS = [
  'aud',
  'auth_time',
  'email',
  'email_verified',
  'exp',
  'firebase',
  'iat',
  'iss',
  'name',
  'phone_number',
  'picture',
  'sub',
  'uid',
  'user_id', // not listed in the decodedIDtoken reference but it appears in tokens
]

export interface Claims {
  [key: string]: string | object | undefined
}
/**
 * Filter out all standard claims from an object of claims
 *
 * @param {Object} obj
 */
export const filterStandardClaims = (obj: Claims = {}) => {
  const claims: Claims = {}
  Object.keys(obj).forEach((key) => {
    if (!STANDARD_CLAIMS.includes(key)) {
      claims[key] = obj[key]
    }
  })
  return claims
}
