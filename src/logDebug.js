import isClientSide from 'src/isClientSide'

let isDebugEnabled = false

const logDebug = (...args) => {
  if (!isDebugEnabled) {
    return
  }

  // Only add the styled prefix in a browser context.
  const prefix = isClientSide()
    ? [
        '%cnext-firebase-auth',
        'background: #ffa000; color: #fff; border-radius: 2px; padding: 2px 6px',
      ]
    : ['next-firebase-auth:']

  // eslint-disable-next-line no-console
  console.log(...prefix, ...args)
}

export const setDebugEnabled = (isEnabled) => {
  isDebugEnabled = isEnabled
}

export default logDebug
