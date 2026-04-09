import expo from "eslint-config-expo/flat.js";
import base from "./base.js";

export default [
  ...expo,
  ...base,
  {
    settings: {
      "import/resolver": {
        typescript: {
          project: ["./tsconfig.json"],
          // tsconfigRootDir: "./",
        },
        node: { extensions: [".js", ".jsx", ".ts", ".tsx"] },
      },
    },
    rules: {
      // "import/no-cycle": ["error", { maxDepth: 2 }],
      "import/no-restricted-paths": [
        "error",
        {
          zones: [
            { target: "./src/shared", from: "./src/app" },
            { target: "./src/shared", from: "./src/features" },
            { target: "./src/features", from: "./src/app" },
          ],
        },
      ],
    },
  },
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
  // App barrel files: allowed to re-export
  {
    files: ["src/features/*/index.ts", "src/shared/**/index.ts", "src/core/*/index.ts"],
    rules: { "no-restricted-syntax": "off" },
  },
];
