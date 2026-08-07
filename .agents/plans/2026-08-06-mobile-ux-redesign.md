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
- Phase 2 verified: the parchment accent palette in
  `packages/design-tokens/src/colors/shared.ts` (ACCENT_PALETTES.parchment) matches the
  prototype spec exactly — canvas `#F7F2E7`, gold `#B8872E`, jade `#2F6B54`, ivory surfaces
  (`#FFFFFF`/`#F1EAD9`), tonal borders/text. Native `createThemeNative("light","parchment")`
  builds from this palette, so `colors.surface.canvas === #F7F2E7`. No token values needed
  adjustment; no code change.
- Phase 3 restructure complete: added `explore.all` (`/explore/all`) + routeDefinition to
  `packages/core-contracts/src/routes.ts`; added `all` ("All Lectures", icon "library-big") to
  `SECTION_TABS.explore` in `packages/core-contracts/src/navigation.ts`; added i18n keys
  `navigation.subnav.explore.all` (en `All Lectures`, ar `جميع الدروس`), `explore.all.*`,
  `topics.noTopics`, `common.error` to both en.json and ar.json; registered `all` in
  `translation-helpers.ts` SUBNAV_KEYS/FALLBACKS and `explore-all` (lucide `LibraryBig`) in
  `section-tab-icons.ts`.
  Native file layout: created `(home)` group (`(home)/_layout.tsx` + `(home)/index.tsx` → `HomeScreen`
  at `/`, search-bar composition moved here); converted `(tabs)/(explore)` parens group to a real
  `explore/` folder (path `/explore`) with Stack `_layout.tsx` (screens index→redirect, recent,
  scholar, curation, all); added `explore/all.tsx`; wired `(tabs)/_layout.tsx` Home trigger
  `(name="(home")` first + explore trigger renamed to `name="explore"`. Updated the live
  `tab-route-config.ts`/`SubrouteTabsBar`/`BottomAccessoryContent` model so `/`→home, `/explore/*`→explore
  (recent default), `all` sub-tab; updated their specs. `features/home` scaffolded
  (`home.screen.tsx` placeholder rendering search + ExploreRecent, enriched in Stage 6).
  `TopicChipGroup` component added. Full native suite green (367 tests), typecheck + lint clean
  for native, web, core-contracts, core-i18n.
- Next step: Phase 4 — build the Home screen (hero resume vs promotions vs recent, scholars rail,
  category chips, recently added).
- Phase 4 complete: Home screen built (`features/home/screens/home.screen.tsx`, 289 lines) with
  hero/resume/promotions, scholars rail, category chips, and recently-added per the prototype.
- Phase 5 complete: Explore screens rebuilt (`explore-recent`, `explore-scholar`, `explore-all`,
  `curation`), All Lectures uses `/topics/:slug/lectures` rows; Curation has icon + copy + CTA.
- Phase 6 polish committed: `7e52ba18` "feat(native): redesign empty states to match prototype"
  (shared `EmptyState` title/description/icon/action, applied to Library/Search/Explore/
  lecture-not-found); `22a7537a` low-effort polish (hero welcome, serif display role, initials
  covers, theme picker); `730feda6`/`889c3716` core redesign + explore/home alignment.
- UX review fixes (uncommitted): (1) removed the double top inset on scholar-detail + lecture-detail
  (ScrollView `contentInsetAdjustmentBehavior="never"`), (2) hid the native stack header for
  `listings/[slug]` and added a custom back button to the lecture-detail views, (3) made the
  embedded mini-player flush-fill the iOS native BottomAccessory pill (no border/shadow/radius).
- Root cause of the remaining iOS detail-header blank found: the single root `SafeAreaProvider`
  reports the full window inset (`insets.top` ≈ 59) to every screen, but the iOS formSheet already
  sits below the status bar, so `ScreenView`'s `paddingTop: insets.top` added a ~59pt canvas band
  above the back button. Fixed by adding `ScreenView includeTopInset` (default true) and setting
  `includeTopInset={Platform.OS !== "ios"}` on the three detail views (scholar + single + container),
  plus `contentInsetAdjustmentBehavior="never"` on `ListingContentView`'s ScrollView. TDD'd in
  `ScreenView.spec.tsx`. Native suite 83 suites / 393 tests green, typecheck + lint clean.
- The iOS mini-player pill experiment (replacing `containerEmbedded` with a new `containerEmbeddedIOS`
  style) broke the floating player (controls covered). Reverted `mini-player.tsx` to HEAD; the
  committed baseline renders correctly and mini-player + BottomAccessory specs pass 16/16. Stage 8b
  needs a fresh approach if the flush-fill pill is still desired.
- Stage 8b redone (committed `de459bcb`): instead of replacing the container geometry, kept
  `containerEmbedded` (`flex: 1`, `height: 52`) and stripped only the chrome — no
  borderRadius/backgroundColor/elevation/borderWidth, `backgroundColor: "transparent"`,
  `overflow: "hidden"`. Added `testID="mini-player-container"` on the root Pressable + a spec
  asserting the embedded container stays 52px tall with no border/background/elevation.
- Home cold-start section popping fixed (committed `dd57d6ad`): sections previously
  skeleton-gated on their own query (`isLoading && empty`), so each revealed as its own query
  resolved. Now `home.screen.tsx` computes a single `isHomeLoading` flag
  (`progress || feed || promo || scholars loading`) and gates `ScholarMedallionsRail` +
  `RecentlyAddedSection` on it; the section components skeleton-gate on `isLoading` alone. Hero
  still reveals immediately when locally-known content exists (continue-listening / featured item)
  and otherwise waits on `isHomeLoading`. Added `testID="hero-skeleton"`. TDD'd in a new
  `home.screen.spec.tsx` (all-loading → all skeletons; staggered → sections stay on skeleton until
  every query resolves; all-resolved → single reveal). Native suite 84 suites / 397 tests green,
  typecheck + lint clean.

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

- Status: Completed (verified — no code change required)
- Goal: Confirm the parchment theme matches the prototype palette (approx `#F7F2E7` background,
  `#B8872E` gold, `#2F6B54` jade, ivory surfaces). No theme picker work.
- Files:
  - `packages/design-tokens/src/colors/shared.ts` (ACCENT_PALETTES.parchment)
  - `apps/native/src/core/styles/theme/index.ts` (createThemeNative wiring)
- Changes: Verified the palette matches the prototype spec exactly (canvas `#F7F2E7`, gold
  `#B8872E`, jade `#2F6B54`, surface `#FFF`, surfaceRaised `#F1EAD9`, tonal borders/text). No
  token values diverged, so no adjustments were made.
- Blockers: None currently identified.
- Dependencies: None.
- Completion Criteria: ✅ palette values documented in stage notes; no token edits; typecheck green.
- Suggested Commit Message: `chore(tokens): verify parchment palette matches prototype (no-op)`

## Stage 5: Home tab + Explore sub-tab restructure + All Lectures

- Status: Completed
- Goal: Home becomes the landing tab (route `/`); Explore moves to `/explore/*` with sub-tabs
  Recent / Scholars / Curation / All Lectures.
- Files:
  - `packages/core-contracts/src/routes.ts` (+`explore.all: "/explore/all"` + routeDefinition)
  - `packages/core-contracts/src/navigation.ts` (SECTION_TABS.explore += all)
  - `packages/core-i18n/src/locales/en.json` + `ar.json` (`navigation.subnav.explore.all` + helper keys)
  - `packages/core-i18n/src/translation-helpers.ts` (SUBNAV_KEYS/FALLBACKS += all)
  - `apps/native/src/app/(tabs)/_layout.tsx` (Home trigger first; explore trigger `name="explore"`)
  - `apps/native/src/app/(tabs)/(home)/` (new group: `_layout.tsx`, `index.tsx` → HomeScreen)
  - `apps/native/src/app/(tabs)/explore/` (moved from `(explore)` parens group; `_layout.tsx`
    Stack now declares `all` screen and redirects `index`→`/explore/recent`; `all.tsx` added)
  - `apps/native/src/features/home/` (`screens/home.screen.tsx` placeholder, `index.ts`)
  - `apps/native/src/features/explore/screens/explore-all.screen.tsx` + `topic-chip-group` component
  - `apps/native/src/features/navigation/utils/tab-route-config.ts` + spec (`/`→home, `/explore/*`→explore, `all`)
  - `apps/native/src/features/navigation/components/BottomAccessory/*` (guards home section; specs updated)
  - `apps/native/src/features/navigation/utils/section-tab-icons.ts` (+`explore-all`)
- Changes: Added `explore.all` route + access definition; added `all` tab to shared `SECTION_TABS.explore`;
  added i18n keys and registered `all`/`library-big` icon. Split the landing tab into a Home group at
  `/` (search-bar composition moved here) and converted Explore into a real `/explore` folder with a
  Stack (`index` redirects to `/explore/recent`; `recent`/`scholar`/`curation`/`all` screens). Updated
  the native root-tab model (`tab-route-config.ts`) and its tests so `/`→home, `/explore*`→explore
  (default `recent`), `all` recognized, and legacy bare `/recent|/scholar|/curation` map to explore.
  `explore/all.tsx` renders `ExploreAllScreen` (topic chips via `GET /topics` + stub list; lecture
  rows land in Stage 7). `HomeScreen` currently renders the search bar + `ExploreRecentScreen`
  placeholder (hero/sections arrive in Stage 6).
- Blockers: None currently identified.
- Dependencies: Stage 4 (themes) only for visual consistency.
- Completion Criteria: ✅ App lands on Home tab (`/`); Explore tab at `/explore`; sub-tabs
  Recent/Scholars/Curation/All Lectures switch; native tests 367/367 pass; typecheck passes for
  native + web + core-contracts + core-i18n; lint clean.
- Suggested Commit Message: `feat(native): add home tab and restructure explore sub-tabs`

## Stage 6: Home screen

- Status: Completed
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

- Status: Completed
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

- Status: In Progress
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

## Stage 8a: Fix detail-screen top spacing and native-header gap

- Status: Completed (committed `b0bf0ebe`; verified on device)
- Goal: Remove the large empty space before the header on scholar-detail and lecture-detail and
  stop the double safe-area inset.
- Files:
  - `apps/native/src/features/listing/screens/scholar-detail/scholar-detail.screen.tsx`
  - `apps/native/src/features/listing/screens/lecture-detail/single-lecture-view.tsx`
  - `apps/native/src/features/listing/screens/lecture-detail/container-lecture-view.tsx`
  - `apps/native/src/features/listing/components/listing-content-view/listing-content-view.tsx`
  - `apps/native/src/shared/components/ScreenView/ScreenView.tsx`
  - `apps/native/src/shared/components/ScreenView/ScreenView.spec.tsx`
  - `apps/native/src/app/(content)/_layout.tsx`
  - `apps/native/src/features/listing/screens/lecture-detail/lecture-detail.screen.spec.tsx`
- Changes: `ScrollView contentInsetAdjustmentBehavior="never"` (+ `automaticallyAdjustsScrollIndicatorInsets={false}`)
  so the ScreenView safe-area padding isn't doubled by iOS's first-scroll-view adjustment; hid the
  native stack header for `listings/[slug]` (was an empty title bar) and added a custom back button
  to both lecture-detail views, mirroring the ScholarHeader pattern; trimmed header top padding.
  Root cause of the remaining blank: the formSheet sits below the status bar but the root
  `SafeAreaProvider` reports the full window inset, so `ScreenView` added a ~59pt canvas band above
  the back button. Added `ScreenView includeTopInset` (default true) and set
  `includeTopInset={Platform.OS !== "ios"}` on the three detail views; also set
  `contentInsetAdjustmentBehavior="never"` on `ListingContentView`'s ScrollView. TDD'd via two new
  `ScreenView.spec.tsx` cases (default applies inset, `includeTopInset={false}` omits it). Per iOS
  device review, added a 4px top margin (`theme.spacing.scale.xs`) to the three custom back buttons
  (single/container lecture views + ScholarHeader) so they don't sit flush against the sheet edge.
- Blockers: None currently identified.
- Dependencies: None.
- Completion Criteria: ✅ native typecheck + lint clean; lecture/scholar-detail specs pass; full
  suite 83 suites / 393 tests green.
- Suggested Commit Message: `fix(native): remove blank space above detail headers`

## Stage 8b: Make the mini-player fit the iOS BottomAccessory pill

- Status: Completed (committed `de459bcb`)
- Goal: On iOS the embedded mini-player is hosted inside the native BottomAccessory floating pill;
  the card's own border/radius/shadow/height made it look cramped and doubled-up inside the pill.
- Files:
  - `apps/native/src/features/audio/components/mini-player.tsx`
- Changes: The first attempt replaced `containerEmbedded` with a new `containerEmbeddedIOS` style
  (flex:1, transparent background, overflow hidden, no border/radius/shadow) — this broke the
  floating player (controls were covered and unclickable). Redone with a chrome-only approach: keep
  `containerEmbedded` (`flex: 1`, `height: 52`) and strip only the chrome (no
  borderRadius/backgroundColor/elevation/borderWidth; `backgroundColor: "transparent"`,
  `overflow: "hidden"`). Added `testID="mini-player-container"` on the root Pressable + a spec
  asserting the embedded container stays 52px tall with no border/background/elevation. Full native
  suite green (84 suites / 397 tests), typecheck + lint clean.
- Blockers: None currently identified. (Pill renders flush-fill on device per 8a review pass.)
- Dependencies: None.
- Completion Criteria: ✅ native typecheck + lint clean; mini-player + BottomAccessory specs pass;
  pill renders flush-fill on iOS device without covering controls.
- Suggested Commit Message: `fix(native): fit mini-player into iOS bottom accessory pill`

## Stage 8c: Fix Home cold-start section popping

- Status: Completed (committed `dd57d6ad`)
- Goal: On cold start each Home section showed its own skeleton and popped to content at a different
  time as its query resolved. Reveal the Home page in a single transition.- Files:
  - `apps/native/src/features/home/screens/home.screen.tsx`
  - `apps/native/src/features/home/screens/home.screen.spec.tsx` (new)
  - `apps/native/src/features/home/components/hero-section/hero-section.tsx`
  - `apps/native/src/features/home/components/scholar-medallions/scholar-medallions-rail.tsx`
  - `apps/native/src/features/home/components/recently-added-section/recently-added-section.tsx`
- Changes: `home.screen.tsx` now computes a single `isHomeLoading` flag
  (`progressLoading || feedLoading || promoLoading || scholarsLoading`) and passes it as the
  `isLoading` gate to `ScholarMedallionsRail` and `RecentlyAddedSection`; both sections now
  skeleton-gate on `isLoading` alone instead of `isLoading && empty`. The hero still reveals
  immediately when locally-known content exists (`activeContinueListeningItem` / `featuredItem`)
  and otherwise waits on `isHomeLoading`, so a brand-new user sees one whole-page skeleton reveal.
  Added `testID="hero-skeleton"` for assertions. TDD'd in a new `home.screen.spec.tsx` (mocks
  `@sd/domain-content`/`domain-search`/`domain-audio`, keeps real section components): all-loading →
  all skeletons; staggered (scholars still loading) → sections stay on skeleton until every query
  resolves; all-resolved → single reveal with no skeletons.
- Explore cleanup committed `b0537de2`: the tab is the unified
  `ExploreScreen`; old per-sub screens + routes + dead row components removed, old routes kept as
  `<Redirect href="/explore?sub=...">`, Explore defaults to Recent (prototype pill order), home
  quick-action/chip deep links fixed, and a TDD spec added for `ExploreScreen`.
- Blockers: None currently identified.
- Dependencies: Stages 6 (Home screen) only for the components being gated.
- Completion Criteria: ✅ `home.screen.spec.tsx` passes; full native suite green (84 suites / 397
  tests); typecheck + lint clean.
- Suggested Commit Message: `fix(native): reveal home sections in a single cold-start transition`

## Stage 8d: Remove stale per-sub Explore screens; keep canonical `/explore?sub=` deep links

- Status: Completed (committed `b0537de2`)
- Goal: The live Explore tab is the unified `ExploreScreen` (all four sub-tabs, All Lectures chips +
  in-place list, Curation empty state with CTA). The old per-sub screens (`explore-recent`,
  `explore-all`, `curation`, `explore-scholar`) and their routes were dead leftovers still on disk.
- Files:
  - `apps/native/src/app/(tabs)/explore/{recent,all,curation,scholar}.tsx` (rewritten as `<Redirect>`)
  - Deleted: `screens/explore-recent.screen.tsx`, `explore-all.screen.tsx`, `curation.screen.tsx`,
    `explore-scholar.screen.tsx`, their stub specs, and `components/explore-podcast-row/`,
    `explore-topic-row/`, `explore-scholar-row/` (used only by the old recent screen)
  - `apps/native/src/features/explore/index.ts` (barrel now exports only the live surface)
  - `apps/native/src/features/explore/screens/explore-screen.spec.tsx` (new)
  - `apps/native/src/features/explore/screens/explore-screen.tsx` (default `initialSub` → `recent`)
  - `apps/native/src/app/(tabs)/explore/index.tsx` (default `sub` → `recent`)
  - `apps/native/src/features/explore/components/explore-sub-tab-pills/explore-sub-tab-pills.tsx`
    (pill order now Recent, All, Scholars, Curation per prototype)
  - `apps/native/src/features/home/screens/home.screen.tsx` ("All Lectures" quick action + "all"
    category chip now push `/explore?sub=all`, since bare `/explore` opens Recent)
- Changes: Old routes now `<Redirect href="/explore?sub=...">` so stale deep links still resolve.
  Explore tab defaults to Recent (prototype order). Added a TDD spec covering default sub-tab,
  pill switching (Recent/All/Scholars/Curation), and `initialTopicSlug` chip pre-selection.
- Blockers: None currently identified.
- Dependencies: Stages 5–7 (the unified Explore screen being kept).
- Completion Criteria: ✅ `explore-screen.spec.tsx` passes; full native suite green (81 suites / 378
  tests); typecheck + lint clean; no remaining imports of deleted screens/rows.
- Suggested Commit Message: `refactor(native): drop stale per-sub explore screens, keep redirects`

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
