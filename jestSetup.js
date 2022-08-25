/* eslint-disable import/no-extraneous-dependencies */
import 'core-js/stable'
import 'regenerator-runtime/runtime'

// Force warnings to fail Jest tests.
// https://github.com/facebook/jest/issues/6121#issuecomment-444269677
const { error } = console

// eslint-disable-next-line func-names, no-console
console.error = function (message, ...args) {
  error.apply(console, args) // keep default behaviour
  throw message instanceof Error ? message : new Error(message)
}
