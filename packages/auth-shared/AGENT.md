# AGENT.md - packages/auth-shared

This package contains shared authentication/authorization types.

## Core rules

- Keep package pure and platform-agnostic.
- Never include secrets or environment values.
- Reflect trust model correctly:
  - authentication establishes identity
  - authorization is enforced on backend

## Dependency rules

- Package-to-package dependencies only.
- No imports from apps.

## Build/lint/test commands (root)

- Lint: `pnpm --filter @sd/auth-shared lint`
- Typecheck: `pnpm --filter @sd/auth-shared typecheck`
- Test: `pnpm --filter @sd/auth-shared test`

## Single-test commands

- Jest file: `pnpm --filter @sd/auth-shared test -- src/path/to/file.spec.ts`
- Jest by name: `pnpm --filter @sd/auth-shared test -- src/path/to/file.spec.ts -t "valid role"`

## Quality notes

- Prefer explicit, narrow types over loose unions.
- Keep names stable to avoid cross-app breakage.
