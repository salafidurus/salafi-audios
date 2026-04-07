# @sd/core-config

> Shared app configuration, environment access, and integration bootstrap

## Purpose

Bridges environment variables (from `@sd/core-env`) into runtime configuration and bootstraps third-party integrations like Sentry and Vexo analytics. Keeps integration setup centralized so apps don't duplicate initialization logic.

## Boundaries

- **Depends on:** `@sd/core-env`, `@sentry/react-native`, `vexo-analytics`
- **Consumed by:** `@sd/core-api`, `@sd/feature-navigation`, `apps/web`, `apps/mobile`

## Structure

```
src/
├── utils/              # Env access helpers and integration bootstrap
├── types/              # Package-local shared types
├── index.web.ts        # Web entrypoint
└── index.native.ts     # React Native entrypoint
```

## Key Commands

- `pnpm --filter core-config build` — Build the package
- `pnpm --filter core-config typecheck` — Type check

## Constraints

- This package has a **real platform split**: `index.web.ts` and `index.native.ts` — do not add a plain `index.ts` unless the surface becomes fully shared.
- Fail fast on real misconfiguration; no silent fallbacks.
- No feature logic — only env access and integration bootstrap belong here.
- All exports must be explicit; no generic root proxy files.
