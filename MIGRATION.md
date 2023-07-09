# Migration Guide

## v1 from v0.x

### Overview

Migrating to v1 requires a few steps:
1. Migrate to the latest API
2. Upgrade `firebase` and `firebase-admin`
    * Note: we recommend pinning `firebase` 9.16.0 until issue [#614](https://github.com/gladly-team/next-firebase-auth/issues/614) is resolved

### Breaking Changes: API

v1 renames "AuthUser" to "user" where it's used across methods and properties. Codemods are available to handle changes in nearly all cases.

**To run all codemods:**

```bash
npx -p next-firebase-auth codemod all-v1 .
```

[This pull request](https://github.com/gladly-team/next-firebase-auth/pull/666) shows all changes made when migrating the example app.

#### The SSR data property `AuthUser` has become `user`

The `withAuthUserTokenSSR` and `withAuthUserSSR` functions will receive an object with a `user` property rather than an `AuthUser` property.

Codemod #1:

```bash
npx -p next-firebase-auth codemod rename-authuser-withauthusertokenssr .
```

Codemod #2:

```bash
npx -p next-firebase-auth codemod rename-authuser-withauthuserssr .
```

#### `withAuthUser` has become `withUser`

Codemod:

```bash
npx -p next-firebase-auth codemod withauthuser-to-withuser .
```

#### `withAuthUserTokenSSR` has become `withUserTokenSSR`

Codemod:

```bash
npx -p next-firebase-auth codemod withauthusertokenssr-to-withusertokenssr .
```

#### `withAuthUserSSR` has become `withUserSSR`

Codemod:

```bash
npx -p next-firebase-auth codemod withauthuserssr-to-withuserssr .
```

#### `useAuthUser` has become `useAuthUser`

Codemod:

```bash
npx -p next-firebase-auth codemod useauthuser-to-useuser .
```

#### The `setAuthCookies` return data property `AuthUser` has become `user`

Codemod:

```bash
npx -p next-firebase-auth codemod rename-authuser-setauthcookies .
```

#### The redirect function property `AuthUser` has become `user`

Any function handlers used for `authPageURL` and `appPageUrl` will receive an object with a `user` property rather than an `AuthUser` property.

There is no codemod for this change. Please make edits manually.

### Breaking Changes: Peer Dependencies

* Dropped support for `firebase` <v9
* Dropped support for `firebase-admin` <v10

#### Upgrading to Firebase 9

Firebase 9 has a new API surface designed to facilitate tree-shaking (removal of unused code) to make your web app as small and fast as possible.

If you were previously using version 7 of 8 of the SDK you can easily upgrade by following the [official guide](https://firebase.google.com/docs/web/modular-upgrade).

Here is an example of how the migration might look in your app:

```diff
-import firebase from 'firebase/app'
-import 'firebase/firestore'
+import { getApp } from 'firebase/app'
+import { getFirestore, collection, onSnapshot } from 'firebase/firestore'
 import { useEffect } from 'react'

 const Artists = () => {
   const [artists, setArtists] = useState(artists)

   useEffect(() => {
-    return firebase.firestore()
-      .collection('artists')
-      .onSnapshot((snap) => {
+    return onSnapshot(collection(getFirestore(getApp()), 'artists'), (snap) => {
       if (!snap) {
         return
       }
       setArtists(snap.docs.map((doc) => ({ ...doc.data(), key: doc.id })))
     })
   }, [])

   return (
     <div>
       {artists.map((artist) => (
         <div>{artist.name}</div>
       ))}
     </div>
   )
 }
```
