import packagesConfig from "@sd/util-config/eslint/packages";

/** @type {import('eslint').Linter.Config[]} */
export default [
  ...packagesConfig,
  {
    ignores: ["dist/**", "**/*.config.*", "**/*.d.ts"],
  },
];
