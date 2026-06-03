# Design: `apps/livestreams` package.json script parity with `apps/api`

**Date:** 2026-06-03  
**Branch:** f/livestreams  
**Scope:** `apps/livestreams/package.json`, new `eslint.config.mjs`, `.github/workflows/ci.yml`

---

## Problem

`apps/livestreams` was deployed mirroring `apps/api` but its `package.json` scripts were not fully aligned. As a result:

- `turbo lint` silently skips livestreams (no `lint` script, no `eslint.config.mjs`)
- `typecheck` uses `tsc --noEmit` instead of `tsc -p tsconfig.json --noEmit`
- A `pretypecheck` hook exists that api doesn't have and turbo's dep graph already handles
- `start` maps to the compiled entrypoint (`node dist/main.js`) rather than the NestJS CLI convention (`nest start`)
- `start:prod`, `start:dev`, `start:debug`, `format`, `test:cov`, `test:debug` are all absent
- CI `build_deps` artifact upload omits `apps/livestreams/dist/**`

`test:e2e` is intentionally excluded — there is no `test/` directory or e2e infrastructure in livestreams yet.

---

## Changes

### 1. `apps/livestreams/package.json` — scripts

| Script         | Action | Value                                                                                                               |
| -------------- | ------ | ------------------------------------------------------------------------------------------------------------------- |
| `format`       | Add    | `prettier --write "src/**/*.ts" "test/**/*.ts"`                                                                     |
| `start`        | Change | `nest start` (was `node dist/main.js`)                                                                              |
| `start:dev`    | Add    | `nest start --watch`                                                                                                |
| `start:debug`  | Add    | `nest start --debug --watch`                                                                                        |
| `start:prod`   | Add    | `node dist/main`                                                                                                    |
| `lint`         | Add    | `node ../../node_modules/eslint/bin/eslint.js .`                                                                    |
| `lint:fix`     | Add    | `node ../../node_modules/eslint/bin/eslint.js . --fix`                                                              |
| `typecheck`    | Fix    | `tsc -p tsconfig.json --noEmit` (was `tsc --noEmit`)                                                                |
| `pretypecheck` | Remove | Redundant — turbo dep graph handles `@sd/core-db` build                                                             |
| `test:cov`     | Add    | `node ../../node_modules/jest/bin/jest.js --coverage`                                                               |
| `test:debug`   | Add    | `node --inspect-brk -r tsconfig-paths/register -r ts-node/register ../../node_modules/jest/bin/jest.js --runInBand` |

### 2. `apps/livestreams/package.json` — devDependencies

Add the following (versions to match `apps/api`):

**Lint:**

- `@eslint/eslintrc`
- `@eslint/js`
- `eslint`
- `eslint-config-prettier`
- `eslint-plugin-prettier`
- `globals`
- `typescript-eslint`

**test:debug:**

- `ts-node`
- `tsconfig-paths`
- `source-map-support`

**format:**

- `prettier`

**NestJS CLI peer (explicit dep, mirrors api):**

- `@nestjs/schematics`

### 3. New file: `apps/livestreams/eslint.config.mjs`

```js
import nestConfig from "@sd/util-config/eslint/nest";
export default nestConfig;
```

### 4. `.github/workflows/ci.yml` — `build_deps` artifact upload

Add `apps/livestreams/dist/**` to the artifact path list alongside `apps/api/dist/**`.

---

## Notes

- `@nestjs/schematics` is added explicitly to `apps/livestreams` devDependencies to keep each app self-contained, even though `.npmrc` sets `node-linker=hoisted` and it would be available via hoisting from `apps/api`. Explicit deps are more robust.

---

## Out of scope

- `test:e2e` — deferred until a `test/` directory and `jest-e2e.json` exist in livestreams
- `openapi` / `openapi:json` — api-specific (NestJS Swagger), not applicable to livestreams
