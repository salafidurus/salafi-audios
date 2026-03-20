# Monorepo Restructuring Plan: Feature-Sliced Architecture

## Background & Motivation
Currently, the codebase maintains separate `features`, `core`, and `shared` directories across `apps/web`, `apps/mobile`, and `packages/ui-mobile`. This separation leads to duplicated logic, fragmented domain concepts, and makes it difficult to implement and review cross-platform features simultaneously. 

Additionally, we need more granular platform targeting for the web. Code currently in `apps/web` is specifically for Desktop Web (`.desktop.web.tsx`), while web code in `packages/ui-mobile` is specifically for Mobile Web (`.mobile.web.tsx`). 

The goal is to adopt a feature-sliced architectural pattern utilizing both standard and custom platform-specific extensions (`.ios.tsx`, `.android.tsx`, `.native.tsx`, `.mobile.web.tsx`, `.desktop.web.tsx`, `.web.tsx`, `.tsx`). This colocation will allow all code for a specific feature or shared module to live in one unified folder, dramatically improving developer experience and code reuse.

## Scope & Impact
This restructuring is a major architectural shift that will touch almost all UI and domain logic within the repository. 
- **Impacted Areas**: `apps/web`, `apps/mobile`, `packages/ui-mobile`, and documentation.
- **New Structure**: 
  - `packages/shared` (`@sd/shared`): Reusable UI primitives, generic hooks, and utils.
  - `packages/core-*` (`@sd/core-auth`, `@sd/core-api`, etc.): Foundational infrastructure setup and utilities.
  - `packages/feature-*` (`@sd/feature-auth`, `@sd/feature-scholars`, etc.): Domain-specific "smart" feature packages encompassing both UI and platform-specific data fetching.
- **Remaining in `apps/`**: Only `app/` (routing, layouts), environment orchestration, and platform-specific entry points.

## Proposed Solution
Instead of a massive monolithic package, we will migrate to a **Feature-Sliced Package** architecture, distributing the contents of `packages/ui-mobile`, `apps/web`, and `apps/mobile` into granular packages.

1. **`@sd/shared`**: Absorbs `shared` logic from `packages/ui-mobile`, `apps/web`, and `apps/mobile`.
2. **`@sd/core-*`**: Absorbs `core` logic from `packages/ui-mobile`, `apps/web`, and `apps/mobile`. Separated by domain concerns (e.g., `core-auth`).
3. **`@sd/feature-*`**: Absorbs `features` logic from `packages/ui-mobile`, `apps/web`, and `apps/mobile`. Features are "smart", handling their own data fetching using platform-specific files.
4. **Custom Bundler Configuration**: Bundlers natively only understand standard extensions (`.ios`, `.android`, `.native`, `.web`). We will configure Next.js and Expo Metro to resolve our new custom extensions (`.desktop.web.tsx` and `.mobile.web.tsx`) correctly.

## Bundler Configuration Strategy
To support `.desktop.web.tsx` and `.mobile.web.tsx`:
- **Next.js (`apps/web`)**: 
  - Update `next.config.ts` (both `webpack.resolve.extensions` and `turbopack.resolveExtensions`) to prioritize extensions in this order: `['.desktop.web.tsx', '.desktop.web.ts', '.web.tsx', '.web.ts', '.tsx', '.ts', ...]`.
- **Expo / Metro (`apps/mobile`)**: 
  - Update `metro.config.cjs` to intercept platform resolution. When building for the `web` platform, Metro will be configured via `config.resolver.sourceExts` to prioritize `.mobile.web.tsx` and `.mobile.web.ts` before standard `.web.tsx` and `.tsx` files. 
  - Native builds will continue to use `.ios.tsx`, `.android.tsx`, and `.native.tsx` as provided by Metro natively.

## Implementation Plan

### Phase 1: Tooling and Infrastructure Setup
1. Create `packages/shared` and establish a template for `packages/feature-*` and `packages/core-*`.
2. **Next.js**: Update `apps/web/next.config.ts` to add `.desktop.web.tsx` and `.desktop.web.ts` to the front of the extensions array for both Webpack and Turbopack. Add transpile rules for the new `@sd/` packages.
3. **Metro**: Update `apps/mobile/metro.config.cjs` to add `.mobile.web` extensions to `sourceExts` dynamically when the target platform is web.

### Phase 2: Migrate Shared Primitives (`@sd/shared`)
1. Extract `packages/ui-mobile/src/shared`, `apps/web/src/shared`, and `apps/mobile/src/shared`.
2. Move them into `packages/shared`.
3. Rename web-specific files from `apps/web` to `.desktop.web.tsx`.
4. Rename web-specific files from `packages/ui-mobile` to `.mobile.web.tsx`.
5. Update imports across the codebase to use `@sd/shared`.

### Phase 3: Migrate Core Infrastructure (`@sd/core-*`)
1. Extract `core/` logic from `packages/ui-mobile`, `apps/web`, and `apps/mobile`.
2. Place them into standalone `@sd/core-*` packages (e.g., `@sd/core-api`, `@sd/core-auth`).
3. Apply `.desktop.web`, `.mobile.web`, `.native`, `.ios`, and `.android` extensions where logic diverges.

### Phase 4: Migrate Domain Features (`@sd/feature-*`)
1. Incrementally create `@sd/feature-<name>` packages (e.g., `@sd/feature-scholars`).
2. Move web and mobile feature components, hooks, and stores from `packages/ui-mobile`, `apps/web`, and `apps/mobile` into the respective feature package.
3. Use `.desktop.web.tsx` for Next.js data fetching/UI, `.mobile.web.tsx` for Expo Web data fetching/UI, and `.native.tsx` (or `.ios`/`.android`) for Expo Native.
4. Export feature entry points from `index.ts`.

### Phase 5: Cleanup & Update Applications
1. Refactor `apps/web/src/app` and `apps/mobile/src/app` to compose screens directly from `@sd/feature-*` packages.
2. Delete the legacy `packages/ui-mobile` package.
3. Clean up legacy `src/features`, `src/shared`, and `src/core` folders in both apps.

### Phase 6: Documentation Update
1. Update `docs/implementation-guide/01-monorepo-structure.md` to reflect the feature-sliced architecture.
2. Update `docs/implementation-guide/07-mobile-application-structure.md`.
3. Update `docs/implementation-guide/09-web-application-structure.md`.
4. Document the new custom platform extension convention (`.desktop.web.tsx` and `.mobile.web.tsx`) and bundler configurations.

## Verification & Testing
- Ensure Next.js builds successfully (`pnpm build` in `apps/web`) and correctly resolves `.desktop.web.tsx`.
- Ensure Expo builds successfully for Web (`pnpm expo export -p web`) and correctly resolves `.mobile.web.tsx`.
- Ensure Expo builds successfully for Native (`pnpm start` / iOS / Android) and correctly resolves `.native.tsx`, `.ios.tsx`, `.android.tsx`.
- Ensure TypeScript type checking passes across the workspace (`pnpm type-check`). Types should primarily be inferred from the base `.ts` / `.tsx` files.

## Migration & Rollback Strategy
- The migration will be executed incrementally (Tooling -> Shared -> Core -> Features). 
- If a phase introduces critical regressions, it will be reverted using Git before proceeding to the next phase.
- The old folders will be kept alongside the new packages temporarily, migrating one domain at a time to minimize blast radius.
