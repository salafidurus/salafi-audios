# Mobile UX Redesign

## Metadata

- Date: 2026-08-06
- Status: In Progress
- Scope: `apps/native` UI/UX redesign per prototype `salafi-durus-mobile-app(1).jsx`, aligning with
  the approved web UX. Includes 3 bug fixes, theme token confirmation, Home tab, Explore
  sub-tab restructure (adds "All Lectures"), Home screen, Explore screen rebuilds, and polish.
- Summary: Translate the prototype design into the native app using existing Unistyles tokens,
  `@sd/design-tokens`, and existing data hooks. No Admin, auth, API hook, download-manager
  internals, or i18n-structure changes. The prototype is the design source of truth.
- Dependencies: Web redesign (2026-08-03/04 plans) for shared section vocabulary; existing
  canonical `routes.ts` already reserves the home/explore URLs.

## Progress

- Phase 0 investigation complete: navigation (NativeTabs + BottomAccessory + sub-route config),
  theme tokens (parchment/ivory/gold exist), permission-tags location, data sources for Home and
  Explore, title truncation state, and the canonical route map were all verified.
- Confirmed with user: fix BottomAccessory overlap for 1.1 (no gear exists); hero "new here" state
  mirrors the web app (continue-listening → promotions hero → first recent item); All Lectures +
  category chips use existing `GET /topics/:slug/lectures` per category (client-side, no API change).
- Worktree `.worktrees/f-mobile-ux-redesign` created on branch `feature/mobile-ux-redesign`;
  prototype copied into worktree as `salafi-durus-mobile-app(1).jsx`.
- Phase 1.1 committed: BottomAccessory JS fallback offset now uses `ANDROID_TAB_BAR_HEIGHT` (80)
  plus the bottom inset (test expects 88 = 80 + 8 gap). Native host gets positive `offsetPadding`.
  Typecheck/test/lint green.
- Phase 1.2 committed: Removed the raw permission-tags "Roles" row; Email row is now the final row.
  Added a regression test asserting non-listener roles never render. Typecheck/test/lint green.
- Phase 1.3 audit complete: All primary list-row titles (lesson-row, library-item-row,
  explore-topic-row, scholar-content-list) already use `numberOfLines={2}`; MarqueeText remains
  single-line by design (Now Playing compact marquee); full-screen modal title uses {2}. No code
  changes required for this stage.
- Next step: Phase 2 — verify parchment palette tokens against the prototype.

## Staging Strategy

- Phase 1: bug fixes (1.1 BottomAccessory overlap, 1.2 permission-tags, 1.3 title truncation audit)
- Phase 2: parchment token verification
- Phase 3: navigation restructure (Home tab + Explore sub-tabs + All Lectures route/config/i18n)
- Phase 4: Home screen
- Phase 5: Explore screens rebuild
- Phase 6: polish (empty states, downloads, Now Playing)
- Final verification pass

## Stage 1: Fix BottomAccessory overlap on iOS

- Status: Completed
- Goal: The global `NativeTabs.BottomAccessory` (mini-player + sub-tab pill bar) must not overlap
  the native tab bar or screen content on iOS. No floating gear exists; the accessory is the only
  absolute overlay.
- Files:
  - `apps/native/src/features/navigation/components/BottomAccessory/BottomAccessory.tsx`
  - `apps/native/src/features/navigation/components/BottomAccessory/BottomAccessory.spec.tsx` (new)
- Changes: Replaced the hardcoded `bottom: 56` (iOS-tab-bar guess) fallback with
  `ANDROID_TAB_BAR_HEIGHT` (80) plus the bottom safe-area inset in the JS fallback path, so the
  bar sits within the safe area above the taller Android tab bar and never covers content. The
  native Android host now receives a positive `offsetPadding` so it clears the tab bar.
- Blockers: None currently identified.
- Dependencies: None.
- Completion Criteria: ✅ test (3 new + existing 8 pass), typecheck, lint green; 2026-08-06 commit.
- Suggested Commit Message: `fix(native): prevent bottom accessory from overlapping tab bar and content`

## Stage 2: Remove permission-tags roles row

- Status: Completed
- Goal: Remove the raw, non-localized permission-tags `SettingsRow` from the profile screen.
- Files:
  - `apps/native/src/features/settings/screens/settings-profile.screen.tsx` (lines ~151–166)
  - `apps/native/src/features/settings/screens/settings-profile.screen.spec.tsx`
- Changes: Deleted the "Roles" `SettingsRow` and `nonListenerRoles` rendering; removed the now-unused
  `nonListenerRoles` local and `rolesRow`/`roleBadge` styles; the Email row is now the final row
  of the Account section. Added a regression test asserting non-listener roles never render.
- Blockers: None currently identified.
- Dependencies: None.
- Completion Criteria: ✅ test (7 pass), typecheck, lint green; 2026-08-06 commit.
- Suggested Commit Message: `fix(native): remove permission tags row from profile settings`

## Stage 3: MarqueeText / title truncation audit

- Status: Completed (audit only — no code change required)
- Goal: No primary title in list rows may be single-line truncated when the prototype allows two
  lines.
- Files:
  - `apps/native/src/shared/components/MarqueeText/MarqueeText.tsx`
  - List rows: `lesson-row`, `library-item-row`, `scholar-content-list`, `explore-topic-row`
  - `apps/native/src/features/audio/components/mini-player.tsx`
- Changes: Audited every primary-title usage. `lesson-row` (70), `library-item-row` (81),
  `scholar-content-list` (36), `explore-topic-row` (34) all use `numberOfLines={2}`. `MarqueeText`
  stays single-line (`numberOfLines={1}`) for the Now Playing compact marquee by design. The
  full-screen modal title (`mini-player.tsx:113`) uses `numberOfLines={2}`. No truncation bugs
  found.
- Blockers: None currently identified.
- Dependencies: None.
- Completion Criteria: ✅ audit complete; typecheck, test, lint green (unchanged code).
- Suggested Commit Message: `chore(native): audit list-row title truncation (no-op)`

## Stage 4: Verify parchment design tokens

- Status: Pending
- Goal: Confirm the parchment theme matches the prototype palette (approx `#F7F2E7` background,
  `#B8872E` gold, `#2F6B54` jade, ivory surfaces). No theme picker work.
- Files:
  - `packages/design-tokens` (token definitions, `createThemeNative`)
  - `apps/native/src/core/styles/unistyles.ts`
- Changes: Compare hex values against the prototype; adjust token values only where they diverge
  meaningfully. If tokens are already aligned, record verification and move on.
- Blockers: None currently identified.
- Dependencies: None.
- Completion Criteria: `bun run typecheck` passes; palette values documented in stage notes.
- Suggested Commit Message: `chore(tokens): align parchment palette with prototype`

## Stage 5: Home tab + Explore sub-tab restructure + All Lectures

- Status: Pending
- Goal: Home becomes the landing tab (route `/`); Explore moves to `/explore/*` with sub-tabs
  Recent / Scholars / Curation / All Lectures.
- Files:
  - `apps/native/src/app/(tabs)/_layout.tsx` (first `NativeTabs.Trigger` for Home)
  - `apps/native/src/app/(tabs)/(home)/index.tsx` (new, route `/`; absorbs search-landing)
  - `apps/native/src/app/(tabs)/(explore)/index.tsx` → `.old`; `recent.tsx` becomes initial route
  - `apps/native/src/app/(tabs)/(explore)/all.tsx` (new)
  - `apps/native/src/app/(tabs)/(explore)/_layout.tsx` (Stack screen entries)
  - `apps/native/src/features/navigation/utils/tab-route-config.ts`
  - `packages/core-contracts/src/routes.ts` (+`explore.all: "/explore/all"`)
  - `packages/core-contracts/src/navigation.ts` (SECTION_TABS.explore += all)
  - `packages/core-i18n/src/locales/en.json` + `ar.json` (`navigation.subnav.explore.all`)
  - Redirects for legacy `/recent`, `/scholar`, `/curation`
- Changes: Add Home trigger (first), new `(home)` group; move search-bar composition from the
  Explore index to Home; rewire explore sub-route paths to canonical `/explore/*`; add "All
  Lectures" route/config/label; update tab-route-config helpers (`getActiveSubsection`,
  `buildSectionPath`, `getRootTabFromPathname`, `isTabRoute`); rename old route files `.old`.
- Blockers: None currently identified.
- Dependencies: Stage 4 (themes) only for visual consistency; no code dependency.
- Completion Criteria:
  - App lands on Home tab; tab order Home → Explore → Library → Settings → Admin
  - Explore sub-tabs Recent/Scholars/Curation/All Lectures switch correctly
  - `bun run test` + `bun run typecheck` + `bun run lint` pass
- Suggested Commit Message: `feat(native): add home tab and restructure explore sub-tabs`

## Stage 6: Home screen

- Status: Pending
- Goal: Build the Home screen per the prototype: search bar, hero (resume vs recommended
  starting point), category chips, scholars rail, recently added.
- Files:
  - `apps/native/src/features/home/screens/home/home.screen.tsx` (new)
  - `apps/native/src/features/home/components/*` (hero, chips, rail, recent sections)
  - `apps/native/src/features/home/hooks/use-home-promotions.ts` (native-local, mirrors web)
  - `apps/native/src/app/(tabs)/(home)/index.tsx`
  - `packages/core-i18n/src/locales/en.json` + `ar.json` (new home keys)
- Changes: Mirror web `home.screen.tsx` data flow: `useContinueListening` (resume),
  `useHomePromotions` (hero listing) falling back to the first recent content item, then a
  hardcoded last-resort. Scholars rail via `useInfiniteScholarsList`; category chips via
  `/topics/:slug/lectures`; recently added via `/listings/recent`; saved deeplink to Library/saved.
- Blockers: None currently identified.
- Dependencies: Stage 5 (Home route).
- Completion Criteria: Home renders hero states (history + new-user), chips, rail, and recent
  list; `bun run test` + `bun run typecheck` + `bun run lint` pass.
- Suggested Commit Message: `feat(native): build home dashboard screen`

## Stage 7: Rebuild Explore screens

- Status: Pending
- Goal: Rebuild Recent, Scholars, All Lectures, and Curation screens per the prototype.
- Files:
  - `apps/native/src/features/explore/screens/explore-recent.screen.tsx`
  - `apps/native/src/features/explore/screens/explore-scholar.screen.tsx`
  - `apps/native/src/features/explore/screens/explore-all.screen.tsx` (new)
  - `apps/native/src/features/explore/screens/curation.screen.tsx`
  - related components and specs
- Changes: Restyle Recent/Scholars to the prototype; build All Lectures with category chips
  (aqeedah, tafsir, hadith, fiqh, nahw, seerah) loading `/topics/:slug/lectures` rows; replace
  Curation "Coming soon" with icon + copy + CTA (navigates to scholars).
- Blockers: None currently identified.
- Dependencies: Stage 5.
- Completion Criteria: All four sub-tabs render per prototype; `bun run test` + `bun run
typecheck` + `bun run lint` pass.
- Suggested Commit Message: `feat(native): rebuild explore screens per prototype`

## Stage 8: Polish empty states, downloads, Now Playing

- Status: Pending
- Goal: Upgrade empty states (icon + title + copy + CTA), download row states, and the Now
  Playing experience per the prototype.
- Files:
  - `apps/native/src/shared/components/EmptyState/EmptyState.tsx` (and callers)
  - download-related rows in the library/audio features
  - `apps/native/src/features/audio/components/mini-player.tsx`
- Changes: Extend empty states with icon/title/copy/CTA using existing tokens; align download
  row state visuals; polish Now Playing layout/copy per prototype.
- Blockers: None currently identified.
- Dependencies: Stages 5–6.
- Completion Criteria: `bun run test` + `bun run typecheck` + `bun run lint` pass.
- Suggested Commit Message: `feat(native): polish empty states, downloads, and now playing`

## Final Verification

- `bun run typecheck` passes across all affected workspaces (native + core-contracts +
  core-i18n)
- `bun run test` passes with no regressions
- `bun run lint` passes with no new violations
- Manual smoke test on iOS simulator and Android emulator: Home landing, Explore sub-tabs,
  hero states, empty states, downloads, Now Playing
- No Admin, auth, API-hook, or download-manager-internals changes introduced
- No i18n-structure changes; new keys added to both `en.json` and `ar.json`

## Plan Completion

- Every stage above is complete and verified. Mark the plan `Completed` and move it to
  `.agents/plans/completed/` after the final verification pass and device smoke tests.
