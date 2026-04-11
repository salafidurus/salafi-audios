# Native App (`apps/native`)

This workspace is a minimal Expo Router scaffold for the incremental native migration.

It is intentionally not a copy of `apps/mobile`. Add pieces from the mobile app gradually so we
can isolate the configuration or runtime changes that make the current mobile app unstable on the
emulator.

## Run

From repo root:

```bash
pnpm dev:native
```

Or scoped directly:

```bash
pnpm --filter native dev
```

## Common Commands

- Start: `pnpm --filter native start`
- Android: `pnpm --filter native android`
- iOS: `pnpm --filter native ios`
- Lint: `pnpm --filter native lint`
- Typecheck: `pnpm --filter native typecheck`
- Test: `pnpm --filter native test`
