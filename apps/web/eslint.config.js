import nextCoreWebVitals from "eslint-config-next/core-web-vitals";
import oxlint from "eslint-plugin-oxlint";
import { baseRules, typescriptRecommendedRules } from "../../eslint.config.base.mjs";

// eslint-config-next (next/typescript) already registers @typescript-eslint, so we
// compose the framework config with baseRules + the recommended RULES only — NOT the
// base default, which would re-register the plugin and trigger
// "Cannot redefine plugin @typescript-eslint".
const config = [
  ...nextCoreWebVitals,
  ...baseRules,
  { files: ["**/*.{ts,tsx}"], rules: typescriptRecommendedRules },
  // Enforce named exports in all non-framework files
  {
    files: ["src/features/**/*.{ts,tsx}", "src/shared/**/*.{ts,tsx}", "src/core/**/*.{ts,tsx}"],
    ignores: [
      // Ambient module declarations (.d.ts) use export default by convention
      "src/shared/types/**/*.d.ts",
    ],
    rules: {
      "import/no-default-export": "error",
    },
  },
  // Next.js App Router requires default exports for these file conventions
  {
    files: [
      "src/app/**/layout.tsx",
      "src/app/**/page.tsx",
      "src/app/**/error.tsx",
      "src/app/**/not-found.tsx",
      "src/app/**/loading.tsx",
      "src/app/**/template.tsx",
      "src/app/**/default.tsx",
      "src/app/**/global-error.tsx",
      "src/middleware.ts",
      "src/instrumentation.ts",
    ],
    rules: {
      "import/no-default-export": "off",
    },
  },
  // App barrel files: allowed to re-export
  {
    files: ["src/features/*/index.ts", "src/shared/**/index.ts", "src/core/*/index.ts"],
    rules: { "no-restricted-syntax": "off" },
  },
  ...oxlint.configs["flat/recommended"],
];

export default config;
