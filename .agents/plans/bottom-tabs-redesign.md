# Bottom Tabs Redesign Plan

## Goal

Redesign mobile bottom navigation to use Expo Router primitives instead of the current fully custom shell, while preserving the product's section-based navigation model and leaving room for platform-specific UX.

## Version Assumption

This plan targets Expo SDK 55, not SDK 54. Any references to Expo Router tab capabilities, native tabs, or `expo-router/ui` should be validated against SDK 55 behavior and APIs during implementation.

## Current State

The current mobile tab experience is driven by a custom shell in [apps/mobile/src/app/(tabs)/\_layout.tsx](<C:/dev/salafi-audios/apps/mobile/src/app/(tabs)/_layout.tsx>) and [AdaptiveShell.native.tsx](C:/dev/salafi-audios/packages/feature-navigation/src/components/AdaptiveShell/AdaptiveShell.native.tsx).

The shell currently does more than standard bottom tabs:

- shows a launcher-style home state on search home
- switches sections through a floating bar and bottom sheet
- keeps per-section sub-tabs in the same control surface
- depends on `feature-navigation` state such as `sectionTabs`

That means this is not a direct 1:1 replacement of `Tabs` with another tab primitive. We need to split top-level section navigation from intra-section navigation.

## Recommendation

Use a stack-based shell as the primary architecture:

1. Convert the current `(tabs)` area into a stack-owned application shell.
2. Keep a persistent custom adaptive bottom bar rendered from the shared layout.
3. Let the bottom bar change by route state and screen context.
4. Treat `expo-router/unstable-native-tabs` and `expo-router/ui` as reference tools, not the foundation of this navigation model.

## Why This Approach

The current shell is not a standard tab bar. It is an adaptive navigation surface with multiple modes:

- search-home launcher mode
- section mode with subsection switching
- search shortcut behavior
- section switching sheet

That interaction model fits a stack-based app shell better than a true tab navigator.

The current shell is also mixing two levels of navigation:

- top-level sections: Search, Feed, Live, Library, Account
- subsection routes inside each section: `popular`, `recent`, `following`, etc.

Trying to force both levels into native tabs would either:

- flatten the UX into something less capable, or
- recreate a large amount of custom behavior around a tab primitive anyway

Using stacks plus a custom bottom shell preserves the current product direction while keeping Expo Router in charge of route structure.

It also gives us the best chance of keeping mobile-native and mobile-web visually aligned. A fully native-tabs-first approach would likely produce a more platform-native bottom bar on iOS/Android but a noticeably different custom implementation on web. Since parity is a product requirement here, a shared shell model is the safer architectural base.

## Proposed Navigation Model

### Top-Level Sections

The adaptive bottom bar should represent these route groups:

- `(search)`
- `(feed)`
- `(live)`
- `(library)`
- `(account)`

Each section should map to a route-group stack layout, not directly to individual subsection screens.

### Section Internals

Each section keeps its own stack and subsection selector:

- `feed`: `popular`, `recent`, `following`
- `live`: `scheduled`, `ongoing`, `ended`
- `library`: `saved`, `started`, `completed`
- `account`: `profile`, `general`, `legal`

Those subsection controls should move into each section layout or screen header area. They should no longer live in the global bottom bar.

### Search

Search remains a top-level section backed by `(search)`.

The current launcher-style home mode can stay. In the stack-based model, that mode becomes a first-class shell state instead of something we are trying to squeeze into tab semantics.

## Scope

### In Scope

- mobile bottom navigation architecture
- route layout restructuring for top-level tabs
- migration from tab-group semantics toward stack-group semantics
- preservation and refinement of `AdaptiveShell`
- visual parity between mobile-native and mobile-web
- relocation of subsection controls
- icon and label strategy for native tabs
- validation on iOS, Android, and mobile web behavior

### Out of Scope

- redesigning desktop web sidebar or top auth strip
- auth flow changes
- API or data-fetching changes
- large visual rewrite of every section screen

## Implementation Plan

### Phase 1: Navigation Audit and Target Structure

1. Freeze the desired top-level tab list: Search, Feed, Live, Library, Account.
2. Confirm the landing route for each route group.
3. Keep subsection tabs in the adaptive shell unless a section-specific header treatment is clearly better.
4. Identify which current `feature-navigation` pieces should remain core to the design:
   - `AdaptiveShell`
   - `SectionLauncher`
   - `SectionSwitcherSheet`
   - route-derived section helpers
5. Identify only the pieces that should be simplified or removed.
6. Define a parity contract for native and web:
   - same information architecture
   - same control order
   - same shell states
   - only minimal platform-specific visual differences

### Phase 2: Replace Tab Group Semantics with Stack Shell Semantics

1. Rework [apps/mobile/src/app/(tabs)/\_layout.tsx](<C:/dev/salafi-audios/apps/mobile/src/app/(tabs)/_layout.tsx>) so it behaves as a stack-owned shell container rather than a tab-layout surrogate.
2. Keep one route group per top-level section:
   - `(search)/_layout.tsx`
   - `(feed)/_layout.tsx`
   - `(live)/_layout.tsx`
   - `(library)/_layout.tsx`
   - `(account)/_layout.tsx`
3. Ensure deep links and section transitions still resolve through Expo Router stacks cleanly.
4. Keep the adaptive bar mounted at the shell level.

### Phase 3: Refine the Adaptive Bottom Bar

1. Preserve two major shell modes:
   - launcher mode for search home
   - section mode for content sections
2. Audit whether the current control density and spacing are still right for both Android and iOS.
3. Formalize the shell API so the layout consumes route state instead of implicit assumptions.
4. Keep subsection switching in the adaptive shell if that remains the strongest UX fit.
5. Extract shared shell primitives so native and web can reuse the same behavior and hierarchy even if their rendering details differ.

### Phase 4: Simplify Navigation State

1. Reduce or remove `navigation-store` responsibilities tied to the floating shell.
2. Prefer deriving active section and active subsection from the route.
3. Keep persistent remembered subsection only if product value is clear.
4. Remove stale helpers that only exist for the old shell.

### Phase 5: Web Strategy

1. Treat mobile web as a first-class target, not a fallback.
2. Keep mobile web on the same shell model and route semantics as native.
3. If a dedicated web layout is needed, implement `apps/mobile/src/app/(tabs)/_layout.web.tsx`.
4. Use `expo-router/ui` there only if it helps preserve parity while keeping the layout maintainable.
5. Reject changes that make web and native diverge materially in hierarchy, interaction model, or control placement.

### Phase 6: Cleanup

1. Remove any remaining assumptions that the app shell is a tab navigator.
2. Remove `@react-navigation/bottom-tabs` if nothing else depends on it.
3. Remove [haptic-tab.native.tsx](C:/dev/salafi-audios/packages/shared/src/components/haptic-tab.native.tsx) if it becomes unused.
4. Update documentation and route notes in AGENT files where needed.

## Design Constraints

- Do not mix top-level tabs and subsection tabs in the same navigation bar.
- Keep the route tree explicit and Expo Router-native.
- Avoid deep package exports or app-only aliases inside shared packages.
- Preserve a clean path for Android, iOS, and web-specific layouts.
- Keep the custom shell intentional and bounded instead of letting it become ad hoc.
- Keep mobile-native and mobile-web very close in structure and appearance.

## Risks

- The current shell may be tightly coupled to route assumptions that become brittle as the app grows.
- Preserving the adaptive model without simplifying its state can keep unnecessary complexity alive.
- Mobile web parity may still require a dedicated `_layout.web.tsx`, even if most shell logic is shared.
- Native tabs remain attractive for accessories and platform behavior, which could create pressure to partially reintroduce tab semantics later.

## Verification

- The adaptive shell renders correctly on Android and iOS.
- The adaptive shell renders with the same structure and nearly the same visual treatment on mobile web.
- Each section preserves its own stack and back behavior.
- Search remains reachable as a first-class top-level tab.
- Subsection navigation works through the adaptive shell or section-owned controls as designed.
- Deep links into subsection routes still open the correct section and screen.
- No regressions in auth redirects or modal presentation.

## Decision

Proceed with `Stack + adaptive bottom shell` as the default redesign target. Use Expo Router stacks for navigation structure, preserve the adaptive shell as the user-facing control surface, and treat `expo-router/unstable-native-tabs` and `expo-router/ui` as optional tools rather than the primary architecture.

## References

- Expo docs: Native tabs, SDK 55
- Expo docs: Custom tabs with `expo-router/ui`
