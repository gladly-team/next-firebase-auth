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
  testPathIgnorePatterns: ['/node_modules/', '/.next/', '/.yalc/', '/.git/'],
  transform: {
    '^.+\\.(js|jsx|ts|tsx)$': '<rootDir>/node_modules/babel-jest',
  },
  transformIgnorePatterns: [
    '/node_modules/(?!(firebase|@firebase)/)',
    '/.yalc/',
    '^.+\\.module\\.(css|sass|scss)$',
  ],
}
