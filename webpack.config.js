/* eslint-disable @typescript-eslint/no-var-requires */
const path = require('path')
const { BundleAnalyzerPlugin } = require('webpack-bundle-analyzer')
const nodeExternals = require('webpack-node-externals')
const CopyPlugin = require('copy-webpack-plugin')
const includeSubdependencies = require('datwd')
const TsconfigPathsPlugin = require('tsconfig-paths-webpack-plugin')

const analyzeBundle = process.env.WEBPACK_ANALYZE_BUNDLE

const sharedConfig = {
  mode: 'production',
  output: {
    // filename set in individual configs below.
    path: path.resolve(__dirname, 'build'),
    libraryTarget: 'commonjs2',
    libraryExport: 'default',
  },
  resolve: {
    plugins: [new TsconfigPathsPlugin({})],
    extensions: ['.js', '.jx', '.ts', '.tsx'],
  },
  module: {
    rules: [
      {
        test: /\.tsx?$/,
        exclude: /node_modules/,
        use: 'ts-loader',
      },
      {
        test: /\.(js|jsx)$/,
        exclude: /node_modules/,
        use: 'babel-loader',
      },

      // All output '.js' files will have any sourcemaps re-processed by 'source-map-loader'.
      { test: /\.js$/, loader: 'source-map-loader' },
    ],
  },
  externals: [
    // By default, don't bundle anything from node_modules.
    nodeExternals({
      // Using `includeSubdependencies` ensures that dependencies all the way
      // down the tree are included for these modules:
      // https://github.com/kmjennison/datwd
      allowlist: includeSubdependencies(['hoist-non-react-statics', 'cookies']),
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
        {
          from: './codemod',
          to: './codemod',
          globOptions: {
            gitignore: true,
            ignore: ['**/*.test.*/**', '**/*.fixtures/**'],
          },
        },
      ],
    }),
  ],
}

const serverConfig = {
  ...sharedConfig,
  entry: './src/index.server.ts',
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
  entry: './src/index.ts',
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
