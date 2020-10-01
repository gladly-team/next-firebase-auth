module.exports = {
  presets: [
    '@babel/preset-react',
    [
      '@babel/preset-env',
      {
        targets: {
          browsers: ['>0.2%', 'not dead', 'not op_mini all'],
        },
      },
    ],
  ],
  plugins: [
    // Even though Next.js has built-in absolute imports, we need
    // this for imports in Jest tests.
    [
      'module-resolver',
      {
        root: ['./'],
        alias: {
          src: './src',
        },
      },
    ],
  ],
}
