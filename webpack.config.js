const path = require('path')
const { BundleAnalyzerPlugin } = require('webpack-bundle-analyzer')
const nodeExternals = require('webpack-node-externals')
const CopyPlugin = require('copy-webpack-plugin')

const analyzeBundle = process.env.WEBPACK_ANALYZE_BUNDLE

const sharedConfig = {
  mode: 'production',
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
  externals: [
    // By default, don't bundle anything from node_modules.
    nodeExternals({
      allowlist: ['cookies', 'hoist-non-react-statics'],
    }),
    'fetch',
  ],
  plugins: [
    new CopyPlugin({
      patterns: [
        {
          from: './index.d.ts',
          to: './index.d.ts',
        },
      ],
    }),
  ],
}

const serverConfig = {
  ...sharedConfig,
  entry: './src/index.server.js',
  target: 'node',
  output: {
    ...sharedConfig.output,
    filename: 'index.node.js',
  },
  plugins: [
    ...sharedConfig.plugins,
    new BundleAnalyzerPlugin({
      analyzerMode: analyzeBundle ? 'static' : 'disabled',
      defaultSizes: 'stat',
      reportFilename: 'report.index.node.html',
    }),
  ],
}

const clientConfig = {
  ...sharedConfig,
  entry: './src/index.js',
  target: 'web',
  output: {
    ...sharedConfig.output,
    filename: 'index.browser.js',
  },
  plugins: [
    ...sharedConfig.plugins,
    new BundleAnalyzerPlugin({
      analyzerMode: analyzeBundle ? 'static' : 'disabled',
      defaultSizes: 'stat',
      reportFilename: 'report.index.browser.html',
    }),
  ],
}

module.exports = [serverConfig, clientConfig]
