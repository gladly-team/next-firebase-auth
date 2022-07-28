/**
 * Decode a base64 value to an object.
 */
export const decodeBase64 = (string: string): unknown => {
  const body = Buffer.from(string, 'base64').toString('utf8')
  return JSON.parse(body)
}

/**
 * Encode an object into a base64-encoded JSON string.
 */
export const encodeBase64 = (obj: unknown): string => {
  const str = JSON.stringify(obj)
  return Buffer.from(str).toString('base64')
}
