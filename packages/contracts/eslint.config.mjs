import baseConfig from "@sd/config/eslint/base";

/** @type {import('eslint').Linter.Config[]} */
export default [
  ...baseConfig,
  {
    ignores: ["dist/**", "**/*.config.*", "**/*.d.ts"],
  },
];
