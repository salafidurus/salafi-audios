# AGENT.md - apps/native (Incremental Native Scaffold)

This workspace exists to migrate from `apps/mobile` in small, verifiable steps.

## Rules

- Keep `apps/mobile` working while building `apps/native`.
- Do not bulk-copy the whole mobile app into this workspace.
- Move or recreate pieces incrementally so each step can be tested on the emulator.
- Prefer the smallest possible change that advances the migration.

## Commands

- Dev: `pnpm dev:native`
- Start: `pnpm --filter native start`
- Android: `pnpm --filter native android`
- iOS: `pnpm --filter native ios`
- Lint: `pnpm --filter native lint`
- Typecheck: `pnpm --filter native typecheck`
- Test: `pnpm --filter native test`
