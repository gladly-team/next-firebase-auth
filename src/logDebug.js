const logDebug = (...args) => {
  const prefix = [
    '%cnext-firebase-auth',
    'background: #ffa000; color: #fff; border-radius: 2px; padding: 2px 6px',
  ]

  // eslint-disable-next-line no-console
  console.log(...prefix, ...args)
}

export default logDebug
