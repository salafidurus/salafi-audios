# Mobile App (`apps/mobile`)

This Expo/React Native app is the offline-first listening client.

- Reliable playback and continuity
- Offline intent queueing + sync
- Backend-authoritative reconciliation after reconnect

## Run

From monorepo root:

```bash
pnpm dev:mobile
```

Or scoped directly:

```bash
pnpm --filter mobile dev
```

## Common Commands

Run from repo root:

- Start: `pnpm --filter mobile start`
- Android: `pnpm --filter mobile android`
- iOS: `pnpm --filter mobile ios`
- Lint: `pnpm --filter mobile lint`
- Typecheck: `pnpm --filter mobile typecheck`
- Test: `pnpm --filter mobile test`

Targeted tests:

- One file: `pnpm --filter mobile test -- src/path/to/file.test.tsx`
- By name: `pnpm --filter mobile test -- -t "renders heading"`

## Guardrails

- Offline mode queues intent; it does not authoritatively mutate protected state.
- Never bypass backend authorization or conflict resolution.
- No offline admin/editor authority.
- Treat downloaded media as continuity cache, not ownership.

See `apps/mobile/AGENT.md` and `docs/implementation-guide/07-mobile-application-structure.md` for implementation constraints.
