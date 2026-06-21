import tseslint from "typescript-eslint";
import oxlint from "eslint-plugin-oxlint";

const BARREL_MESSAGE =
  "Barrel re-exports are only allowed in designated index files " +
  "(src/index.ts for packages; features/*/index.ts, shared/**/index.ts, " +
  "core/*/index.ts for apps).";

// Shared ignores + custom rules. Deliberately does NOT register the
// @typescript-eslint plugin, so this layer can be composed with
// eslint-config-next / eslint-config-expo (which bring their own
// typescript-eslint) without an ESLint "Cannot redefine plugin" error.
export const baseRules = [
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

// typescript-eslint recommended, scoped to TS files. Registers the
// @typescript-eslint plugin — compose this ONLY where the framework config
// does not already provide it (nest, packages — NOT next/expo).
export const typescriptRecommended = tseslint.configs.recommended.map((c) => ({
  ...c,
  files: ["**/*.{ts,tsx}"],
}));

// The recommended RULES only (no plugin registration). Apply this where a
// framework config (eslint-config-next / eslint-config-expo) already registers
// @typescript-eslint, so web/native keep full recommended coverage without the
// "Cannot redefine plugin" collision.
export const typescriptRecommendedRules = Object.assign(
  {},
  ...tseslint.configs.recommended.map((c) => c.rules ?? {}),
);

export default [...baseRules, ...typescriptRecommended, ...oxlint.configs["flat/recommended"]];
