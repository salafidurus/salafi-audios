import globals from "globals";
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
];
