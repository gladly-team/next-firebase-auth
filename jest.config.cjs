/** @type {import('ts-jest/dist/types').InitialOptionsTsJest} */
module.exports = {
  collectCoverageFrom: [
    'src/**/*.{js,jsx,ts,tsx}',
    '!**/*.d.ts',
    '!**/node_modules/**',
    '!**/__generated__/**',
    '!**/__mocks__/**',
    '!**/__tests__/**',
  ],
  coverageDirectory: './coverage/',
  setupFilesAfterEnv: ['<rootDir>/jestSetup.js'],
  // Support absolute imports; e.g. from 'src/*'
  // https://stackoverflow.com/a/72437265/1332513
  moduleDirectories: ['node_modules', '<rootDir>'],
  testPathIgnorePatterns: [
    '/node_modules/',
    '/.next/',
    '/.yalc/',
    '/.git/',
    'build/',
  ],
  transform: {
    '^.+\\.(js|jsx)$': '<rootDir>/node_modules/babel-jest',
    '^.+\\.(ts|tsx)$': 'ts-jest',
  },
  transformIgnorePatterns: [
    '/node_modules/(?!(firebase|@firebase|jose)/)',
    '/.yalc/',
    '^.+\\.module\\.(css|sass|scss)$',
  ],
  testEnvironment: 'node',
}
