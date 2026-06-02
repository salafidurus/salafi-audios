# AGENT.md - packages/util-ingest

This package owns deterministic content ingestion workflows.

## Responsibilities

- Validate structured content definitions before writes.
- Upsert canonical domain entities for Phase 02 data setup.
- Keep ingestion idempotent and environment-aware.
- Upload media assets via infrastructure adapters, then persist references only.

## Guardrails

- Do not put business authority in ingestion scripts; backend remains authoritative.
- Do not write media blobs to relational tables.
- Prefer explicit, reproducible batch tagging for operational safety.
- Fail clearly on invalid input or missing required environment variables.

## Path aliases

- Use `@/` for package-local imports (maps to `src/*`).

## Commands

- Run ingestion: `pnpm --filter util-ingest ingest:content`
- Lint: `pnpm --filter util-ingest lint`
- Typecheck: `pnpm --filter util-ingest typecheck`
- Test: `pnpm --filter util-ingest test`
