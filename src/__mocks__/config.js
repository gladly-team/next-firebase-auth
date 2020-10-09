let config

const mock = jest.createMockFromModule('../config')

mock.setConfig = jest.fn((newConfig) => {
  config = newConfig
})

mock.getConfig = jest.fn(() => config)

module.exports = mock
