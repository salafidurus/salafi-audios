import expo from "eslint-config-expo/flat.js";
import base from "./base.js";

export default [
  ...base,
  ...expo,
  {
    settings: {
      "import/resolver": {
        typescript: {
          project: ["./tsconfig.json"],
        },
        node: { extensions: [".js", ".jsx", ".ts", ".tsx"] },
      },
    },
    rules: {
      "import/no-cycle": ["error", { maxDepth: 2 }],
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
];
