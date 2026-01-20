/** @type {import('jest').Config} */
module.exports = {
  preset: "jest-expo",
  testEnvironment: "node",
  setupFilesAfterEnv: ["<rootDir>/jest.setup.js"],

  // If you use @/ alias (tsconfig paths)
  moduleNameMapper: {
    "^@/(.*)$": "<rootDir>/src/$1",
  },

  // PNPM + Expo/RN transform whitelist
  transformIgnorePatterns: [
    "node_modules/(?!(?:.pnpm/)?((jest-)?react-native|@react-native(-community)?|expo(nent)?|@expo(nent)?/.*|@expo-google-fonts/.*|react-navigation|@react-navigation/.*|@sentry/react-native|native-base|react-native-svg))",
  ],

  collectCoverage: true,
  collectCoverageFrom: [
    "src/**/*.{ts,tsx,js,jsx}",
    "!src/**/*.d.ts",
    "!src/**/__tests__/**",
    "!src/**/?(*.)+(spec|test).{ts,tsx,js,jsx}",
    "!src/app/**",
    "!src/**/index.{ts,tsx,js,jsx}",
    "!src/**/types/**",
    "!src/**/*.dto.{ts,tsx}",
    "!src/**/data/**",
    "!src/**/*.style.{ts,tsx}",
  ],
  coveragePathIgnorePatterns: ["/node_modules/", "/dist/", "/build/"],

  // coverageThreshold: {
  //   global: {
  //     statements: 80,
  //     branches: 70,
  //     lines: 80,
  //     functions: 70
  //   },
  // },
};
