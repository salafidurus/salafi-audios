import expo from "eslint-config-expo/flat.js";

export default [
  ...expo,
  {
    files: ["src/shared/log/**/*.{js,jsx,ts,tsx}", "app.config.ts"],
    rules: { "no-console": "off" },
  },
  // Enforce named exports in all non-framework files
  {
    files: ["src/features/**/*.{ts,tsx}", "src/shared/**/*.{ts,tsx}", "src/core/**/*.{ts,tsx}"],
    rules: {
      "import/no-default-export": "error",
    },
  },
  // Expo Router requires default exports for route and layout files
  {
    files: ["src/app/**/*.{ts,tsx}"],
    rules: {
      "import/no-default-export": "off",
    },
  },
];
