# AGENT.md — packages/auth-shared

Shared auth types used across backend + clients.

## Core rules

- No secrets. Ever.
- Types must reinforce the system model:
  - Authentication establishes identity
  - Authorization is backend-only and role/scope-aware
- Keep the package pure and platform-agnostic.

## Dependency rules

- Packages may depend on packages only.
- Must not import from apps.

## Commands

From repo root:

- Lint: `pnpm lint --filter=auth-shared`
- Typecheck: `pnpm typecheck --filter=auth-shared`
- Test: `pnpm test --filter=auth-shared`
