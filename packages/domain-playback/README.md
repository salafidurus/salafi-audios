# @sd/domain-playback

> Audio playback state management with platform-specific engines

## Purpose

Manages audio playback state via a Zustand store and exposes a `usePlayback` hook. Platform-specific playback engines handle the actual audio API differences between web (`HTMLAudioElement`) and native (`expo-av` or similar), while the store and hook remain cross-platform.

## Boundaries

- **Depends on:** `@sd/core-contracts`, `zustand`
- **Consumed by:** `@sd/feature-playback`, `apps/web`, `apps/native`

## Structure

```text
src/
├── engine/
│   ├── playback.engine.web.ts      # Web audio engine
│   └── playback.engine.native.ts   # React Native audio engine
├── store/
│   └── playback.store.ts           # Zustand playback state
├── hooks/
│   └── use-playback.ts             # usePlayback hook
├── types/
│   └── index.ts                    # Playback type definitions
└── index.ts                        # Public entrypoint
```

## Key Commands

- `pnpm --filter domain-playback typecheck` — Type check

## Constraints

- Platform-specific code stays in `engine/` files with `.web.ts` / `.native.ts` suffixes.
- Store and hooks must remain platform-agnostic.
- No UI components belong in this package — those live in `@sd/feature-playback`.
