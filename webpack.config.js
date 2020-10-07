const path = require('path')

const sharedConfig = {
  mode: 'production',
  entry: './src/index.js',
  module: {
    rules: [
      {
        test: /\.(js|jsx)$/,
        exclude: /node_modules/,
        use: 'babel-loader',
      },
    ],
  },
  externals: {
    firebase: 'commonjs firebase',
    'firebase-admin': 'commonjs firebase-admin',
    next: 'commonjs next',
    'prop-types': 'commonjs prop-types',
    react: 'commonjs react',
    'react-dom': 'commonjs react-dom',
  },
}

const serverConfig = {
  ...sharedConfig,
  target: 'node',
  output: {
    path: path.resolve(__dirname, 'build'),
    filename: 'index.node.js',
    libraryTarget: 'commonjs2',
  },
}

const clientConfig = {
  ...sharedConfig,
  target: 'web',
  output: {
    path: path.resolve(__dirname, 'build'),
    filename: 'index.browser.js',
    libraryTarget: 'commonjs2',
  },
}

module.exports = [serverConfig, clientConfig]
