/** @type {import('jest').Config} */
module.exports = {
  // Root of the API app
  rootDir: '.',

  // Find both unit + e2e tests
  testMatch: ['<rootDir>/src/**/*.spec.ts'],

  moduleFileExtensions: ['js', 'json', 'ts'],

  transform: {
    '^.+\\.(t|j)s$': 'ts-jest',
  },

  transformIgnorePatterns: [
    'node_modules/.pnpm/(?!@paralleldrive\\+cuid2)',
  ],

  testEnvironment: 'node',

  // 👇 THIS fixes your "@/..." imports
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/src/$1',
  },

  collectCoverageFrom: ['<rootDir>/src/**/*.ts'],

  coverageDirectory: '<rootDir>/../coverage',

  // Recommended for NestJS + TS
  clearMocks: true,
};
