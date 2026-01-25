# AGENT.md — packages/api-client

Typed API client shared by mobile and web.

## Contract rules

- API client reflects backend contracts.
- Generated output is derived; do not hand-edit unless explicitly documented.
- Prefer explicit, stable exports; avoid app-specific assumptions.

## Generation workflow

- Backend produces OpenAPI.
- Root tasks:
  - `pnpm openapi`
  - `pnpm codegen` (openapi + codegen)
- If types are wrong, fix the API/OpenAPI source and regenerate.

## Dependency rules

- Packages must not import from apps.
- Keep runtime dependencies minimal and platform-agnostic.

## Commands

From repo root:

- Lint: `pnpm lint --filter=api-client`
- Typecheck: `pnpm typecheck --filter=api-client`
- Test: `pnpm test --filter=api-client` (if defined)
- Regenerate: `pnpm codegen`
