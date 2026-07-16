import { defineConfig } from "oxlint";
import native from "oxlint-config-universe/native";

export default defineConfig({
  extends: [native],
  overrides: [
    {
      files: ["src/features/**/*.{ts,tsx}", "src/shared/**/*.{ts,tsx}", "src/core/**/*.{ts,tsx}"],
      rules: {
        "import/no-default-export": "error",
      },
    },
    {
      files: ["src/app/**/*.{ts,tsx}"],
      rules: {
        "import/no-default-export": "off",
      },
    },
    {
      files: [
        "src/shared/log/**/*.{js,jsx,ts,tsx}",
        "app.config.ts",
        "src/core/config/runtime-env.ts",
        "src/core/providers.tsx",
      ],
      rules: {
        "no-console": "off",
      },
    },
  ],
});
