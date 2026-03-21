# Bottom Tabs Implementation Plan

## Purpose

This document translates the navigation concept into an implementation sequence.

The goal is to migrate the current mobile navigation shell to a stack-owned adaptive shell without losing:
- the launcher-style search home mode
- section-aware shell behavior
- subsection switching where it still adds value
- close visual parity between mobile-native and mobile-web

This plan assumes the architectural decisions in [bottom-tabs-concept.md](C:/dev/salafi-audios/.agents/plans/bottom-tabs-concept.md) are the source of truth.

## Naming Decision

Use descriptive filenames in `.agents/plans`, not generic names like `concept.md` and `implement.md`.

Recommended pair:
- [bottom-tabs-concept.md](C:/dev/salafi-audios/.agents/plans/bottom-tabs-concept.md)
- [bottom-tabs-implementation.md](C:/dev/salafi-audios/.agents/plans/bottom-tabs-implementation.md)

Reason:
- the plans folder will grow
- generic filenames will become ambiguous
- navigation-specific names are easier to search, reference, and maintain

## Implementation Principles

- Route state is the source of truth for shell state.
- The shell should mount once at the shared app-shell layout boundary.
- Shared shell behavior should live in packages, not route files.
- Mobile-native and mobile-web should use the same interaction model unless a platform difference is intentional and documented.
- Route wrappers in `apps/mobile/src/app` stay thin.

## Target End State

When implementation is complete:
- the app shell is owned by a stack layout, not tab semantics
- top-level sections are route-group stacks
- `AdaptiveShell` renders from route-derived state
- shell state is not duplicated unnecessarily in `navigation-store`
- subsection switching is either preserved in the shell or intentionally moved after UX sign-off
- mobile-native and mobile-web share the same shell modes and control hierarchy
- the legacy tab assumptions and unused tab dependencies are removed
- each top-level section restores its last active subsection when the user re-enters it
- back navigation is not reduced to replaying an arbitrary global stack of shell switches

## Workstreams

### Workstream 1: Audit and Decision Lock

#### Objectives
- freeze the UX decisions that affect architecture
- identify coupling before refactoring
- produce the shell contract before code changes spread

#### Tasks
1. Produce a shell dependency map for:
   - [AdaptiveShell.native.tsx](C:/dev/salafi-audios/packages/feature-navigation/src/components/AdaptiveShell/AdaptiveShell.native.tsx)
   - [SectionLauncher.native.tsx](C:/dev/salafi-audios/packages/feature-navigation/src/components/SectionLauncher/SectionLauncher.native.tsx)
   - [SectionModeBar.native.tsx](C:/dev/salafi-audios/packages/feature-navigation/src/components/SectionModeBar/SectionModeBar.native.tsx)
   - [SectionSwitcherSheet.native.tsx](C:/dev/salafi-audios/packages/feature-navigation/src/components/SectionSwitcherSheet/SectionSwitcherSheet.native.tsx)
   - navigation-store and current route helpers
   Output:
   - a short Markdown artifact checked into `.agents/plans` or adjacent implementation notes
   - include current props, consumed stores, route assumptions, helper dependencies, and known coupling pain points
2. Lock the UX answers to these questions:
   - do subsection controls remain inside the shell
   - does launcher mode stay as-is
   - does search home remain the shell’s “home mode”
   - what level of visual variance is acceptable between native and mobile-web
   Enhancement review:
   - evaluate whether long-press actions on section affordances should expose a menu of subsection shortcuts where platform support and UX value justify it
   - treat this as a post-MVP enhancement unless it is explicitly approved as part of the redesign scope
   Stakeholders:
   - product/design owner for behavior and layout sign-off
   - engineering owner for implementation feasibility
3. Confirm whether `(tabs)` will be renamed during the migration or immediately after stabilization.
4. Define a shell state contract:
   - `activeSection`
   - `activeSubsection`
   - `shellMode`
   - `canOpenSectionSwitcher`
   - `canTriggerSearchShortcut`
   - `rememberedSubsectionBySection`
5. Lock the shell re-entry policy:
   - re-entering a section restores the last active subsection for that section
   - remembered subsection state is product memory, not current-route authority
   - back behavior is a separate policy decision, not a side effect of subsection memory
6. Run the performance spike and capture measurable output:
   - route transition timings or profiler snapshots
   - rerender findings
   - a short summary with recommendations that feed Workstream 3
   Animation check:
   - verify shell animations are limited to opacity and transform-driven properties wherever possible
   - flag any layout-affecting animation that may introduce jank

#### Deliverables
- dependency map
- UX sign-off notes
- shell state contract
- route-group naming decision
- section re-entry policy

#### Exit Criteria
- no unresolved UX ambiguity around subsection placement
- no unresolved question about shell mounting boundary
- no unresolved ambiguity about section re-entry behavior

### Workstream 2: Route and Layout Restructure

#### Objectives
- make the shell persistent across section changes
- remove tab-layout assumptions without destabilizing routes

#### Tasks
1. Rework [apps/mobile/src/app/(tabs)/_layout.tsx](C:/dev/salafi-audios/apps/mobile/src/app/(tabs)/_layout.tsx) into the persistent shell boundary.
2. Decide whether to rename the route group:
   - preferred: `(shell)` or `(app)`
   - temporary fallback: keep `(tabs)` during migration, then rename later
   Rename checklist:
   - update route file locations
   - update hardcoded href and `router.push()` strings
   - update typed-route assumptions and route helpers
   - update any shell matching logic that depends on route-group names
   - rerun deep-link verification after rename
3. Ensure each top-level section remains a child route group with its own `_layout.tsx`:
   - [apps/mobile/src/app/(tabs)/(search)/_layout.tsx](C:/dev/salafi-audios/apps/mobile/src/app/(tabs)/(search)/_layout.tsx)
   - [apps/mobile/src/app/(tabs)/(feed)/_layout.tsx](C:/dev/salafi-audios/apps/mobile/src/app/(tabs)/(feed)/_layout.tsx)
   - [apps/mobile/src/app/(tabs)/(live)/_layout.tsx](C:/dev/salafi-audios/apps/mobile/src/app/(tabs)/(live)/_layout.tsx)
   - [apps/mobile/src/app/(tabs)/(library)/_layout.tsx](C:/dev/salafi-audios/apps/mobile/src/app/(tabs)/(library)/_layout.tsx)
   - [apps/mobile/src/app/(tabs)/(account)/_layout.tsx](C:/dev/salafi-audios/apps/mobile/src/app/(tabs)/(account)/_layout.tsx)
4. Enforce the persistence rule in code structure:
   - `AdaptiveShell` should be mounted by the shared shell layout
   - child section transitions should happen beneath that boundary
   - the shell should not be recreated per section screen
5. Verify route wrappers stay thin and continue importing screens from feature packages.
6. Verify auth modal routes and non-shell routes do not accidentally inherit the shell.
7. Verify deep-link scenarios explicitly:
   - deep link to a top-level section
   - deep link to a subsection
   - deep link with params inside a subsection route
   - deep link from outside the app
   - in-app navigation using `router.push()` or `Link`
8. Define explicit shell navigation policy before wiring actions:
   - top-level section switches must restore the last active subsection for that section
   - do not reduce this problem to a simplistic global `push` vs `replace` rule
   - evaluate `replace`, reset-style navigation, or another root-switch strategy only after the desired back behavior is written down
   - subsection changes inside the active section may still use push/replace depending on desired back behavior
   - do not let shell transitions accumulate as ordinary content history unless that behavior is intentionally approved

#### Deliverables
- persistent shell layout
- updated route-group structure
- no tab-layout coupling in the shell boundary

#### Exit Criteria
- shell does not remount when switching top-level sections
- deep links into section routes still resolve correctly

### Workstream 3: Route-Derived Shell State

#### Objectives
- make shell rendering deterministic
- centralize navigation parsing
- remove route assumptions from UI components

#### Tasks
1. Create a dedicated hook, for example:
   - `use-active-navigation-state.native.ts`
   - `use-active-navigation-state.web.ts`
   or a shared implementation if parity is high enough
   Testing requirement:
   - add focused tests for route parsing behavior across representative paths and shell modes
2. Use Expo Router hooks with one clear rule:
   - `usePathname()` is the primary source of normalized route truth
   - `useSegments()` is only used where file-segment awareness is necessary
   - if shell navigation builders output grouped hrefs, add one normalization layer so parser inputs and builder outputs speak the same route dialect
3. The hook should return a stable shape such as:
   - `activeSection`
   - `activeSubsection`
   - `shellMode`
   - `showSectionLauncher`
   - `showSectionSwitcher`
   - `showSearchShortcut`
   - `resolveSectionReentryHref(section)`
4. Move route parsing out of `AdaptiveShell`.
5. Make `AdaptiveShell` consume derived state and callbacks instead of deducing routing internally.
6. Keep imperative navigation at the layout/wiring edge wherever practical.
7. `AdaptiveShell` should trigger navigation only through passed callbacks or shell-boundary router actions, not by combining route parsing and route mutation inside render logic.
8. Ensure callbacks passed into shell primitives are stabilized with `useCallback` at the shell boundary where that materially reduces rerenders.
9. Add focused tests for parser and builder symmetry:
   - grouped internal href input
   - normalized public pathname input
   - invalid subsection fallback
   - search launcher mode
   - remembered subsection fallback
10. Add tests for section re-entry behavior:
   - leaving `live/ongoing` and re-entering `live` restores `ongoing`
   - leaving `library/completed` and re-entering `library` restores `completed`
   - default subsection is used only when there is no valid remembered subsection

#### Candidate Files
- [AdaptiveShell.native.tsx](C:/dev/salafi-audios/packages/feature-navigation/src/components/AdaptiveShell/AdaptiveShell.native.tsx)
- `packages/feature-navigation/src/hooks/*`
- `packages/feature-navigation/src/utils/*`
- [apps/mobile/src/app/(tabs)/_layout.tsx](C:/dev/salafi-audios/apps/mobile/src/app/(tabs)/_layout.tsx)

#### Deliverables
- dedicated route-derivation hook
- simpler shell component API
- reduced internal routing logic inside shell components

#### Exit Criteria
- shell state can be explained entirely from current route + explicit props
- route parsing logic exists in one place

### Workstream 4: Adaptive Shell Refactor

#### Objectives
- preserve the adaptive experience
- separate shell composition from section-specific concerns
- make native and web share the same behavioral model

#### Tasks
1. Split `AdaptiveShell` into smaller primitives if needed:
   - shell frame
   - launcher mode content
   - section mode content
   - subsection selector
   - search shortcut action
2. Keep the shell API declarative:
   - shell receives state
   - shell receives actions
   - shell does not infer global app state on its own
3. Preserve the current key modes:
   - launcher mode for search home
   - section mode for section routes
4. Reassess whether subsection tabs belong:
   - in-shell
   - in section headers
   - in section-owned sticky controls
5. If subsection controls remain in the shell, keep the hierarchy visually obvious:
   - primary section affordance
   - subsection chooser
   - secondary search affordance
6. Normalize haptics, animations, and icon usage against mobile `AGENT.md`.

#### Deliverables
- shell broken into stable primitives
- clearer internal boundaries
- parity-friendly shell composition

#### Exit Criteria
- shell has a narrow public API
- shell modes are obvious from props/state, not incidental conditions

### Workstream 5: Navigation Store Simplification

#### Objectives
- remove duplicated navigation authority
- keep only meaningful UI memory

#### Tasks
1. Audit `navigation-store` and classify each field as:
   - route-derivable
   - UI memory worth keeping
   - obsolete
2. Remove route-derivable fields from the store.
   Tracking:
   - maintain a checklist of fields removed, retained, or replaced
3. Keep only state that genuinely cannot come from the route, for example:
   - temporarily remembered subsection preference, if still approved
   - sheet open/closed state, if not local to the shell
   Precedence rule:
   - explicit route state always overrides remembered UI state
   - remembered subsection state may only supply defaults when the route does not already specify the target
   UX rule:
   - remembered subsection state is retained because section re-entry is an intentional UX feature, not an implementation leftover
4. Remove stale helpers and selectors that assumed the old shell.
5. Update the shell dependency map after store reduction so the final dependency picture reflects the new architecture.

#### Deliverables
- simplified store
- smaller API surface
- less chance of route/store drift

#### Exit Criteria
- active section is never represented in two competing sources of truth

### Workstream 6: Mobile-Web Parity Layer

#### Objectives
- keep native and mobile-web visually and behaviorally close
- handle the platform-specific layout differences deliberately

#### Tasks
1. Decide whether the shell can share most implementation across native and web.
2. If necessary, add [apps/mobile/src/app/(tabs)/_layout.web.tsx](C:/dev/salafi-audios/apps/mobile/src/app/(tabs)/_layout.web.tsx) or the renamed route-group equivalent.
3. Only introduce `expo-router/ui` if it clearly simplifies the web shell without changing the interaction model.
4. Reuse the same shell state contract and shell mode vocabulary across native and web.
5. Verify:
   - bottom anchoring during scroll
   - safe-area correctness
   - no overlap with browser chrome
   - no viewport jump when browser UI expands or collapses
   - stable behavior on iOS Safari and Chrome
   - browser back/forward navigation keeps shell state in sync
   - section re-entry on mobile web restores the same last active subsection as native
   Output:
   - a pass/fail parity report
   - a discrepancy list if native and web still differ
   - proposed fixes for any remaining web-only layout issues

#### Deliverables
- web shell implementation
- parity checklist results

#### Exit Criteria
- native and mobile-web remain recognizably the same product surface

### Workstream 7: Cleanup and Boundary Enforcement

#### Objectives
- remove obsolete code
- make the new architecture legible

#### Tasks
1. Remove assumptions that the shell is a tab navigator.
2. Remove `@react-navigation/bottom-tabs` if unused.
3. Remove [haptic-tab.native.tsx](C:/dev/salafi-audios/packages/shared/src/components/haptic-tab.native.tsx) if unused.
4. Update docs and AGENT files where the shell contract changes developer expectations.
5. Rename `(tabs)` to `(app)` or `(shell)` if not already done earlier.
6. Do not add new native-only dependencies to shared packages unless there is a clear package-level ownership case; prefer keeping new native dependency ownership in `apps/mobile`.
7. Keep dependency cleanup reviewable:
   - if removing one dependency, prefer the smallest lockfile update that removes only the related package edges
   - if lockfile regeneration causes broad unrelated churn, isolate or revert that noise before merging
   Minimum documentation review:
   - [docs/mobile.md](C:/dev/salafi-audios/docs/mobile.md)
   - [docs/architecture.md](C:/dev/salafi-audios/docs/architecture.md)
   - [apps/mobile/AGENT.md](C:/dev/salafi-audios/apps/mobile/AGENT.md)
   - relevant package-level `AGENT.md` files under `packages/feature-navigation`, `packages/shared`, and any feature package whose shell ownership changes
   - relevant JSDoc or TypeScript comments around shell state and route helpers

#### Deliverables
- cleaner dependency graph
- updated docs
- no dead tab-era utilities

#### Exit Criteria
- no stale tab-specific abstractions remain unless intentionally retained

## Suggested Execution Order

1. Workstream 1
2. Workstream 2
3. Workstream 3
4. Workstream 4
5. Workstream 5
6. Workstream 6
7. Workstream 7

Do not start Workstream 4 before Workstream 3 has at least stabilized the shell state contract. Otherwise UI refactoring will keep chasing moving navigation logic.

## Performance Plan

### Goal
Avoid introducing shell-induced navigation jank.

### Tasks
1. Profile shell transitions before refactor.
2. Profile again after route-derived shell state is introduced.
3. Profile again after mobile-web parity work.

### Watch For
- shell remounts across section switches
- unnecessary rerenders from unstable callbacks or objects
- bottom sheet or blur surfaces causing layout thrash
- route parsing running in too many components

### Success Criteria
- section transitions remain smooth
- shell updates are visually stable
- route changes do not trigger excessive subtree rerenders

## Verification Matrix

### Routing
- deep link to each top-level section
- deep link to each subsection route
- auth redirect into and out of the shell
- modal presentation from shell routes
- top-level section switches followed by hardware/software back navigation
- parser behavior for grouped hrefs and normalized pathnames
- re-entering a section restores the last active subsection for that section

### Native UI
- launcher mode renders correctly
- section mode renders correctly
- subsection switching works as designed
- search shortcut works from section mode
- back navigation does not break shell state
- bottom-sheet behavior remains stable across content changes and keyboard/safe-area changes
- leaving `live/ongoing` and returning to `live` restores `ongoing`
- leaving `library/completed` and returning to `library` restores `completed`

### Mobile Web
- shell remains anchored at the bottom
- safe-area spacing is correct
- shell survives viewport-height changes
- shell does not visually detach during scroll
- browser back/forward keeps shell mode and active section/subsection synchronized

### Regression
- `pnpm --filter mobile lint`
- `pnpm --filter mobile typecheck`
- focused tests for `shell-navigation.native.ts`
- targeted route smoke tests for search, feed, live, library, account

## Risks to Watch During Implementation

### Architectural Risks
- keeping `(tabs)` too long and letting the old name shape new logic
- leaving route parsing partly in the shell and partly in helpers
- preserving too much store state “just in case”

### UX Risks
- subsection controls becoming visually overloaded in the shell
- shell mode changes feeling abrupt or hidden
- parity compromises accumulating between native and web

### Technical Risks
- blur/background effects behaving differently on web
- bottom-sheet interactions diverging by platform
- bottom-sheet dynamic sizing introducing shell jitter or transition instability
- route-based state matching failing on grouped paths or renamed route groups
- typed-route workarounds masking malformed generated hrefs if parser/builder symmetry is not tested

## Definition of Done

The redesign is done when:
- the shell is stack-owned and persistent
- shell state is route-derived
- the adaptive experience is preserved intentionally
- mobile-native and mobile-web are very close in structure and behavior
- obsolete tab-era dependencies and assumptions are removed
- documentation reflects the new shell architecture
