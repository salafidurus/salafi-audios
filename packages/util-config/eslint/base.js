import tseslint from "typescript-eslint";

const BARREL_MESSAGE =
  "Barrel re-exports are only allowed in designated index files " +
  "(src/index.ts for packages; features/*/index.ts, shared/**/index.ts, " +
  "core/*/index.ts for apps).";

export default [
  {
    ignores: [
      "**/node_modules/**",
      "**/dist/**",
      "**/build/**",
      "**/.next/**",
      "**/.expo/**",
      "**/.opencode/**",
      "**/coverage/**",
      "**/generated/**",
    ],
  },
  {
    files: ["**/*.{js,cjs,mjs,jsx,ts,cts,mts,tsx}"],
    rules: {
      "no-console": "error",
    },
  },

  ...tseslint.configs.recommended.map((c) => ({
    ...c,
    files: ["**/*.{ts,tsx}"],
  })),

  // Disallow barrel re-exports outside designated index files
  {
    files: ["src/**/*.{ts,tsx}"],
    rules: {
      "no-restricted-syntax": [
        "error",
        {
          selector: "ExportNamedDeclaration[source!=null]",
          message: BARREL_MESSAGE,
        },
        {
          selector: "ExportAllDeclaration",
          message: BARREL_MESSAGE,
        },
      ],
    },
  },
  // Allow re-exports in package barrel files: src/index.ts, src/index.*.ts, src/*/index.ts
  {
    files: ["src/index.ts", "src/index.*.ts", "src/*/index.ts"],
    rules: { "no-restricted-syntax": "off" },
  },
];
