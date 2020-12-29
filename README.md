[![Build Status](https://travis-ci.org/gladly-team/next-firebase-auth.svg?branch=main)](https://travis-ci.org/gladly-team/next-firebase-auth)
[![codecov](https://codecov.io/gh/gladly-team/next-firebase-auth/branch/main/graph/badge.svg)](https://codecov.io/gh/gladly-team/next-firebase-auth)
[![npm](https://img.shields.io/npm/v/next-firebase-auth.svg)](https://www.npmjs.com/package/next-firebase-auth)

# next-firebase-auth
Simple Firebase authentication for all Next.js rendering strategies

###### 🌍 &nbsp; Support for all Next.js rendering strategies
###### 🔒 &nbsp; Signed, secure, http-only cookies by default
###### 🆔 &nbsp; Server-side access to the Firebase user ID token
###### ↩️ &nbsp; Built-in support for redirecting based on the user’s auth status

## When (Not) to Use this Package

This package makes it easy to access the Firebase user and ID token regardless of the Next.js rendering strategy.

However, you might choose **not** to use this package if:

* Your app only uses static pages or doesn't need the Firebase user for server-side rendering (SSR): use the Firebase JS SDK directly to load the user on the client side.
  * Upsides: It's simpler and removes this package as a dependency.
  * Downsides: You will not have access to the Firebase user when you use `getServerSideProps`.
* Your app needs the Firebase user for SSR (but does not need the ID token). You could consider one of these approaches: 
  1. On the client, set a JavaScript cookie with the Firebase user information once the Firebase JS SDK loads.
      * Upsides: You won't need login/logout API endpoints. You can include any auth data you'd like, so you can add custom claims that are accessible server-side, which are not currently supported by this package.
      * Downsides: The cookie will be unsigned and accessible to other JavaScript, making this approach less secure. You won't always have access to the Firebase ID token server-side, so you won't be able to access other Firebase services. (Note that you can set the ID token in the cookie, but it will expire after an hour and be invalid for future server-side-rendered pages.)
  2. Use [Firebase's session cookies](https://firebase.google.com/docs/auth/admin/manage-cookies).
      * Upsides: You'll have server-side access to custom claims and the ability to check for token revocation, which are not currently supported by this package.
      * Downsides: You won't have access to the Firebase ID token server-side, so you won't be able to access other Firebase services. You'll need to implement logic for verifying the session and managing session state.


## Demo
[See a live demo](https://nfa-example.vercel.app/) of the [example app](https://github.com/gladly-team/next-firebase-auth/tree/main/example).
