/** @type {import('jest').Config} */
module.exports = {
  preset: "jest-expo",
  testEnvironment: "node",
  setupFilesAfterEnv: ["<rootDir>/jest.setup.js"],
  moduleNameMapper: {
    "^@/(.*)$": "<rootDir>/src/$1",
    // jest resolves the package's web entry by default; the native app needs the
    // native theme (lightMobileTheme/darkMobileTheme) for its Unistyles mock.
    "^@sd/design-tokens$": "<rootDir>/../../packages/design-tokens/src/index.native.ts",
  },
  transformIgnorePatterns: [
    "node_modules/(?!(?:.pnpm/)?((jest-)?react-native|@react-native(-community)?|@react-native/.*|expo(nent)?|@expo(nent)?/.*|react-navigation|@react-navigation/.*))",
  ],
  collectCoverage: true,
  collectCoverageFrom: [
    "src/**/*.{ts,tsx,js,jsx}",
    "!src/**/*.d.ts",
    "!src/**/__tests__/**",
    "!src/**/?(*.)+(spec|test).{ts,tsx,js,jsx}",
    "!src/app/**",
    "!src/**/index.{ts,tsx,js,jsx}",
  ],
  coveragePathIgnorePatterns: ["/node_modules/", "/dist/", "/build/"],
};
