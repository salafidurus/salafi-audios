# Design Spec: Oxlint Plugins & React Doctor Integration (Modular Inherited Version)

This design specification details the integration of `oxlint-plugin-react-doctor` and the selective enablement of built-in `oxlint` plugins across different packages and applications using a modular inheritance strategy.

## Goal

1. Integrate the `react-doctor` plugin into `oxlint` for all React-using packages and applications.
2. Selectively enable appropriate `oxlint` plugins (`react`, `react-perf`, `nextjs`, `jsx-a11y`, `node`, `promise`, `jest`, `vitest`, etc.) for packages and applications that require them.
3. Configure `lint-staged` to use `oxlint --fix` to automatically apply safe autofixes upon commit.
4. Run the linter and fix all linting errors thrown by the new rules.

---

## Configuration Strategy: Modular Inherited Configuration

Instead of repeating configuration options across 15 separate configuration files, we define core configuration blocks at the root of the project. Individual packages then inherit these building blocks simply by referencing them in their local `extends` array.

### 1. Root Base Configurations (located in `/`)

- **`.oxlintrc.json`**: Enables baseline, core global plugins (`eslint`, `typescript`, `unicorn`, `oxc`, `import`, `promise`) and defines global ignore patterns.
- **`.oxlintrc.react.json`**: Inherits from `.oxlintrc.json` and enables React plugins (`react`, `react-perf`, `jsx-a11y`) and registers `oxlint-plugin-react-doctor` as a JS plugin.
- **`.oxlintrc.vitest.json`**: Inherits from `.oxlintrc.json` and enables the `vitest` plugin.
- **`.oxlintrc.node.json`**: Inherits from `.oxlintrc.json` and enables the `node` plugin.
- **`.oxlintrc.jest.json`**: Inherits from `.oxlintrc.json` and enables the `jest` plugin.

### 2. Package-level Configurations (located in `apps/*/` and `packages/*/`)

Local configs simply extend the root configuration building blocks matching their stack. For example, a package using React and Vitest extends both `.oxlintrc.react.json` and `.oxlintrc.vitest.json`.

---

## Detailed Configuration Map

| Package / App | Path | Inherits/Extends | Stack / Notes |
|---|---|---|---|
| `salafi-durus` (Root) | `.` | - (Base) | Uses root `.oxlintrc.json` |
| `api` (App) | `apps/api` | `.oxlintrc.node.json`, `.oxlintrc.vitest.json` | Node + Vitest |
| `native` (App) | `apps/native` | `.oxlintrc.react.json`, `.oxlintrc.jest.json` | React + Jest |
| `web` (App) | `apps/web` | `.oxlintrc.react.json`, `.oxlintrc.vitest.json` | React + Vitest + Next.js (added to plugins locally) |
| `core-api` (Package) | `packages/core-api` | `.oxlintrc.node.json`, `.oxlintrc.vitest.json` | Node + Vitest |
| `core-contracts` (Package) | `packages/core-contracts` | `.oxlintrc.react.json`, `.oxlintrc.vitest.json` | React + Vitest |
| `core-db` (Package) | `packages/core-db` | `.oxlintrc.vitest.json` | Vitest |
| `core-i18n` (Package) | `packages/core-i18n` | `.oxlintrc.vitest.json` | Vitest |
| `design-tokens` (Package) | `packages/design-tokens` | `.oxlintrc.vitest.json` | Vitest |
| `domain-account` (Package) | `packages/domain-account` | `.oxlintrc.react.json`, `.oxlintrc.vitest.json` | React + Vitest |
| `domain-audio` (Package) | `packages/domain-audio` | `.oxlintrc.react.json`, `.oxlintrc.vitest.json` | React + Vitest |
| `domain-content` (Package) | `packages/domain-content` | `.oxlintrc.react.json`, `.oxlintrc.vitest.json` | React + Vitest |
| `domain-live` (Package) | `packages/domain-live` | `.oxlintrc.react.json`, `.oxlintrc.vitest.json` | React + Vitest |
| `domain-permissions` (Package) | `packages/domain-permissions` | `.oxlintrc.react.json`, `.oxlintrc.vitest.json` | React + Vitest |
| `domain-search` (Package) | `packages/domain-search` | `.oxlintrc.react.json`, `.oxlintrc.vitest.json` | React + Vitest |
| `utils-error` (Package) | `packages/utils-error` | `.oxlintrc.vitest.json` | Vitest |

---

## Proposed Configuration File Changes

### Root Configurations

#### `/.oxlintrc.json`
```json
{
  "$schema": "./node_modules/oxlint/configuration_schema.json",
  "plugins": ["import", "typescript", "unicorn", "oxc", "eslint", "promise"],
  "ignorePatterns": [
    "**/node_modules/**",
    "**/dist/**",
    "**/build/**",
    "**/.next/**",
    "**/.expo/**",
    "**/.opencode/**",
    "**/coverage/**",
    "**/generated/**"
  ]
}
```

#### `/.oxlintrc.react.json`
```json
{
  "$schema": "./node_modules/oxlint/configuration_schema.json",
  "extends": ["./.oxlintrc.json"],
  "plugins": ["import", "typescript", "unicorn", "oxc", "eslint", "promise", "react", "react-perf", "jsx-a11y"],
  "jsPlugins": [
    { "name": "react-doctor", "specifier": "oxlint-plugin-react-doctor" }
  ],
  "rules": {
    "react-doctor/no-fetch-in-effect": "warn",
    "react-doctor/no-derived-state": "warn"
  }
}
```

#### `/.oxlintrc.vitest.json`
```json
{
  "$schema": "./node_modules/oxlint/configuration_schema.json",
  "extends": ["./.oxlintrc.json"],
  "plugins": ["import", "typescript", "unicorn", "oxc", "eslint", "promise", "vitest"]
}
```

#### `/.oxlintrc.node.json`
```json
{
  "$schema": "./node_modules/oxlint/configuration_schema.json",
  "extends": ["./.oxlintrc.json"],
  "plugins": ["import", "typescript", "unicorn", "oxc", "eslint", "promise", "node"]
}
```

#### `/.oxlintrc.jest.json`
```json
{
  "$schema": "./node_modules/oxlint/configuration_schema.json",
  "extends": ["./.oxlintrc.json"],
  "plugins": ["import", "typescript", "unicorn", "oxc", "eslint", "promise", "jest"]
}
```

---

### Package/App Configuration Examples

#### `apps/web/.oxlintrc.json`
```json
{
  "$schema": "../../node_modules/oxlint/configuration_schema.json",
  "extends": ["../../.oxlintrc.react.json", "../../.oxlintrc.vitest.json"],
  "plugins": ["import", "typescript", "unicorn", "oxc", "eslint", "promise", "react", "react-perf", "jsx-a11y", "nextjs", "vitest"]
}
```

#### `apps/native/.oxlintrc.json`
```json
{
  "$schema": "../../node_modules/oxlint/configuration_schema.json",
  "extends": ["../../.oxlintrc.react.json", "../../.oxlintrc.jest.json"]
}
```

#### `packages/domain-content/.oxlintrc.json` (and all other React + Vitest packages)
```json
{
  "$schema": "../../node_modules/oxlint/configuration_schema.json",
  "extends": ["../../.oxlintrc.react.json", "../../.oxlintrc.vitest.json"]
}
```

#### `packages/core-db/.oxlintrc.json` (and all other Vitest-only packages)
```json
{
  "$schema": "../../node_modules/oxlint/configuration_schema.json",
  "extends": ["../../.oxlintrc.vitest.json"]
}
```
