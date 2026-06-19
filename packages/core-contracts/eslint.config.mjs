import packagesConfig from "../../eslint.config.packages.mjs";

/** @type {import('eslint').Linter.Config[]} */
export default [
  ...packagesConfig,
  {
    ignores: ["dist/**", "**/*.config.*", "**/*.d.ts"],
  },
];
