# @sd/util-config

> Shared ESLint and TypeScript base configurations for the monorepo

## Purpose

Provides the canonical lint rules and TypeScript compiler options consumed by every app and
package in the monorepo. Centralising these configs here ensures consistent coding
standards, prevents config drift, and means a rule change propagates everywhere in one
commit.

## Boundaries

- **Depends on:** none (leaf package — no workspace dependencies)
- **Consumed by:** all `apps/*` and `packages/*`

Do not add project-specific logic here. This package must stay generic. Changes here affect
the entire repository — validate impact globally before merging.

## Entrypoints

```text
eslint/
├── base.js     # Base TypeScript/JS rules (used by all packages)
├── next.js     # Next.js additions (apps/web)
├── nest.js     # NestJS additions (apps/api)
└── expo.js     # Expo additions (apps/mobile)

tsconfig/
├── base.json      # Root compiler options (strict, ES2022, noEmit)
├── app.json       # Generic app tsconfig base
├── nest.json      # NestJS-specific compiler options
├── next.json      # Next.js-specific compiler options
├── expo.json      # Expo/React Native compiler options
└── packages.json  # Shared library tsconfig base (no emit by default)
```

Each consumer imports the relevant preset and extends or overrides as needed for its
own paths and entrypoints.

## Key Commands

- `pnpm --filter util-config lint` — Lint this package itself
- `pnpm --filter util-config typecheck` — Type check

## Known Constraints

- **No build step.** ESLint configs are plain `.js` files consumed directly; tsconfigs are
  `.json` files referenced via `extends`. Neither requires compilation.
- **ESM only.** The package is `"type": "module"` — all ESLint configs use ESM syntax.
  Consumers that need CJS must wrap or alias.
- **Turbo re-runs lint/typecheck when these files change.** The `turbo.json` pipeline
  includes `packages/util-config/eslint/**` and `packages/util-config/tsconfig/**` as
  inputs for `lint` and `typecheck` tasks respectively, so a rule or config change
  correctly invalidates the cache for every workspace.

## Related Docs

- `docs/architecture.md` — monorepo layout and dependency rules
- `docs/dev-ops.md` — CI/CD and environment configuration
