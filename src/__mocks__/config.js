let config

const mock = jest.createMockFromModule('../config')

mock.setConfig = (newConfig) => {
  config = newConfig
}

mock.getConfig = () => config

module.exports = mock
