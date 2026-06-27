# @sd/domain-live

> Data hooks for live sessions and channels

## Purpose

Owns the React Query hooks that fetch and expose live-streaming data — active sessions,
scheduled sessions, ended sessions, and channel listings — to consuming apps. Introduced
during the monorepo restructure to give live content its own domain boundary, separate
from the general content catalogue.

## Boundaries

- **Depends on:** `@sd/core-contracts`
- **Consumed by:** `apps/web`, `apps/native`

This package provides **data hooks only** — no UI components, no Zustand stores, and no
live-stream infrastructure. Session lifecycle transitions (starting, ending) are enforced
exclusively in `apps/api`.

## Entrypoints

```text
src/
├── live.api.ts            # useLiveActive, useLiveScheduled, useLiveEnded — raw API hooks
├── use-live-section.ts    # useLiveSection — composes active/scheduled into a section view
├── use-active-session.ts  # useActiveSession — single active session detail
├── use-live-active.ts     # useLiveActiveDelta — delta/polling hook for live status changes
├── use-live-channels.ts   # useLiveChannels, useLiveChannelBySlug
├── use-live-ended.ts      # useLiveEndedScreen
├── use-live-scheduled.ts  # useLiveScheduledScreen
├── use-live-sessions.ts   # useLiveSessions — combined session list
└── index.ts               # Single public entrypoint
```

## Key Commands

- `bun run --filter @sd/domain-live typecheck` — Type check
- `bun run --filter @sd/domain-live test` — Run tests

## Known Constraints

- **No build step.** This package exports directly from `src/` (TypeScript source). Apps
  consume it via workspace resolution; no `dist/` is produced.
- **Live state is eventually consistent.** The `useLiveActiveDelta` hook polls for status
  changes rather than using a WebSocket connection; polling interval is controlled by the
  caller.
- **Package was created during monorepo restructure.** Live content was extracted from the
  general content domain to allow independent evolution of live-streaming features without
  coupling to the recorded content catalogue.
- **Session authority is backend-only.** The client never transitions session state
  directly. All state changes go through `apps/api` endpoints.

## Related Docs

- `docs/api.md` — live session API endpoints and response shapes
- `docs/architecture.md` — monorepo package boundaries
