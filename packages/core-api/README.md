# @sd/core-api

> Platform-agnostic API client infrastructure

## Purpose

Owns the HTTP client setup, request interceptors, and client initialization logic that feature packages and apps use to communicate with the backend. Keeps API plumbing in one place so consumers only need to call query hooks.

## Boundaries

- **Depends on:** `@sd/core-contracts`, `@sd/core-config`
- **Consumed by:** `apps/web`, `apps/native`, `feature-*` packages

## Structure

```text
├── types/      # Package-local shared types
└── index.ts    # Single public entrypoint
```

## Key Commands

- `bun run --filter @sd/core-api build` — Build the package
- `bun run --filter @sd/core-api typecheck` — Type check

## Constraints

- **No feature-specific queries or domain behavior** — only generic HTTP plumbing belongs here.
- Single entrypoint (`src/index.ts`) since the API surface is platform-agnostic. Add `.web.ts`/`.native.ts` only if platform-specific behavior is truly needed.
- All exports must be explicit; no intermediate barrels.
- Package dependencies must declare every direct external import.
