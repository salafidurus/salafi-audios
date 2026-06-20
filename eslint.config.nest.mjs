import globals from "globals";
import oxlint from "eslint-plugin-oxlint";
import base from "./eslint.config.base.mjs";

export default [
  ...base,
  {
    languageOptions: {
      globals: {
        ...globals.node,
      },
    },
  },
  ...oxlint.configs["flat/recommended"],
];
