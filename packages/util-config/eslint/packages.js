import importPlugin from "eslint-plugin-import";
import base from "./base.js";

export default [
  ...base,
  // Enforce named exports — no default exports in package source files
  {
    files: ["src/**/*.{ts,tsx}"],
    plugins: { import: importPlugin },
    rules: {
      "import/no-default-export": "error",
    },
  },
];
