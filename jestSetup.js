/* eslint-env jest */
/* eslint-disable import/no-extraneous-dependencies */
import 'core-js/stable'
import 'regenerator-runtime/runtime'

// `fetch` is polyfilled by Next.js.
global.fetch = jest.fn()
