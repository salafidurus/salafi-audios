# AGENT.md — packages/env

Shared environment/config schema utilities.

## Core rules

- Schemas define required variables, types, formats.
- **Values are never shared** here (no secrets, no env values committed).
- Misconfiguration must fail fast (startup/build failure), never silently fallback.

## Environment model

- Environments: development / preview / production
- Clients only receive non-sensitive public config (API base URLs, environment id, safe flags).
- Backend owns all secrets (DB creds, auth secrets, media creds, analytics creds).

## Dependency rules

- Packages must not import from apps.
- Keep runtime portable across API/web/mobile needs (schema-only where possible).

## Commands

From repo root:

- Lint: `pnpm lint --filter=env`
- Typecheck: `pnpm typecheck --filter=env`
- Test: `pnpm test --filter=env`
