# TDD — Strict Test-Driven Development

No exceptions. Every code change follows this exact sequence.

## Workflow

1. **Write a failing test** that sufficiently covers the desired behavior.
   - Describe behavior, not implementation.
   - Cover edge cases, error paths, and success paths.
2. **Confirm the test fails for the right reasons.**
   - Verify the failure is due to missing/incorrect implementation, not a test setup error.
3. **Write minimal code** to make the test pass.
   - Do not over-engineer. Do not add features the test doesn't call for.
4. **Verify the test passes.**
   - Run the specific test and confirm green.
5. **Run all tests in the codebase** — confirm no regressions.
   - Use `bun run test` (or scoped: `bun run --filter <workspace> test`).
6. **Proceed to the next task.**
   - Commit test and implementation together before moving on.

## What to Test

Test everything: screens, components, hooks, utils, stores, services, guards.

Exceptions (skip these):

- Framework DI wiring (NestJS modules, Expo Router)
- Third-party library internals
- Generated artifacts
- Presentational-only components with zero logic

## Co-location

Test files sit next to their source:

```
SomeComponent.tsx      → SomeComponent.spec.tsx
use-some-hook.ts       → use-some-hook.spec.ts
some.screen.tsx        → some.screen.spec.tsx
some.service.ts        → some.service.spec.ts
```

## Test Runners by Workspace

| Workspace               | Runner                |
| ----------------------- | --------------------- |
| API (`apps/api`)        | `bun:test`            |
| Web (`apps/web`)        | `bun:test` (isolated) |
| Native (`apps/native`)  | `jest`                |
| DB (`packages/core-db`) | `bun:test`            |
| E2E (`apps/web`)        | `playwright`          |

## Commit

- Always commit test and implementation together in a single commit.
- Use Conventional Commits format.
