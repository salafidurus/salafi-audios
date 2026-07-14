# Oxlint Plugins & React Doctor Integration Implementation Plan (Modular Inherited Version)

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Selective enablement of standard oxlint plugins per package/app using modular configuration inheritance, integrating react-doctor in all React packages, and enabling auto-fixing in lint-staged.

**Architecture:** Instead of repeating configuration options across 15 separate files, we define core configuration blocks at the root of the project. Package configs simple inherit these baseline building blocks via their local `extends` array.

**Tech Stack:** Bun, Turbo, Oxlint, React Doctor (`oxlint-plugin-react-doctor`), Lint-Staged.

## Global Constraints

- Never use `git --no-verify`.
- Monorepo boundaries are strict.
- Use explicit types, prefer unknown over any.
- No placeholders, TBD, or TODOs.
- All configuration changes are executed in the worktree directory `C:/dev/salafi-audios/.worktrees/c-oxlint`.

---

### Task 1: Install react-doctor Oxlint Plugin

**Files:**
- Modify: `package.json`

**Interfaces:**
- Produces: `oxlint-plugin-react-doctor` dependency inside workspace catalog and root devDependencies.

- [ ] **Step 1: Update workspace catalog in root package.json**
  Verify/add `"oxlint-plugin-react-doctor": "^0.5.8"` under the `workspaces.catalog` section of `package.json`.
  Also add `"oxlint-plugin-react-doctor": "catalog:"` to `devDependencies` at the bottom of `package.json`.

  ```json
  // In package.json
  "workspaces": {
    "catalog": {
      ...
      "oxlint-plugin-react-doctor": "^0.5.8"
    }
  }
  ...
  "devDependencies": {
    ...
    "oxlint-plugin-react-doctor": "catalog:"
  }
  ```

- [ ] **Step 2: Install dependencies**
  Run: `bun install --prefer-offline`
  (If Bun runs out of memory, run `bun install --smol` or bypass using temporary directory install/copy, sharing `node_modules` via directory junction: `cmd /c mklink /j .worktrees/c-oxlint/node_modules node_modules`).

- [ ] **Step 3: Commit**
  Run:
  ```bash
  git add package.json
  git commit -m "chore(lint): install oxlint-plugin-react-doctor"
  ```

---

### Task 2: Configure modular base config files at root

**Files:**
- Modify: `.oxlintrc.json`
- Create: `.oxlintrc.react.json`
- Create: `.oxlintrc.vitest.json`
- Create: `.oxlintrc.node.json`
- Create: `.oxlintrc.jest.json`

**Interfaces:**
- Produces: Global baseline configs.

- [ ] **Step 1: Update root .oxlintrc.json**
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

- [ ] **Step 2: Create root .oxlintrc.react.json**
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

- [ ] **Step 3: Create root .oxlintrc.vitest.json**
  ```json
  {
    "$schema": "./node_modules/oxlint/configuration_schema.json",
    "extends": ["./.oxlintrc.json"],
    "plugins": ["import", "typescript", "unicorn", "oxc", "eslint", "promise", "vitest"]
  }
  ```

- [ ] **Step 4: Create root .oxlintrc.node.json**
  ```json
  {
    "$schema": "./node_modules/oxlint/configuration_schema.json",
    "extends": ["./.oxlintrc.json"],
    "plugins": ["import", "typescript", "unicorn", "oxc", "eslint", "promise", "node"]
  }
  ```

- [ ] **Step 5: Create root .oxlintrc.jest.json**
  ```json
  {
    "$schema": "./node_modules/oxlint/configuration_schema.json",
    "extends": ["./.oxlintrc.json"],
    "plugins": ["import", "typescript", "unicorn", "oxc", "eslint", "promise", "jest"]
  }
  ```

- [ ] **Step 6: Commit**
  Run:
  ```bash
  git add .oxlintrc*.json
  git commit -m "chore(lint): create modular base configuration files at root"
  ```

---

### Task 3: Configure Applications (.oxlintrc.json files)

**Files:**
- Create: `apps/api/.oxlintrc.json`
- Create: `apps/native/.oxlintrc.json`
- Create: `apps/web/.oxlintrc.json`

**Interfaces:**
- Consumes: root base configs
- Produces: Local configuration files for applications extending base configs.

- [ ] **Step 1: Create apps/api/.oxlintrc.json**
  ```json
  {
    "$schema": "../../node_modules/oxlint/configuration_schema.json",
    "extends": ["../../.oxlintrc.node.json", "../../.oxlintrc.vitest.json"]
  }
  ```

- [ ] **Step 2: Create apps/native/.oxlintrc.json**
  ```json
  {
    "$schema": "../../node_modules/oxlint/configuration_schema.json",
    "extends": ["../../.oxlintrc.react.json", "../../.oxlintrc.jest.json"]
  }
  ```

- [ ] **Step 3: Create apps/web/.oxlintrc.json**
  ```json
  {
    "$schema": "../../node_modules/oxlint/configuration_schema.json",
    "extends": ["../../.oxlintrc.react.json", "../../.oxlintrc.vitest.json"],
    "plugins": ["import", "typescript", "unicorn", "oxc", "eslint", "promise", "react", "react-perf", "jsx-a11y", "nextjs", "vitest"]
  }
  ```

- [ ] **Step 4: Commit**
  Run:
  ```bash
  git add apps/api/.oxlintrc.json apps/native/.oxlintrc.json apps/web/.oxlintrc.json
  git commit -m "chore(lint): configure applications using extends"
  ```

---

### Task 4: Configure Packages (.oxlintrc.json files)

**Files:**
- Create: Local `.oxlintrc.json` files for 12 packages under `packages/`

**Interfaces:**
- Consumes: root base configs
- Produces: Clean local package configuration files extending appropriate base configs.

- [ ] **Step 1: Create local .oxlintrc.json for packages using React + Vitest**
  Write configurations for:
  - `packages/core-contracts/.oxlintrc.json`
  - `packages/domain-account/.oxlintrc.json`
  - `packages/domain-audio/.oxlintrc.json`
  - `packages/domain-content/.oxlintrc.json`
  - `packages/domain-live/.oxlintrc.json`
  - `packages/domain-permissions/.oxlintrc.json`
  - `packages/domain-search/.oxlintrc.json`

  Each file contains exactly:
  ```json
  {
    "$schema": "../../node_modules/oxlint/configuration_schema.json",
    "extends": ["../../.oxlintrc.react.json", "../../.oxlintrc.vitest.json"]
  }
  ```

- [ ] **Step 2: Create local .oxlintrc.json for packages using base + Vitest**
  Write configurations for:
  - `packages/core-db/.oxlintrc.json`
  - `packages/core-i18n/.oxlintrc.json`
  - `packages/design-tokens/.oxlintrc.json`
  - `packages/utils-error/.oxlintrc.json`

  Each file contains exactly:
  ```json
  {
    "$schema": "../../node_modules/oxlint/configuration_schema.json",
    "extends": ["../../.oxlintrc.vitest.json"]
  }
  ```

- [ ] **Step 3: Create local .oxlintrc.json for core-api (Node + Vitest)**
  Write configuration for:
  - `packages/core-api/.oxlintrc.json`

  Content:
  ```json
  {
    "$schema": "../../node_modules/oxlint/configuration_schema.json",
    "extends": ["../../.oxlintrc.node.json", "../../.oxlintrc.vitest.json"]
  }
  ```

- [ ] **Step 4: Commit**
  Run:
  ```bash
  git add packages/**/.oxlintrc.json
  git commit -m "chore(lint): configure packages using extends"
  ```

---

### Task 5: Configure lint-staged to auto-apply safe fixes

**Files:**
- Modify: `.lintstagedrc.cjs`

**Interfaces:**
- Produces: Updated git commit hook behavior.

- [ ] **Step 1: Update .lintstagedrc.cjs**
  Modify line 4 in `.lintstagedrc.cjs` to run `oxlint --fix` instead of `oxlint`.
  ```javascript
  "*.{js,jsx,ts,tsx}": ["oxlint --fix", "oxfmt --write"],
  ```

- [ ] **Step 2: Commit**
  Run:
  ```bash
  git add .lintstagedrc.cjs
  git commit -m "chore(lint): configure lint-staged to run oxlint with --fix"
  ```

---

### Task 6: Run Linter and Fix Linting Errors

**Files:**
- Modify: Various source files where new plugins report violations.

**Interfaces:**
- Produces: Clean linter runs and verified compile builds.

- [ ] **Step 1: Run linter**
  Run: `bun run lint`
  Expected: Reports violations.

- [ ] **Step 2: Fix violations**
  Run `bunx oxlint --fix` from root or within folders to auto-fix what's safe.
  Manually resolve the remaining errors.

- [ ] **Step 3: Verify build**
  Run:
  `bun run typecheck`
  `bun run build`
  Expected: All compile and build steps succeed.

- [ ] **Step 4: Commit**
  Run:
  ```bash
  git add .
  git commit -m "fix(lint): resolve new lint errors"
  ```
