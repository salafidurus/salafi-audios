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

## Path aliases

- Use `@/` for package-local imports (maps to `src/*`).

## Build/lint/test commands (root)

- Build: `pnpm --filter env build`
- Lint: `pnpm --filter env lint`
- Typecheck: `pnpm --filter env typecheck`
- Test: `pnpm --filter env test`

## Single-test commands

- Jest file: `pnpm --filter env test -- src/path/to/file.spec.ts`
- Jest by name: `pnpm --filter env test -- src/path/to/file.spec.ts -t "parses env"`
