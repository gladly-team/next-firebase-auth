/* globals jest */
/* eslint-disable import/no-extraneous-dependencies */
import 'core-js/stable'
import 'regenerator-runtime/runtime'
import crypto from 'crypto'
import { TextEncoder, TextDecoder } from 'util'

// Force warnings to fail Jest tests.
// https://github.com/facebook/jest/issues/6121#issuecomment-444269677
const { error } = console

// eslint-disable-next-line func-names, no-console
console.error = function (message, ...args) {
  error.apply(console, args) // keep default behaviour
  throw message instanceof Error ? message : new Error(message)
}

// Next.js polyfills fetch
global.fetch = jest.fn()

// https://github.com/jsdom/jsdom/issues/1612
Object.defineProperty(global.self, 'crypto', {
  value: {
    subtle: crypto.webcrypto.subtle,
  },
})

// https://github.com/inrupt/solid-client-authn-js/issues/1676#issuecomment-917016646
global.TextEncoder = TextEncoder
global.TextDecoder = TextDecoder
