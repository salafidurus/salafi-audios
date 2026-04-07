# TypeScript and tsconfig Modernization Plan

## Goal

Create a controlled plan to:

- unify the TypeScript version used across the monorepo
- normalize `tsconfig*.json` inheritance and intent
- reduce VS Code-only diagnostics caused by config drift
- separate editor/typecheck settings from build/runtime settings
- preserve app-specific requirements for Next.js, Expo, NestJS, and package builds

## Why This Plan Is Needed

The repo already shows several consistency problems:

- TypeScript versions are drifted across workspaces:
  - root: `^5.9.0`
  - many packages: `^5.9.2`
  - `apps/mobile`: `~5.9.2`
  - `apps/web`: `^5`
  - `apps/api`: `^5.7.3`
- config inheritance is split across multiple bases:
  - root [`tsconfig.base.json`](C:/dev/salafi-audios/tsconfig.base.json)
  - [`packages/util-config/tsconfig/base.json`](C:/dev/salafi-audios/packages/util-config/tsconfig/base.json)
  - [`packages/util-config/tsconfig/packages.json`](C:/dev/salafi-audios/packages/util-config/tsconfig/packages.json)
  - [`packages/util-config/tsconfig/next.json`](C:/dev/salafi-audios/packages/util-config/tsconfig/next.json)
  - [`packages/util-config/tsconfig/expo.json`](C:/dev/salafi-audios/packages/util-config/tsconfig/expo.json)
- module resolution is inconsistent across workspaces:
  - many shared packages use `bundler`
  - some newer packages use `node`
  - `core-env` uses `NodeNext`
  - API uses classic Nest/CommonJS-oriented settings
- some packages use a single `tsconfig.json` for both editor and build-like concerns, while others split `tsconfig.json` and `tsconfig.build.json`
- API and contracts already exposed a real failure mode where runtime module resolution and TypeScript/editor resolution diverged

## Desired End State

### Versioning

- one repo-standard TypeScript version
- app and package manifests stop pinning conflicting minor ranges unless there is a documented exception
- VS Code uses the workspace TypeScript version consistently

### Config Architecture

- one canonical base for common strictness and language defaults
- one package-layer base for shared library packages
- one app-layer base per runtime family:
  - Next.js
  - Expo/mobile
  - NestJS/API
  - Node utility packages
- one build config pattern for emitted packages
- no silent duplication of the same compiler flags across dozens of package configs

### Resolution Model

- each workspace family uses one explicit module-resolution strategy
- runtime-facing builds use settings compatible with their real runtime
- editor-only configs do not accidentally imply runtime behavior

## Non-Goals

- do not upgrade frameworks as part of this change unless the TypeScript target version forces it
- do not rewrite package boundaries or import architecture as part of this change
- do not convert all packages to project references in the first pass unless audit proves that is necessary

## Current Repo Hotspots To Audit

### TypeScript Version Drift

Audit every `package.json` that declares `typescript`, especially:

- [`package.json`](C:/dev/salafi-audios/package.json)
- [`apps/api/package.json`](C:/dev/salafi-audios/apps/api/package.json)
- [`apps/web/package.json`](C:/dev/salafi-audios/apps/web/package.json)
- [`apps/mobile/package.json`](C:/dev/salafi-audios/apps/mobile/package.json)
- all `packages/*/package.json`

### Base Config Drift

Compare and consolidate:

- [`tsconfig.base.json`](C:/dev/salafi-audios/tsconfig.base.json)
- [`packages/util-config/tsconfig/base.json`](C:/dev/salafi-audios/packages/util-config/tsconfig/base.json)
- [`packages/util-config/tsconfig/packages.json`](C:/dev/salafi-audios/packages/util-config/tsconfig/packages.json)
- [`packages/util-config/tsconfig/app.json`](C:/dev/salafi-audios/packages/util-config/tsconfig/app.json)
- [`packages/util-config/tsconfig/next.json`](C:/dev/salafi-audios/packages/util-config/tsconfig/next.json)
- [`packages/util-config/tsconfig/expo.json`](C:/dev/salafi-audios/packages/util-config/tsconfig/expo.json)

### Known Inconsistent Workspace Configs

Review these first because they already differ materially:

- [`apps/api/tsconfig.json`](C:/dev/salafi-audios/apps/api/tsconfig.json)
- [`apps/api/tsconfig.build.json`](C:/dev/salafi-audios/apps/api/tsconfig.build.json)
- [`apps/web/tsconfig.json`](C:/dev/salafi-audios/apps/web/tsconfig.json)
- [`apps/mobile/tsconfig.json`](C:/dev/salafi-audios/apps/mobile/tsconfig.json)
- [`packages/core-contracts/tsconfig.json`](C:/dev/salafi-audios/packages/core-contracts/tsconfig.json)
- [`packages/core-contracts/tsconfig.build.json`](C:/dev/salafi-audios/packages/core-contracts/tsconfig.build.json)
- [`packages/core-env/tsconfig.json`](C:/dev/salafi-audios/packages/core-env/tsconfig.json)
- [`packages/domain-search/tsconfig.json`](C:/dev/salafi-audios/packages/domain-search/tsconfig.json)
- [`packages/feature-progress/tsconfig.json`](C:/dev/salafi-audios/packages/feature-progress/tsconfig.json)
- [`packages/feature-playback/tsconfig.json`](C:/dev/salafi-audios/packages/feature-playback/tsconfig.json)
- [`packages/feature-downloads/tsconfig.json`](C:/dev/salafi-audios/packages/feature-downloads/tsconfig.json)

## Migration Strategy

## Phase 1: Inventory and Policy Definition

### Output

- a short matrix of every workspace with:
  - runtime family
  - emits JS or not
  - current `extends`
  - current `module`
  - current `moduleResolution`
  - current JSX mode
  - current path alias usage
  - current TypeScript version source

### Decisions To Make

- choose the target TypeScript version
  - if moving to a later major version, verify compatibility for:
    - Next.js
    - Expo
    - React Native toolchain
    - NestJS CLI/build
    - Prisma
    - ts-jest
    - ts-node
- decide whether the repo will use:
  - one root `typescript` only, or
  - root plus tightly aligned workspace declarations
- define the supported module-resolution policies:
  - `Bundler` for frontend/shared source-consumed packages
  - `NodeNext` or `node` only where runtime/build truly requires it
  - explicit exception list, not ad hoc overrides

## Phase 2: Establish Canonical Base Configs

Create or normalize these config roles:

### 1. `base.json`

Own only repo-wide language defaults and strictness, for example:

- `target`
- `lib`
- `strict`
- `skipLibCheck`
- `resolveJsonModule`
- `forceConsistentCasingInFileNames`

### 2. `packages.json`

Own defaults for source-consumed shared packages:

- `module`
- `moduleResolution`
- common `moduleSuffixes`
- `noEmit: true`

### 3. `packages-build.json`

Own emitted-package defaults:

- `noEmit: false`
- declaration settings
- `rootDir`
- `outDir`
- runtime-compatible module settings where needed

### 4. `next.json`

Own only Next-specific behavior:

- JSX mode
- any Next-required settings
- web-specific `moduleSuffixes`

### 5. `expo.json`

Own only Expo/mobile-specific behavior:

- Expo base extension
- mobile path aliases
- native-first `moduleSuffixes`

### 6. `nest.json` or `node-service.json`

Add a dedicated base for API/backend services so `apps/api` stops hand-carrying a large list of compiler flags.

## Phase 3: Normalize TypeScript Versioning

### Actions

- choose one version and update:
  - root `package.json`
  - all workspace `package.json` files that currently declare `typescript`
- reduce loose declarations like `^5` in web
- eliminate older outliers like `apps/api` on `^5.7.3`
- document exceptions if Expo or another toolchain requires a narrower range

### Recommendation

Prefer one root-owned TypeScript version unless a package truly runs its own isolated compiler in CI. Multiple workspace-level `typescript` declarations are likely creating editor ambiguity without much value.

## Phase 4: Separate Editor Config From Build Config

### Principle

For any package that emits JS, `tsconfig.json` should represent editor/typecheck intent and `tsconfig.build.json` should represent emit/runtime intent.

### Normalize

- packages that emit should all have `tsconfig.build.json`
- packages that do not emit should not carry build-only compiler flags
- avoid mixing `moduleResolution: bundler` editor behavior with Node/CommonJS runtime emission in the same file

### Immediate Focus

- `core-contracts`
- `core-env`
- `core-db`
- `util-ingest`
- API app build config

## Phase 5: Standardize Module Resolution by Workspace Family

### Frontend apps and source-consumed UI packages

Use a consistent `Bundler` model where packages are consumed as source by Next/Expo.

### Backend app and Node-oriented utilities

Use a runtime-compatible Node model for emitted JS and runtime validation.

### Rule

A workspace should not use `bundler` in editor config and then rely on undocumented runtime assumptions in emitted JS. Any divergence must be explicit through a separate build config.

## Phase 6: Audit Path Alias Policy

### Problems To Prevent

- `paths` without matching `baseUrl` semantics
- aliases working in editor but failing in build/runtime
- local `@/*` aliases differing across apps and packages without clear ownership

### Plan

- define where `@/*` is allowed
- define whether packages may use package-local aliases or must stay relative
- ensure emitted packages do not leak unresolved aliases

## Phase 7: Fix VS Code Alignment

### Required Checks

- add a workspace setting if needed so VS Code uses repo TypeScript
- confirm there is no local/global TypeScript mismatch in the editor
- verify that each workspace opens with the correct nearest `tsconfig.json`
- validate IntelliSense and `tsserver` behavior in:
  - `apps/api`
  - `apps/web`
  - `apps/mobile`
  - one shared package
  - one domain package

### Deliverable

Create a short troubleshooting note for contributors:

```text
1. Use workspace TypeScript.
2. Restart TS server after dependency/config changes.
3. Open the repo root, not a nested package, when possible.
4. Rebuild emitted packages if runtime/export issues appear.
```

## Phase 8: Verification Matrix

Run these after each config family change:

### Typecheck

- `pnpm typecheck`
- `pnpm --filter api typecheck`
- `pnpm --filter web typecheck`
- `pnpm --filter mobile typecheck`

### Build

- `pnpm --filter core-contracts build`
- `pnpm --filter core-env build`
- `pnpm --filter core-db build`
- `pnpm --filter web build`
- `pnpm --filter api build`

### Tests

- `pnpm --filter api test`
- any package-level tests impacted by module-resolution or emitted output

### Runtime Spot Checks

- API watch mode boots without module-format errors
- web dev/build does not regress on source-consumed packages
- mobile typecheck still resolves native/web suffixes correctly

## Recommended Execution Order

1. Inventory current versions and config roles.
2. Pick target TypeScript version.
3. Consolidate shared base configs in `packages/util-config/tsconfig/`.
4. Normalize package editor configs.
5. Normalize package build configs.
6. Normalize app configs.
7. Update workspace TypeScript version declarations.
8. Run full verification matrix.
9. Fix residual workspace-specific exceptions.
10. Document final TypeScript policy in `AGENT.md` or `docs/dev-ops.md`.

## Risks

- Next.js, Expo, and NestJS do not tolerate the same module-resolution defaults
- VS Code may report different errors than CI if workspace TypeScript is not enforced
- changing `moduleResolution` can silently alter import resolution order
- emitted packages can break Node runtime even when typecheck passes
- source-consumed packages can break web/mobile builds even when package-local typecheck passes

## Success Criteria

- one documented TypeScript version policy
- one clear `tsconfig` inheritance model
- no unexplained per-package compiler drift
- VS Code diagnostics match CLI typecheck much more closely
- API/runtime builds do not load raw TypeScript unintentionally
- web/mobile package resolution remains stable after normalization

## Suggested File Name

Keep this plan as:

- [`.agents/plans/2026-04-07-typescript-config-modernization-plan.md`](C:/dev/salafi-audios/.agents/plans/2026-04-07-typescript-config-modernization-plan.md)
