import baseConfig from "@sd/util-config/eslint/base";

/** @type {import('eslint').Linter.Config[]} */
export default [
  ...baseConfig,
  {
    ignores: ["dist/**", "**/*.config.*", "**/*.d.ts"],
  },
];
