# AGENT.md - packages/env

This package defines runtime environment schemas and parsers.

## Core rules

- Define shape, requiredness, and validation for env variables.
- Never commit secrets or concrete environment values.
- Fail fast on invalid config; no silent fallback for required values.

## Environment model

- Main runtime targets: development, preview, production.
- Clients get only safe public config.
- Backend owns secret material and sensitive credentials.

## Design constraints

- Keep this package portable across API/web/mobile.
- Avoid app-specific dependencies.
- Prefer explicit schema evolution over permissive parsing.

## Build/lint/test commands (root)

- Build: `pnpm --filter @sd/env build`
- Lint: `pnpm --filter @sd/env lint`
- Typecheck: `pnpm --filter @sd/env typecheck`
- Test: `pnpm --filter @sd/env test`

## Single-test commands

- Jest file: `pnpm --filter @sd/env test -- src/path/to/file.spec.ts`
- Jest by name: `pnpm --filter @sd/env test -- src/path/to/file.spec.ts -t "parses env"`
