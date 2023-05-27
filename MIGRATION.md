# Migration Guide

## v1 from v0.x

### _Work in Progress_

### Breaking Changes: API

To run all codemods:

TODO

#### The SSR data property `AuthUser` has become `user`

The `withAuthUserTokenSSR` and `withAuthUserSSR` functions will receive an object with a `user` property rather than an `AuthUser` property.

Codemod: TODO

#### `withAuthUser` has become `withUser`

Codemod:

`withauthuser-to-withuser`

#### `withAuthUserTokenSSR` has become `withUserTokenSSR`

Codemod:

`withauthusertokenssr-to-withusertokenssr`

#### `withAuthUserSSR` has become `withUserSSR`

Codemod:

`withauthuserssr-to-withuserssr`

#### `useAuthUser` has become `useAuthUser`

Codemod:

`useauthuser-to-useuser`

#### The redirect function property `AuthUser` has become `user`

Any function handlers used for `authPageURL` and `appPageUrl` will receive an object with a `user` property rather than an `AuthUser` property.

Codemod: TODO

### Breaking Changes: Peer Dependencies

TODO
