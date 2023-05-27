# Migration Guide

## v1 from v0.x

### _Work in Progress_

### Breaking Changes: API

To run all codemods:

TODO

#### The SSR data property `AuthUser` has become `user`

The `withAuthUserTokenSSR` and `withAuthUserSSR` functions will receive an object with a `user` property rather than an `AuthUser` property.

Codemod #1:

`npx -p next-firebase-auth codemod rename-authuser-withauthusertokenssr .`

Codemod #2:

`npx -p next-firebase-auth codemod rename-authuser-withauthuserssr .`

#### `withAuthUser` has become `withUser`

Codemod:

`npx -p next-firebase-auth codemod withauthuser-to-withuser .`

#### `withAuthUserTokenSSR` has become `withUserTokenSSR`

Codemod:

`npx -p next-firebase-auth codemod withauthusertokenssr-to-withusertokenssr .`

#### `withAuthUserSSR` has become `withUserSSR`

Codemod:

`npx -p next-firebase-auth codemod withauthuserssr-to-withuserssr .`

#### `useAuthUser` has become `useAuthUser`

Codemod:

`npx -p next-firebase-auth codemod useauthuser-to-useuser .`

#### The redirect function property `AuthUser` has become `user`

Any function handlers used for `authPageURL` and `appPageUrl` will receive an object with a `user` property rather than an `AuthUser` property.

#### The `setAuthCookies` return data property `AuthUser` has become `user`

Codemod:

`npx -p next-firebase-auth codemod rename-authuser-setauthcookies .`

### Breaking Changes: Peer Dependencies

TODO
