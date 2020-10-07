let config
const isServerSide = typeof window === 'undefined'

const defaultConfig = {
  // Optional function. Called when the user's auth state
  // changes in the Firebase JS SDK so that the client can
  // update the auth cookies.
  onAuthStateChanged: () => {},
  // Optional string: the URL to navigate to when the user
  // needs to log in.
  loginRedirectURL: undefined,
  // Optional string: the URL to navigate to when the user
  // is alredy logged in but on an authentication page.
  appRedirectURL: undefined,
  // Optional object: the config passed to the Firebase
  // Node admin SDK's firebaseAdmin.initializeApp.
  // Not required if the app is initializing the admin SDK
  // elsewhere.
  firebaseAdminInitConfig: undefined,
  // Optional object: the config passed to the Firebase
  // client JS SDK firebase.initializeApp. Not required if
  // the app is initializing the JS SDK elsewhere.
  firebaseClientInitConfig: undefined,
  cookies: {
    // Required string. The base name for the auth cookies.
    cookieName: undefined,
    // Required string or array.
    keys: undefined,
    // Required object: options to pass to cookies.set.
    // https://github.com/pillarjs/cookies#cookiesset-name--value---options--
    // We'll default to stricter, more secure options.
    cookieOptions: {
      domain: undefined,
      httpOnly: true,
      maxAge: 604800000, // week
      overwrite: true,
      path: '/',
      sameSite: 'strict',
      secure: true,
    },
  },
}

const validateConfig = (mergedConfig) => {
  const errorMessages = []

  // Use isServerSide to prevent or allow certain config
  // properties based on client/server context.
  if (!isServerSide) {
    if (mergedConfig.firebaseAdminInitConfig) {
      errorMessages.push(
        'Setting "firebaseAdminInitConfig" should not be available on the client side.'
      )
    }
    if (mergedConfig.cookies.keys) {
      errorMessages.push(
        'Setting "cookies.keys" should not be available on the client side.'
      )
    }
  }
  return {
    isValid: errorMessages.length === 0,
    errors: errorMessages,
  }
}

export const setConfig = (userConfig = {}) => {
  const {
    cookies: { cookieOptions = {}, ...otherUserCookieOptions } = {},
    ...otherUserConfig
  } = userConfig

  // Merge the user's config with the default config, validate it,
  // and set it.
  const mergedConfig = {
    ...defaultConfig,
    ...otherUserConfig,
    cookies: {
      ...defaultConfig.cookies,
      ...otherUserCookieOptions,
      cookieOptions: {
        ...defaultConfig.cookies.cookieOptions,
        ...cookieOptions,
      },
    },
  }
  const { isValid, errors } = validateConfig(mergedConfig)
  if (!isValid) {
    throw new Error(`Invalid next-firebase-auth options: ${errors.join(' ')}`)
  }
  config = mergedConfig
}

export const getConfig = () => {
  if (!config) {
    throw new Error('Config not set.')
  }
  return config
}
