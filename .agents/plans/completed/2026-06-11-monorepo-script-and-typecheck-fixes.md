# Metadata

- **Date**: 2026-06-11
- **Status**: Planned
- **Scope**: Monorepo-wide fixes for package.json scripts, TypeScript configuration, and build errors
- **Summary**: Fix ESM/CommonJS module conflicts, convert verbose node ../../node_modules scripts to standard pnpm exec, and resolve test failures
- **Dependencies**: None

# Progress

- Errors identified from pnpm lint, pnpm typecheck, and pnpm build --continue
- Root cause: verbatimModuleSyntax enabled in base tsconfig but some packages configured as CommonJS without proper ESM support
- The @sd/core-contracts package has tsconfig.build.json set to "module": "commonjs" but source files use ESM syntax
- The @sd/util-ingest package uses NodeNext modules correctly but verbatimModuleSyntax requires type-only imports for types
- The apps/web/package.json uses verbose node ../../node_modules/\*\* patterns that should use pnpm exec instead
- Jest test failures due to clearMocksOnScope issue - likely a Jest/imperative setup mismatch

# Staging Strategy

1. Stage 1: Convert apps/web/package.json scripts from node ../../node_modules/\*\* to pnpm exec standard
2. Stage 2: Fix @sd/core-contracts ESM/CommonJS conflict - change tsconfig.build.json to ESNext module
3. Stage 3: Fix @sd/util-ingest type-only imports for verbatimModuleSyntax compliance
4. Stage 4: Fix @sd/util-ingest typecheck undefined object errors
5. Stage 5: Fix apps/api module interop issues (better-auth ESM imports)
6. Stage 6: Fix apps/livestreams missing telegram/sessions types
7. Stage 7: Fix apps/native typecheck errors (expo-file-system, lucide props, undefined checks)
8. Stage 8: Fix apps/web typecheck errors (react-query import, undefined checks)
9. Stage 9: Fix Jest mock clearing errors across packages
10. Stage 10: Run full validation

# Stage 1: Convert apps/web/package.json scripts to pnpm exec

## Status

Planned

## Goal

Replace verbose node ../../node_modules/eslint/bin/eslint.js . patterns with cleaner pnpm exec eslint . patterns.

## Files

- apps/web/package.json

## Changes

Change lint, test, test:watch, test:cov, test:prepush scripts to use pnpm exec.

## Blockers

None currently identified.

## Dependencies

None

## Completion Criteria

- pnpm --filter web lint passes
- pnpm --filter web typecheck passes (for script validation)

## Suggested Commit Message

refactor(web): use pnpm exec for lint and test scripts

Replace verbose node ../../node_modules paths with cleaner pnpm exec
pattern for better cross-platform compatibility and readability.

# Stage 2: Fix @sd/core-contracts ESM/CommonJS conflict

## Status

Planned

## Goal

Change tsconfig.build.json to use ESNext module instead of CommonJS to match source file ESM syntax and verbatimModuleSyntax.

## Files

- packages/core-contracts/tsconfig.build.json

## Changes

Change module from commonjs to ESNext, moduleResolution from node to Bundler.

## Blockers

None currently identified.

## Dependencies

Stage 1

## Completion Criteria

- pnpm --filter core-contracts build passes
- pnpm --filter core-contracts typecheck passes

## Suggested Commit Message

fix(core-contracts): align tsconfig.build.json with ESM source files

Change module from CommonJS to ESNext to match source files using
ESM syntax under verbatimModuleSyntax. Also update moduleResolution
to Bundler for consistent behavior.

# Stage 3: Fix @sd/util-ingest type-only imports

## Status

Planned

## Goal

Fix all TS1484 errors by adding import type for type-only imports.

## Files

- packages/util-ingest/src/commands/ingest-content.ts
- packages/util-ingest/src/commands/fix-series-collections.ts
- packages/util-ingest/src/commands/remove-content.ts
- packages/util-ingest/src/commands/fix-recommendation-hero.ts
- packages/util-ingest/src/env.ts
- packages/util-ingest/src/schema/content-schema.ts
- packages/util-ingest/src/core/audio-assets.ts
- packages/util-ingest/src/core/run-ingestion.ts
- packages/util-ingest/src/core/run-removal.ts
- packages/util-ingest/src/core/topic-sync.ts
- packages/util-ingest/src/shared/env.bootstrap.ts
- packages/util-ingest/src/storage/r2.ts
- packages/util-ingest/src/core/run-ingestion.spec.ts
- packages/util-ingest/src/core/topic-sync.spec.ts

## Changes

Change all type imports to import type { X } from ... pattern.

## Blockers

None currently identified.

## Dependencies

Stage 1

## Completion Criteria

- pnpm --filter util-ingest typecheck passes

## Suggested Commit Message

fix(util-ingest): add type-only imports for verbatimModuleSyntax

Convert type imports to import type syntax to satisfy
verbatimModuleSyntax strict checking in base tsconfig.

# Stage 4: Fix @sd/util-ingest undefined object errors

## Status

Planned

## Goal

Fix TS2532 errors where objects are possibly undefined.

## Files

- packages/util-ingest/src/commands/fix-series-collections.ts (lines 154, 207)

## Changes

Add proper null/undefined checks or use non-null assertions where appropriate.

## Blockers

None currently identified.

## Dependencies

Stage 3

## Completion Criteria

- pnpm --filter util-ingest typecheck passes

## Suggested Commit Message

fix(util-ingest): handle possibly undefined objects

Add proper null checks for collection and scholar objects to fix
TypeScript strict mode errors.

# Stage 5: Fix apps/api module interop issues

## Status

Planned

## Goal

Resolve ESM/CommonJS interop issues with better-auth imports.

## Files

- apps/api/package.json (add "type": "module")
- apps/api/src/modules/auth/auth.instance.ts
- apps/api/src/modules/auth/auth.guard.ts
- apps/api/src/modules/auth/decorators.ts

## Changes

Add "type": "module" to package.json to enable ESM, or use dynamic imports where needed.

## Blockers

None currently identified.

## Dependencies

Stage 1

## Completion Criteria

- pnpm --filter api build passes

## Suggested Commit Message

fix(api): add type: module for better-auth ESM compatibility

Add "type": "module" to package.json to enable ESM import syntax
for better-auth and its plugins, which are ESM-only packages.

# Stage 6: Fix apps/livestreams telegram session types

## Status

Planned

## Goal

Fix missing telegram/sessions module types.

## Files

- apps/livestreams/package.json (install telegram types)

## Changes

Add @types/telegram as a dev dependency or use correct import path.

## Blockers

None currently identified.

## Dependencies

Stage 1

## Completion Criteria

- pnpm --filter livestreams build passes

## Suggested Commit Message

fix(livestreams): add telegram types for session imports

Add @types/telegram for telegram/sessions type declarations.

# Stage 7: Fix apps/native typecheck errors

## Status

Planned

## Goal

Resolve native app TypeScript errors.

## Files

- apps/native/package.json (add expo-file-system dependency)
- apps/native/src/features/admin-lectures/api/admin-lectures.api.ts
- apps/native/src/features/admin-lectures/components/AudioUploaderSheet/AudioUploaderSheet.tsx
- apps/native/src/features/admin-scholars/screens/admin-scholar-detail/admin-scholar-detail.screen.tsx
- apps/native/src/features/audio/components/mini-player.tsx
- apps/native/src/features/audio/components/playback-controls.tsx
- apps/native/src/features/audio/components/progress-bar.tsx
- apps/native/src/features/audio/engine/expo-audio.adapter.ts
- apps/native/src/features/audio/engine/lock-screen.service.ts
- apps/native/src/features/downloads/store/downloads.store.spec.ts
- apps/native/src/shared/components/DraggableList.tsx
- apps/native/src/shared/components/external-link.tsx

## Changes

1. Add expo-file-system to dependencies
2. Fix item undefined checks with proper guards
3. Fix color prop usage on lucide icons
4. Fix GestureResponderEvent and ViewStyle type-only imports
5. Fix FlashList estimatedItemSize prop

## Blockers

None currently identified.

## Dependencies

Stage 1

## Completion Criteria

- pnpm --filter native typecheck passes

## Suggested Commit Message

fix(native): resolve typecheck errors across codebase

- Add expo-file-system for admin-lectures API
- Add undefined checks for AudioUploaderSheet and scholar detail
- Use type-only imports for React Native types
- Remove invalid color props from lucide icons

# Stage 8: Fix apps/web typecheck errors

## Status

Planned

## Goal

Resolve web app TypeScript errors.

## Files

- apps/web/src/app/(main)/(account)/layout.tsx
- apps/web/src/core/providers.tsx
- apps/web/src/features/admin-lectures/screens/admin-lectures/admin-lectures.screen.spec.tsx
- apps/web/src/features/audio/components/playback-controls.tsx

## Changes

1. Add import type { ReactNode } for type-only import
2. Fix react-query import
3. Fix undefined checks in test file
4. Fix nullable duration in playback-controls

## Blockers

None currently identified.

## Dependencies

Stage 1, Stage 2

## Completion Criteria

- pnpm --filter web typecheck passes

## Suggested Commit Message

fix(web): resolve typecheck errors

- Use type-only imports for ReactNode
- Add proper null checks in test and playback components
- Fix optional duration handling in playback-controls

# Stage 9: Fix Jest mock clearing errors

## Status

Planned

## Goal

Resolve clearMocksOnScope is not a function errors across Jest test suites.

## Files

- Jest configuration in affected packages

## Changes

Investigate and update Jest config to use proper clearMocks setting or update Jest version compatibility.

## Blockers

None currently identified.

## Dependencies

None

## Completion Criteria

- pnpm test passes with no Jest runtime errors

## Suggested Commit Message

fix(jest): resolve clearMocksOnScope runtime error

Update Jest configuration to use compatible mock clearing settings
for Jest 30.x.

# Stage 10: Full validation

## Status

Planned

## Goal

Run all validation commands to ensure complete fix.

## Files

None

## Changes

Run pnpm lint, pnpm typecheck, pnpm test, pnpm build.

## Blockers

All previous stages must pass

## Dependencies

Stages 1-9

## Completion Criteria

- pnpm lint passes
- pnpm typecheck passes
- pnpm test passes
- pnpm build passes

## Suggested Commit Message

chore: finalize monorepo script and typecheck fixes

All validation commands now pass after script modernization and
ESM/CommonJS compatibility fixes.

# Final Verification

- pnpm lint passes across all workspaces
- pnpm typecheck passes across all workspaces
- pnpm test passes with no regressions
- pnpm build succeeds for all packages

# Plan Completion

Mark plan as Completed when all stages pass validation.
