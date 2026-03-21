# Bottom Tabs Audit

## Scope

This note records the implementation decisions applied while executing the bottom-tabs redesign plans in March 2026.

## Current Shell Dependency Map

- Shared shell boundary: [apps/mobile/src/app/(shell)/_layout.tsx](C:/dev/salafi-audios/apps/mobile/src/app/(shell)/_layout.tsx)
- Primary shell UI: [packages/feature-navigation/src/components/AdaptiveShell/AdaptiveShell.native.tsx](C:/dev/salafi-audios/packages/feature-navigation/src/components/AdaptiveShell/AdaptiveShell.native.tsx)
- Launcher mode content: [packages/feature-navigation/src/components/SectionLauncher/SectionLauncher.native.tsx](C:/dev/salafi-audios/packages/feature-navigation/src/components/SectionLauncher/SectionLauncher.native.tsx)
- Section mode content: [packages/feature-navigation/src/components/SectionModeBar/SectionModeBar.native.tsx](C:/dev/salafi-audios/packages/feature-navigation/src/components/SectionModeBar/SectionModeBar.native.tsx)
- Section switcher sheet: [packages/feature-navigation/src/components/SectionSwitcherSheet/SectionSwitcherSheet.native.tsx](C:/dev/salafi-audios/packages/feature-navigation/src/components/SectionSwitcherSheet/SectionSwitcherSheet.native.tsx)
- Remembered subsection store: [packages/feature-navigation/src/store/navigation-store.native.ts](C:/dev/salafi-audios/packages/feature-navigation/src/store/navigation-store.native.ts)
- Route parsing and href building: [packages/feature-navigation/src/utils/shell-navigation.native.ts](C:/dev/salafi-audios/packages/feature-navigation/src/utils/shell-navigation.native.ts)
- Route-derived shell hook: [packages/feature-navigation/src/hooks/use-active-navigation-state.native.ts](C:/dev/salafi-audios/packages/feature-navigation/src/hooks/use-active-navigation-state.native.ts)

## Decisions Applied

- Subsection controls remain in the adaptive shell for this implementation pass.
- Launcher mode remains the search-home mode.
- Search home remains the shell's top-level home state.
- Native/mobile-web parity remains a requirement, but this pass only changes the native/mobile route-owned shell contract.
- The route group has been renamed from `(tabs)` to `(shell)` so the file-system structure now matches the stack-owned shell architecture.
- Section re-entry restores the last remembered subsection for that section.
- Top-level shell switches now use replace semantics, while subsection changes remain stack-driven.
- Expo web now has a dedicated shell layout and web-specific `AdaptiveShell` implementation instead of a stubbed shell surface.
- The shipped `apps/web` surface preserves per-section subsection memory during section re-entry, but it does so through the web app's existing navigation components rather than the mobile app shell boundary.

## Shell State Contract

- `activeSection`: current top-level section or `null` for launcher mode.
- `activeSubsection`: subsection parsed from the current pathname when present.
- `activeTab`: rendered subsection target, falling back to remembered subsection state when the route does not specify one.
- `shellMode`: `"launcher"` or `"section"`.
- `showSectionLauncher`: launcher mode visibility flag.
- `showSectionSwitcher`: section switcher availability flag.
- `showSearchShortcut`: section-mode search affordance visibility flag.
- `canOpenSectionSwitcher`: explicit permission for switcher interactions.

## Store Reduction Outcome

- Route-derived values are no longer read from the store for shell rendering.
- `navigation-store` remains only for remembered subsection fallback targets across section launches.
- When a route lands directly on a subsection, the hook syncs that subsection back into the remembered store.

## Test Coverage Added

- Focused route utility coverage now verifies:
  - grouped internal href parsing
  - normalized pathname parsing
  - invalid subsection fallback
  - search launcher-mode state
  - section re-entry href resolution using remembered subsection state

## Workstream Status

### Workstream 1: Audit and Decision Lock

- `done` dependency map produced in this audit note
- `done` shell state contract defined and implemented
- `done` subsection controls remain in the shell for this pass
- `done` launcher mode and search-home shell behavior locked
- `done` route-group naming decision executed as `(shell)`
- `partial` explicit performance/profiling spike not captured in the repo as a measurable artifact

### Workstream 2: Route and Layout Restructure

- `done` shared shell boundary moved to [apps/mobile/src/app/(shell)/_layout.tsx](C:/dev/salafi-audios/apps/mobile/src/app/(shell)/_layout.tsx)
- `done` `(tabs)` renamed to `(shell)`
- `done` top-level section groups preserved under the shared shell boundary
- `done` shell remains mounted across section transitions
- `partial` deep-link verification was covered for route parsing and direct route access, but the full matrix in the implementation plan was not exhaustively recorded
- `partial` auth and non-shell route inheritance was handled in practice, but not captured as a dedicated verification artifact

### Workstream 3: Route-Derived Shell State

- `done` route-derived shell hook implemented
- `done` parser/builder normalization added for grouped and normalized path shapes
- `done` `AdaptiveShell` routing logic moved to the shell boundary
- `done` focused route utility tests added
- `done` section re-entry behavior tested through remembered subsection targets

### Workstream 4: Adaptive Shell Refactor

- `done` `AdaptiveShell.native.tsx` refactored to a props-driven shell component
- `done` native launcher and section modes remain explicit
- `done` shell wiring moved to the layout boundary
- `partial` shell primitives are cleaner, but the full native/web primitive hierarchy is still not unified under one shared implementation

### Workstream 5: Navigation Store Simplification

- `done` route-derived values no longer come from the store for shell rendering
- `done` remembered subsection state remains as explicit UX memory
- `done` store precedence is route-first, memory-second
- `partial` stale tab-era helpers outside the core shell path may still exist and need one more cleanup sweep

### Workstream 6: Mobile-Web Parity Layer

- `done` dedicated web shell layout added for `apps/mobile`
- `done` web `AdaptiveShell` implementation added
- `done` browser/runtime verification completed for the shipped `apps/web` surface
- `done` major web styling regressions, auth icon sizing, and runtime hydration noise were fixed
- `partial` parity is behaviorally strong, but `apps/web` still uses its own navigation surface rather than the mobile shell implementation as the architectural source of truth
- `partial` targeted verification on iOS Safari and Chrome mobile browser chrome expansion/collapse is still not recorded

### Workstream 7: Cleanup and Boundary Enforcement

- `done` `@react-navigation/bottom-tabs` removed
- `done` [haptic-tab.native.tsx](C:/dev/salafi-audios/packages/shared/src/components/haptic-tab.native.tsx) removed
- `done` `apps/mobile/AGENT.md` updated for the shell boundary
- `partial` root docs such as [docs/mobile.md](C:/dev/salafi-audios/docs/mobile.md) and [docs/architecture.md](C:/dev/salafi-audios/docs/architecture.md) were reviewed during implementation but not yet updated to describe the shell redesign explicitly
- `partial` lockfile churn was introduced earlier and remains broader than the narrow dependency removal warranted

## Follow-Up Work Still Open

- Runtime parity is now verified for section re-entry on `apps/web`:
  - `live/ongoing -> feed/popular -> live` returns to `live/ongoing`
  - `live/scheduled -> feed/popular -> live` returns to `live/scheduled`
- The remaining web gap is architectural, not behavioral: `apps/web` still uses its own navigation surface, so the new mobile shell implementation is not the source of truth for shipped web navigation yet.
- Cleanup of any remaining tab-era dependency references outside the shell itself.
- Explicit profiling/performance artifacts were planned but not yet captured.
- The full deep-link and back-navigation verification matrix from the implementation plan is not fully recorded yet.
- Documentation updates in [docs/mobile.md](C:/dev/salafi-audios/docs/mobile.md) and [docs/architecture.md](C:/dev/salafi-audios/docs/architecture.md) are still pending if we want the plan status to be fully reflected in canonical docs.
