# Native Component Adoption

## Metadata

- Date: 2026-08-07
- Status: Planned
- Scope: `apps/native` — adopt `@expo/ui` native components for behavioral/interactive
  primitives where they clearly beat plain-RN equivalents, following the pattern proven by the
  surviving primitives (native `Button`, `TextInput`, `Switch`, `SegmentedControl`, `Menu`,
  `ConfirmDialog`). Explicitly does NOT re-attempt the reverted #450–#459 wholesale
  `Text`/`View` replacement (`NativeText`, `NativeScreenHost`), which was rolled back in
  `606b4735` because it broke against the unified Unistyles design system.
- Summary: Five stages — (1) native slider playback scrubber, (2) native search box for Home +
  Explore, (3) native playback/mini-player icon buttons, (4) Now Playing as a native bottom
  sheet (exploratory), (5) resolve dead/unused native deps. Guardrail: native for _behavior_,
  JS for _layout/content_.
- Dependencies: `@expo/ui` ~57.0.8 already installed (exports universal Slider/Picker/Checkbox/
  BottomSheet/Collapsible + community slider/bottom-sheet/picker/segmented-control/menu);
  Unistyles design tokens; existing shared native `TextInput`/`Button` primitives.

## Progress

- Investigation complete (2026-08-07). Findings:
  - Surviving native layer: `Button.ios/.android.tsx` (SwiftUI/Compose), `ConfirmDialog.ios/
.android.tsx` (Alert/AlertDialog), `TextInput.tsx`, `Toggle.tsx`, `SegmentedControl.tsx`,
    `List/ListItem.tsx` + `language-switch` (native menus), native tab bar (`NativeTabs`),
    local module `expo-bottom-accessory`, `expo-audio`, `expo-image`,
    `expo-apple-authentication`, native `headerSearchBarOptions` on admin screens.
  - The broad migration (#450–#459) was reverted on 2026-08-05 (`606b4735` + 8 per-phase
    reverts): it replaced layout/content (`Text`→`NativeText`, `ScreenView`→`NativeScreenHost`,
    admin sheets → native Sheet) which fights Unistyles and churned `jest.setup.js` (−104).
  - Ranked JS-built candidates (details in each stage): playback scrubber (tap-only, JS-drawn),
    Home/Explore search box (raw RN `TextInput` in `ScreenHeader.tsx`), playback + mini-player
    icon buttons (10+ raw `Pressable`s), Now Playing full-screen `Modal`, and unused native
    deps (`SegmentedControl` wrapper, `expo-blur`, `expo-symbols`, `expo-navigation-bar`,
    `expo-haptics`, `@shopify/flash-list`).
- `@expo/ui` SDK 57 API verified from installed types: universal `Slider` (`value`,
  `onValueChange`, `min`, `max`, `step`, `disabled`, `testID`, `modifiers`) and community
  slider drop-in with `minimumTrackTintColor`/`thumbTintColor`/`maximumTrackTintColor` (works
  with Unistyles tokens) — but it has no `onSlidingComplete`, so seek-on-change is the design.
- Next step: Stage 1 — native slider playback scrubber (TDD).

## Staging Strategy

- Dependency order: self-contained highest-value first (slider, then search box), then
  medium-risk button swaps, then the exploratory bottom sheet, then deps cleanup last.
- Each stage is TDD'd, independently committed, and verified on device before the next begins.

## Stage 1: Native slider playback scrubber

- Status: Planned
- Goal: Replace the JS-drawn, tap-only progress bar with a native slider so users can
  drag-scrub and get native track/thumb rendering, tinted with Unistyles tokens.
- Files:
  - `apps/native/src/features/audio/components/progress-bar.tsx`
  - `apps/native/src/features/audio/components/progress-bar.spec.tsx` (new)
  - `apps/native/src/features/audio/components/mini-player.spec.tsx` (update if it asserts on
    the old bar)
- Changes: Render `Slider` from `@expo/ui/community/slider` with
  `minimumValue={0}`, `maximumValue={durationSeconds}`, `value={currentTime}`,
  `minimumTrackTintColor={theme.colors.action.primary}`,
  `maximumTrackTintColor={theme.colors.border.subtle}`,
  `thumbTintColor={theme.colors.action.primary}`, `step={1}`; `onValueChange` →
  `audioService.seek(value)`. Remove the JS track/fill/knob `View`s and the `measure()`
  tap handler. Keep the accessibility label. Mini-player's non-interactive bar stays as-is.
- Blockers: Community slider has no `onSlidingComplete`; verify seek-on-change feels right on
  device (audio is local, so per-change seeks are cheap). Confirm `value` tracks playback
  while dragging doesn't fight the native thumb.
- Dependencies: None (self-contained).
- Completion Criteria: New `progress-bar.spec.tsx` passes (renders slider with correct
  min/max/value/colors; `onValueChange` calls `audioService.seek`); full native suite green;
  native typecheck + lint clean; device: drag-scrub works in Now Playing.
- Suggested Commit Message: `feat(native): use native slider for playback scrubbing`

## Stage 2: Native search box for Home + Explore

- Status: Planned
- Goal: Swap the raw RN `TextInput` in `ScreenHeader.tsx` for the shared native `TextInput`
  wrapper so Home and Explore get native keyboard behavior. Keep the existing X clear button.
- Files:
  - `apps/native/src/shared/components/ScreenHeader/ScreenHeader.tsx`
  - `apps/native/src/shared/components/ScreenHeader/ScreenHeader.spec.tsx` (new or existing)
- Changes: Replace the `react-native` `TextInput` import with the shared native `TextInput`
  from `@/shared/components/TextInput`; pass through controlled value + `onChangeText`; drop
  `clearButtonMode="while-editing"` (no native equivalent) — the existing X clear `Pressable`
  remains.
- Blockers: Shared native `TextInput` accepts a constrained style subset (box paint only, per
  its doc comment). The header's input typography/padding must fit that subset; if not,
  adjust the wrapper or keep the RN input. Verify return-key behavior on device.
- Dependencies: None (existing shared native `TextInput`).
- Completion Criteria: ScreenHeader spec passes; Home/Explore search typing covered by specs;
  full native suite green; native typecheck + lint clean; device: native keyboard + return key.
- Suggested Commit Message: `feat(native): use native text input for home/explore search`

## Stage 3: Native playback and mini-player icon buttons

- Status: Planned
- Goal: Replace raw `Pressable` icon buttons in playback controls and the mini player with the
  shared native `Button` (SwiftUI/Compose) for native tap feedback. Button-only portion of the
  reverted Phase 3 — no `NativeText` anywhere.
- Files:
  - `apps/native/src/shared/components/Button/Button.tsx` (icon-only variant: children = icon,
    no text label, optional transparent/ghost style)
  - `apps/native/src/features/audio/components/playback-controls.tsx` + spec
  - `apps/native/src/features/audio/components/mini-player-icon-button.tsx`
  - `apps/native/src/features/audio/components/mini-player.tsx`
  - `apps/native/src/features/navigation/components/BottomAccessory/SubrouteIconButton.tsx`
- Changes: Add/verify an icon-only `Button` variant; migrate the 8 playback-controls buttons,
  the mini-player icon buttons, and `SubrouteIconButton` to it; preserve exact sizes, tokens,
  and accessibility labels; remove now-unused `Pressable` styles.
- Blockers: `Button.ios.tsx` (SwiftUI `Button` + `HStack`/`Text`) must support icon-only with
  no forced label and keep the transparent/ghost styling controls need. High tap-target
  fidelity risk — revert per-button if visual regressions appear on device.
- Dependencies: Existing shared `Button`; no other stages.
- Completion Criteria: playback-controls spec green (same handlers + accessibility labels);
  full native suite green; native typecheck + lint clean; device: play/pause + skips feel
  native with unchanged layout.
- Suggested Commit Message: `feat(native): use native buttons for playback controls`

## Stage 4: Now Playing as a native bottom sheet (exploratory)

- Status: Planned
- Goal: Evaluate replacing the full-screen RN `Modal` in `mini-player.tsx` with
  `@expo/ui/community/bottom-sheet` for native sheet behavior.
- Files:
  - `apps/native/src/features/audio/components/mini-player.tsx`
  - `apps/native/src/features/audio/components/mini-player.spec.tsx`
- Changes: Prototype the bottom-sheet swap behind the current Now Playing modal; verify
  drag-to-dismiss, detent heights, and that artwork + scrubber + controls fit. If sheet
  constraints block the design, revert and record the blocker in this stage.
- Blockers: Exploratory — sheet may not support the required detent/full-height layout or
  custom content flexibly. Verify on device before committing.
- Dependencies: Stage 1 (slider) for the scrubber inside the sheet.
- Completion Criteria: mini-player spec green; device: sheet opens from mini-player,
  drag-to-dismiss works, controls usable; native typecheck + lint clean.
- Suggested Commit Message: `feat(native): present now playing in a native bottom sheet`

## Stage 5: Resolve dead and unused native deps

- Status: Planned
- Goal: Wire up or drop unused native affordances so the dependency surface is honest:
  `SegmentedControl` wrapper (dead code), `expo-haptics` (hook with no consumers),
  `expo-blur`, `expo-symbols`, `expo-navigation-bar`, `@shopify/flash-list` (only mocked).
- Files:
  - `apps/native/src/features/settings/components/SegmentedControl/` (wire to a real setting
    or delete with its spec)
  - `apps/native/src/shared/hooks/use-haptic.ts` (wire into playback taps or delete)
  - `apps/native/package.json` (drop genuinely unused deps)
  - Candidate consumers: settings screens, playback controls (Stage 3)
- Changes: Per item — (a) `SegmentedControl`: wire to a genuine 2–3 option segmented setting
  or delete; (b) haptics hook: call from native playback taps or delete; (c) confirm and drop
  unused deps via grep + `expo-doctor`. Run `bun run expo:check` after dependency changes.
- Blockers: None currently identified.
- Dependencies: Stage 3 for the haptics-wiring option.
- Completion Criteria: `bun run expo:check` passes; full native suite green; native typecheck +
  lint clean; grep confirms no imports of dropped deps.
- Suggested Commit Message: `chore(native): wire or drop unused native affordances`

## Final Verification

- `bun run --filter native typecheck`, `lint`, `test` all green
- `bun run expo:check` green after any dependency changes
- Manual smoke on iOS simulator + Android emulator: Now Playing scrub/controls, Home + Explore
  search, sheet presentation, settings
- No re-introduction of the reverted #450–#459 pattern (`NativeText`/`NativeScreenHost`
  wholesale text/view replacement)
- No backend, API-contract, or i18n-structure changes

## Plan Completion

- All five stages complete and verified; mark the plan `Completed` and move it to
  `.agents/plans/completed/`.
