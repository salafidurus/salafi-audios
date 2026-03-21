# AGENT.md - `@sd/core-config`

## Purpose

`@sd/core-config` owns environment access and integration bootstrap helpers.

- Env parsing helpers belong here.
- Sentry/Vexo integration bootstrap belongs here.
- Do not mix feature logic into this package.

## Structure

- `src/utils/` for env and integration helpers.
- `src/types/` for package-local shared types.

## Entrypoints

- This package has a real platform split, so use `src/index.web.ts` and `src/index.native.ts`.
- Do not add a plain `src/index.ts` unless the public surface becomes fully shared.

## Rules

- Fail fast on real misconfiguration.
- Do not keep generic root proxy files like `env.ts` or `integrations.ts` when they only forward platform code.
- All exports must be explicit.
