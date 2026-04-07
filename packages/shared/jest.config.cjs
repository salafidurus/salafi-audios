/** @type {import('jest').Config} */
module.exports = {
  testEnvironment: "node",

  testRegex: "src/.*\\.spec\\.[tj]sx?$",

  testPathIgnorePatterns: ["/node_modules/", "/dist/", "/build/"],

  transform: {
    "^.+\\.(t|j)sx?$": [
      "ts-jest",
      {
        tsconfig: "tsconfig.json",
        isolatedModules: true,
      },
    ],
  },

  moduleFileExtensions: ["ts", "tsx", "js", "jsx", "json"],

  collectCoverageFrom: [
    "src/**/*.{ts,tsx,js,jsx}",
    "!src/**/*.d.ts",
    "!src/**/index.{ts,tsx,js,jsx}",
    "!**/*.config.*",
    "!**/dist/**",
    "!**/build/**",
  ],

  coveragePathIgnorePatterns: ["/node_modules/", "/dist/", "/build/"],
};
