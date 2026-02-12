# AGENT.md - packages/api-client

This package provides generated, typed API client code for web/mobile.

## Core rules

- Treat generated client output as derived artifacts.
- Do not hand-edit `generated/` output.
- Fix source contracts in API/OpenAPI, then regenerate.

## Generation workflow (root)

- Generate OpenAPI from API: `pnpm openapi`
- Generate client: `pnpm codegen`
- Combined flow: `pnpm contract`

## Commands (root)

- Codegen: `pnpm --filter @sd/api-client codegen`
- Lint: `pnpm --filter @sd/api-client lint`
- Test/typecheck scripts are intentionally skipped in this workspace.

## Integration notes

- Keep exports stable and app-agnostic.
- Avoid introducing assumptions tied to one consumer app.
- Regenerate whenever API contracts change.
