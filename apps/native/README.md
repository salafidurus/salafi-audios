# Native App (`apps/native`)

This workspace is a minimal Expo Router scaffold for the incremental native migration.

It is intentionally not a copy of `apps/mobile`. Add pieces from the mobile app gradually so we
can isolate the configuration or runtime changes that make the current mobile app unstable on the
emulator.

## Run

From repo root:

```bash
bun run dev:native
```

Or scoped directly:

```bash
bun run --filter native dev
```

## Common Commands

- Start: `bun run --filter native start`
- Android: `bun run --filter native android`
- iOS: `bun run --filter native ios`
- Lint: `bun run --filter native lint`
- Typecheck: `bun run --filter native typecheck`
- Test: `bun run --filter native test`
