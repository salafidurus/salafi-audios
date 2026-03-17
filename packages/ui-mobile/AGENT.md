# AGENT.md - packages/ui-mobile

This package contains shared mobile-first UI primitives/components consumed by apps.

## Core rules

- Keep this package UI-only and platform-agnostic where possible.
- Use platform splits when needed (`*.native.tsx`, `*.web.tsx`) instead of app-specific branching.
- Do not import from apps (`apps/*`).
- Keep feature UI presentational; backend/business authority remains in `apps/api`.

## Dependencies

- Consume shared contracts and tokens from workspace packages (`@sd/contracts`, `@sd/design-tokens`).
- Do not use TS path aliases to point directly into sibling package source trees for those dependencies.

## Commands (run from repo root)

- Typecheck: `pnpm --filter ui-mobile typecheck`
