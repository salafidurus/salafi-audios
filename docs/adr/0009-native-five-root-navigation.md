# ADR 0009: Native five-root navigation

## Status

Accepted

## Context

The native client had persistent Explore, My Library, Settings, and Admin tabs,
with additional subsection routes rendered as part of the navigation shell.
That model diverged from the web information architecture and made obsolete
native paths appear to be supported.

## Decision

Native exposes exactly five persistent listener-facing root destinations:
Home, Explore, Scholars, My Library, and Settings. Each destination owns an
independent navigation stack.

Admin remains available only through a backend-capability-aware account action
and retains an independent stack outside the persistent tab shell. Search is a
global pushed action. Profile, Legal, and Support are secondary Settings
screens. Started, Saved, and Completed are internal My Library selections.

Persistent subsection navigation and its bottom-accessory presentation are
removed. Obsolete native subsection paths do not redirect or receive aliases;
they render the localized normal not-found state. The mini-player remains the
sole bottom accessory while audio is active.

## Consequences

- Native route groups distinguish the Home `/` root from Explore `/explore`.
- Existing playback, downloads, synchronization, authentication,
  authorization, localization, and theme contracts remain unchanged.
- Shared web route constants remain available where they are valid web
  contracts; native-only subsection metadata is not shared.
- Home, Scholars, and internal My Library behavior are implemented by their
  respective follow-up tickets in the parity specification.
