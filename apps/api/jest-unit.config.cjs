/** @type {import('jest').Config} */
module.exports = {
  // Root of the API app
  rootDir: '.',

  // Find only service unit tests (avoid repo tests that depend on Prisma)
  testMatch: ['<rootDir>/src/**/*.service.spec.ts'],

  moduleFileExtensions: ['js', 'json', 'ts'],

  transform: {
    '^.+\\.ts$': 'ts-jest',
  },

  testEnvironment: 'node',

  // 👇 THIS fixes your "@/..." imports
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/src/$1',
  },

  collectCoverageFrom: ['<rootDir>/src/**/*.service.ts'],

  coverageDirectory: '<rootDir>/../coverage',

  // Recommended for NestJS + TS
  clearMocks: true,
};