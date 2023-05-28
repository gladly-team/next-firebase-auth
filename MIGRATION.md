# Migration Guide

## v1 from v0.x

### _Work in Progress_

### Breaking Changes: API

v1 renames "AuthUser" to "user" where it's used across methods and properties. Codemods are available to handle changes in nearly all cases.

**To run all codemods:**

```bash
npx -p next-firebase-auth codemod all-v1 .
```

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

TODO
