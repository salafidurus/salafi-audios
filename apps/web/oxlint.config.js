import { defineConfig } from "oxlint";
import web from "oxlint-config-universe/web";

export default defineConfig({
  extends: [web],
  overrides: [
    {
      files: ["src/features/**/*.{ts,tsx}", "src/shared/**/*.{ts,tsx}", "src/core/**/*.{ts,tsx}"],
      excludeFiles: ["src/shared/types/**/*.d.ts"],
      rules: {
        "import/no-default-export": "error",
        "react/jsx-curly-brace-presence": ["warn", { props: "ignore", children: "never" }],
      },
    },
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
  ],
});
