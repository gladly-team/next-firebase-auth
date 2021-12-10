module.exports = {
  extends: ['airbnb', 'prettier'],
  plugins: ['prettier', 'react-hooks'],
  rules: {
    'prettier/prettier': 'error',
    'react/jsx-filename-extension': 0,
    'react/jsx-one-expression-per-line': 0,
    'react/no-unescaped-entities': 0,
    'react/prop-types': 0,
    'jsx-a11y/anchor-is-valid': 0, // https://github.com/zeit/next.js/issues/5533
    // The jsx-wrap-multilines rule conflicts with Prettier.
    // https://github.com/prettier/prettier/issues/1009#issuecomment-286993938
    'react/jsx-wrap-multilines': [
      'error',
      {
        declaration: false,
        assignment: false,
      },
    ],
    'react-hooks/rules-of-hooks': 'error',
    'react-hooks/exhaustive-deps': 'error',
    'react/function-component-definition': [
      2,
      {
        namedComponents: 'arrow-function',
        unnamedComponents: 'arrow-function',
      },
    ],
  },
  overrides: [
    // Set Jest rules only for test files.
    // https://stackoverflow.com/a/49211283
    {
      files: ['**/*.test.js', '**/__mocks__/**/*.js'],
      extends: ['plugin:jest/recommended'],
      env: {
        jest: true,
      },
      plugins: ['jest'],
      rules: {
        'global-require': 0,
        'react/jsx-props-no-spreading': 0,
      },
    },
    // Handle TypeScript separately.
    {
      files: ['**/*.ts', '**/*.tsx'],
      extends: ['plugin:@typescript-eslint/recommended'],
      plugins: ['@typescript-eslint'],
      parser: '@typescript-eslint/parser',
      rules: {
        // https://github.com/typescript-eslint/typescript-eslint/blob/master/docs/getting-started/linting/FAQ.md#i-am-using-a-rule-from-eslint-core-and-it-doesnt-work-correctly-with-typescript-code
        'no-shadow': 0,
        '@typescript-eslint/no-shadow': 'error',
        // https://github.com/typescript-eslint/typescript-eslint/blob/master/packages/eslint-plugin/docs/rules/no-use-before-defsine.md
        'no-use-before-define': 'off',
        '@typescript-eslint/no-use-before-define': ['error'],
      },
    },
  ],
  parserOptions: {
    ecmaVersion: 2018,
    sourceType: 'module',
  },
  env: {
    es6: true,
  },
  globals: {
    // Polyfilled in Next.js 9.4. Set as a Webpack external.
    fetch: 'writable',
  },
  settings: {
    // Handle linting for absolute imports.
    'import/resolver': {
      alias: [['src', './src']],
    },
  },
}
