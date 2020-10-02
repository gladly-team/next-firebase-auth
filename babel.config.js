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
    ['@babel/plugin-transform-runtime'],
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
