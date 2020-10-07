const path = require('path')
const { BundleAnalyzerPlugin } = require('webpack-bundle-analyzer')

const analyzeBundle = process.env.WEBPACK_ANALYZE_BUNDLE

const sharedConfig = {
  mode: 'production',
  entry: './src/index.js',
  output: {
    // filename set in individual configs below.
    path: path.resolve(__dirname, 'build'),
    libraryTarget: 'commonjs2',
    libraryExport: 'default',
  },
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
  plugins: [
    new BundleAnalyzerPlugin({
      analyzerMode: analyzeBundle ? 'static' : 'disabled',
      defaultSizes: 'stat',
    }),
  ],
}

const serverConfig = {
  ...sharedConfig,
  target: 'node',
  output: {
    ...sharedConfig.output,
    filename: 'index.node.js',
  },
}

const clientConfig = {
  ...sharedConfig,
  target: 'web',
  output: {
    ...sharedConfig.output,
    filename: 'index.browser.js',
  },
}

module.exports = [serverConfig, clientConfig]
