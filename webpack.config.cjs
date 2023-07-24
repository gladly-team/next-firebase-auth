/* eslint-disable @typescript-eslint/no-var-requires */
const path = require('path')
const { BundleAnalyzerPlugin } = require('webpack-bundle-analyzer')
const nodeExternals = require('webpack-node-externals')
const CopyPlugin = require('copy-webpack-plugin')
const includeSubdependencies = require('datwd')
const TsconfigPathsPlugin = require('tsconfig-paths-webpack-plugin')

// import path from 'path'
// import { BundleAnalyzerPlugin } from 'webpack-bundle-analyzer'
// import nodeExternals from 'webpack-node-externals'
// import CopyPlugin from 'copy-webpack-plugin'
// import includeSubdependencies from 'datwd'
// import TsconfigPathsPlugin from 'tsconfig-paths-webpack-plugin'

const analyzeBundle = process.env.WEBPACK_ANALYZE_BUNDLE

const sharedConfig = {
  mode: 'production',
  // target: 'node',
  output: {
    chunkFormat: 'module',
    // filename set in individual configs below.
    path: path.resolve(path.resolve(), 'build'),
    // libraryTarget: 'commonjs',
    // module: true,
    library: {
      // type: 'commonjs',
      type: 'module',
    },
  },
  experiments: {
    outputModule: true,
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
      // importType: 'commonjs',
      importType: 'module',
    }),
    'fetch',
  ],
  plugins: [
    new CopyPlugin({
      patterns: [
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
  // target: 'es6',
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
  // target: 'web',
  // target: 'node',
  target: 'es6',
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
