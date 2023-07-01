/* eslint-disable @typescript-eslint/no-explicit-any */
export {}

let config: any

const mock: any = jest.createMockFromModule('../config')

mock.setConfig = jest.fn((newConfig) => {
  config = newConfig
})

mock.getConfig = jest.fn(() => config)

module.exports = mock
