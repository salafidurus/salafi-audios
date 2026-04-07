# Improvement Plan

> **For agentic workers:** Use superpowers:executing-plans or superpowers:subagent-driven-development to implement this plan.
> **Status:** FINAL — ready to execute.

**Goal:** Establish a cross-platform design token recipe system, fix TypeScript deprecation noise, resolve styling inconsistencies, eliminate component duplication, implement missing screens (scholar detail, lecture detail), redesign the search home QuickBrowse, build the Feed feature, implement the Library feature, add a granular admin permission system, and create a separate `apps/livestreams` NestJS service with Telegram MTProto integration.

**Architecture notes:**

- API endpoints are task-specific and optimized per frontend section — no generic endpoints that over-fetch.
- `feature-catalog` is deleted in Phase 4e — 6 consuming route files are updated to `ScreenInProgress`; real implementations land in `feature-scholar` (Phase 6) and `feature-lecture` (Phase 7).
- Auth screens (sign-in, sign-up) use the full main shell layout on desktop (sidebar + footer visible).
- Admin is an `(admin)` route group inside `apps/web` and an admin section inside `apps/mobile`, both gated by granular permissions.
- `apps/livestreams` lives in the monorepo, shares `@sd/core-db`, deploys separately.
- The design token recipe system (Phase 0) is the foundation — Phases 2, 3, and all feature screens depend on it for correct accent semantics across web, mobile web, and native.

### Auth vs Public — Endpoint Reference

| Endpoint                                                      | Auth                    | Reason                                         |
| ------------------------------------------------------------- | ----------------------- | ---------------------------------------------- |
| `GET /scholars`, `/scholars/:slug`, `/scholars/:slug/content` | Public                  | Browse without sign-in                         |
| `GET /lectures/:id`                                           | Public                  | Play without sign-in                           |
| `GET /home/quickbrowse`                                       | Public + optional auth  | Adds `recentProgress` field when authenticated |
| `GET /feed`, `GET /feed/scholars`                             | Public                  | Personalization via client-passed hints        |
| `GET /live/active`, `/live/upcoming`, `/live/ended`           | Public                  | No reason to gate                              |
| `GET /topics`, `GET /search`                                  | Public                  | Core discovery                                 |
| `GET /me/library/*`, `GET /me/progress/*`                     | **Auth required** (API) | Anonymous = local storage, same UI             |
| `POST /me/progress/:lectureId`                                | **Auth required** (API) | Anonymous = write local storage                |
| `POST/DELETE /me/library/saved/:lectureId`                    | **Auth required** (API) | Anonymous = local saves                        |
| `POST/PATCH/DELETE /admin/*`                                  | **Auth + permission**   | Admin only                                     |

Anonymous users get a **fully functional library** — in-progress, saved, and completed sections all work, backed by local storage (AsyncStorage on native, localStorage on web). The API endpoints are only called when authenticated. On sign-in, local data is synced to the server: progress is upserted (server wins on conflict for position), saves are unioned. The client hooks are the abstraction boundary — the UI never knows which backend is active.

---

## Content Hierarchy Reference

The DB has three publishable content shapes. Every API endpoint, DTO, and UI component should use these exact terms consistently:

| Term                   | Definition                                             | DB shape                                                       |
| ---------------------- | ------------------------------------------------------ | -------------------------------------------------------------- |
| **Standalone Lecture** | A single playable audio lecture not part of any series | `Lecture` where `seriesId = null`                              |
| **Standalone Series**  | A series of lectures not inside any collection         | `Series` where `collectionId = null`                           |
| **Collection**         | A named grouping of series belonging to a Scholar      | `Collection` → contains `Series[]` → each contains `Lecture[]` |

**Key rules:**

- A `Lecture` may also belong to a `Series`. A "standalone lecture" means its only one lecture and no `seriesId`.
- A `Series` may or may not belong to a `Collection`. A "standalone series" means it has no `collectionId`, regardless of how many lectures it contains.
- A `Collection`, `Series`, and `Lecture` always belong to a `Scholar`.
- "Content" in feed/QuickBrowse/search results is a mix of all three shapes, each carrying enough metadata to render a card (title, scholar name, cover image, duration or lecture count).

**Naming in code:** Use these suffixes to avoid ambiguity:

- DTOs: `StandaloneLectureDto`, `StandaloneSeriesDto`, `CollectionSummaryDto`
- Component props: `contentKind: 'standalone_lecture' | 'standalone_series' | 'collection'`
- Feed discriminator: `kind: 'lecture' | 'series' | 'collection'` (feed uses short names for brevity; internal code may use long names)

---

## Domain vs Feature Rule

A `domain-*` package is created when **state or logic must be shared across multiple feature packages**. It owns: Zustand stores, local-storage adapters, sync logic, platform-agnostic business rules. It has no UI.

A `feature-*` package is created for **screen composition and UI**. It may depend on one or more domain packages for state, and on `@sd/shared` for primitives.

**Create a `domain-*` when:**

- Two or more feature packages need to read or write the same reactive state (e.g. playback position is read by `feature-playback`, `feature-lecture`, and the mini-player in `feature-navigation`)
- Local-storage / offline logic needs to be shared (e.g. progress tracking used by library, lecture detail, and QuickBrowse)
- Business rules are non-trivial and platform-agnostic

**Do NOT create a `domain-*` when:**

- The feature is purely fetch-and-render with no state shared across packages (e.g. `feature-scholar`, `feature-live`, `feature-feed`, `feature-admin`)
- The "domain" is just a single API call — that belongs in the feature's own `api/` folder

**Current domain packages and their consumers:**

| Domain package    | Owns                                                     | Consumed by                                                                                                                                             |
| ----------------- | -------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `domain-search`   | Search query state, filters, history                     | `feature-search`                                                                                                                                        |
| `domain-playback` | Audio engine, play/pause/seek/queue store                | `feature-playback`, `feature-lecture` (play trigger), `feature-navigation` (mini-player)                                                                |
| `domain-progress` | Progress store, local-storage adapter, post-sign-in sync | `feature-library`, `feature-lecture` (progress bar + save button), `feature-search` (progress indicator on results), `feature-progress` (UI components) |

**`feature-progress` vs `domain-progress`:** `domain-progress` owns state and logic; `feature-progress` owns the progress bar and resume badge UI components that consume that state. They are correctly separate.

**Features with no domain package (by design):**

- `feature-scholar`, `feature-feed`, `feature-live`, `feature-admin`, `feature-account`, `feature-legal`, `feature-support` — purely fetch-and-render; no cross-feature shared state

## Dependency Layer Reference

```
Layer 0 — design-tokens, core-env, core-contracts, core-db
Layer 1 — core-api, core-auth, core-config, core-styles
Layer 2 — shared (UI primitives only)
Layer 3 — domain-search, domain-playback, domain-progress
Layer 4 — feature-search, feature-auth, feature-navigation, feature-feed (new),
           feature-scholar (new), feature-lecture (new), feature-library,
           feature-progress, feature-playback, feature-account, feature-live,
           feature-admin (new), feature-downloads, feature-legal, feature-support
Layer 5 — apps/web, apps/mobile, apps/api, apps/livestreams (new)
```

**Required `domain-*` dependencies per feature (add to `package.json` during implementation):**

- `feature-library` → `@sd/domain-progress` (reads progress/saves store and local-storage adapter)
- `feature-lecture` → `@sd/domain-playback` (play trigger), `@sd/domain-progress` (save button state, progress indicator)
- `feature-playback` → `@sd/domain-playback` (owns the player UI over the engine)
- `feature-progress` → `@sd/domain-progress` (progress bar reads from progress store)
- `feature-search` → `@sd/domain-search` ✅ (already declared)

---

## Phase 0: Design Token Recipe System — Cross-Platform Brand Accent Foundation

**Problem:** The color system is fragmented across platforms. `apps/web/src/app/theme-css.ts` computes gradient recipes locally (e.g. `screenWashPrimary` is a radial gradient built inline). Native has no equivalent system — feature packages that need accent surfaces invent their own colors. When brand colors change, there is no single file to update. Web and native semantics drift silently.

**Architecture decision (from `cross-platform-ui-color-integration-plan.md`):**

- `@sd/design-tokens` is the ONLY source of truth for recipe logic — base tokens AND semantic accent recipes.
- `apps/web/src/app/theme-css.ts` becomes a pure projector: it reads recipe values from `@sd/design-tokens` and writes CSS custom properties — it computes nothing.
- Native consumes the same recipe objects directly from the Unistyles theme.
- `@sd/shared` exposes the reusable primitives that consume recipes (`RadialGlow`, `PrimaryButtonBackground`, promoted panel).
- Feature packages compose screens from those primitives — they do not define their own color systems.

**Native gradient strategy:**

- `expo-linear-gradient` for all directional fills (official Expo path, works on Android/iOS/tvOS/web)
- `react-native-svg` (already in repo) for a single constrained static radial glow overlay
- No additional gradient packages. No image assets. No per-screen custom gradient implementations.
- Radial glow rule: static, low-opacity, ≤3 stops, no `fx`/`fy` (Android limitation in `react-native-svg`)

**Usage constraints (applies to all screens, all platforms):**

- Max 1 promoted gradient surface per screen above the fold
- Max 2 secondary accent zones per screen
- Never stack multiple promoted gradients in the same viewport section
- Dense form shells, long text content, and list-heavy screens degrade to subtle fills

### Semantic recipe names

```
accent.primary.cta               — prominent actions, elevated surfaces
accent.primary.ctaHover
accent.primary.ctaActive
accent.primary.subtleSurface     — active nav item, selected chip background
accent.primary.focusRing
accent.secondary.subtleSurface   — chips, badges, informational panels
accent.secondary.supportingBadge
accent.mixed.heroSurface         — screen hero zones (auth, profile header)
accent.mixed.promotedPanel       — featured cards, promoted content zones
accent.selected.surface
accent.selected.content
accent.divider                   — branded rule/separator
```

### Files

- Create: `packages/design-tokens/src/recipes/web.ts` — CSS-ready recipe objects (background, borderColor, textColor, shadow, radial, linear)
- Create: `packages/design-tokens/src/recipes/native.ts` — composition-ready recipe objects (baseColor, linearGradient, radialGlow field names)
- Modify: `packages/design-tokens/src/index.web.ts` — export recipes
- Modify: `packages/design-tokens/src/index.native.ts` — export recipes
- Modify: `packages/design-tokens/src/theme/web.ts` — attach recipe projections to theme object
- Modify: `packages/design-tokens/src/theme/native.ts` — attach recipe projections to theme object
- Modify: `apps/web/src/app/theme-css.ts` — remove all inline gradient/recipe logic; project `webAccentRecipes` from `@sd/design-tokens` into CSS vars:
  - `--accent-primary-cta-bg`, `--accent-primary-cta-border`, `--accent-primary-cta-text`
  - `--accent-primary-subtle-surface`, `--accent-mixed-hero-surface`, `--accent-mixed-promoted-panel`
  - `--accent-selected-surface`, `--accent-selected-content`, `--accent-divider`
  - `--screen-wash-primary` (currently computed inline — move recipe to `recipes/web.ts`)
- Create: `packages/shared/src/components/RadialGlow/RadialGlow.native.tsx` — `react-native-svg` static radial overlay primitive
- Create: `packages/shared/src/components/AccentPanel/AccentPanel.web.tsx` — promoted panel using `--accent-mixed-promoted-panel`
- Create: `packages/shared/src/components/AccentPanel/AccentPanel.native.tsx` — `LinearGradient` + optional `RadialGlow` overlay
- Modify: `packages/shared/src/components/Button/Button.web.tsx` — primary variant uses `--accent-primary-cta-bg`
- Modify: `packages/shared/src/components/Button/Button.native.tsx` — primary variant uses `LinearGradient` from recipe

### Steps

- [ ] Survey current `packages/design-tokens/src/` directory structure — confirm where `colors/`, `theme/`, `index.web.ts`, `index.native.ts` live
- [ ] Create `packages/design-tokens/src/recipes/web.ts` — for each recipe define: `{ background, backgroundHover, borderColor, textColor, shadow }`. Use `color-mix(...)` and `var(--token-name)` references matching the existing CSS var naming in `theme-css.ts`. Move the `screenWashPrimary` radial gradient computation here.
- [ ] Create `packages/design-tokens/src/recipes/native.ts` — for each recipe define: `{ baseColorToken, borderColorToken, shadowToken, linearGradient: { colors, start, end }, radialGlow?: { center, radius, centerColorToken } }`
- [ ] Export recipes from `packages/design-tokens/src/index.web.ts` and `index.native.ts`
- [ ] Attach recipes to theme objects in `theme/web.ts` and `theme/native.ts` so they are accessible via `useUnistyles().theme.recipes.*`
- [ ] Rewrite `apps/web/src/app/theme-css.ts` — remove all inline gradient computations; import `webAccentRecipes` from `@sd/design-tokens`; project each recipe field to a CSS var. Verify `--screen-wash-primary` still works correctly on the auth page and search home.
- [ ] Create `packages/shared/src/components/RadialGlow/RadialGlow.native.tsx` using `react-native-svg`. Must not use `fx`/`fy`. Two or three stops only. `pointerEvents="none"`, `StyleSheet.absoluteFillObject`.
- [ ] Create `AccentPanel` web and native variants in `@sd/shared`
- [ ] Update `Button` primary variant on web and native to consume recipe tokens instead of hardcoded values
- [ ] Run `pnpm typecheck` across all packages
- [ ] Run `pnpm dev:web` — verify no visual regressions (auth page, search home, nav active state)
- [ ] Run `pnpm dev:mobile` — verify no visual regressions
- [ ] Commit: `feat(design-tokens): add semantic accent recipe layer, make theme-css.ts a pure projector`

---

## Phase 1: TypeScript — Remove Deprecation Noise

**Problem:** Individual packages and apps set `baseUrl: "."` on top of `moduleResolution: "Bundler"`. TypeScript 5.9 warns that `baseUrl` is deprecated and will stop working in TypeScript 7. The `packages.json` base tsconfig already has `moduleResolution: "Bundler"` — the fix is to replace `baseUrl` with `paths` entries that resolve relative to the tsconfig file, which TypeScript 5+ supports without needing `baseUrl`.

**Exception:** `apps/api` uses `module: "commonjs"` (NestJS requirement). There `baseUrl` is replaced with explicit `paths` and `moduleResolution` is left as default (`node`) — do not change it to `Bundler`.

### Files

- Modify: every `packages/*/tsconfig.json` that sets `baseUrl`
- Modify: `apps/web/tsconfig.json`
- Modify: `apps/mobile/tsconfig.json` (if it sets `baseUrl`)
- Modify: `apps/api/tsconfig.json`
- Reference: `packages/util-config/tsconfig/packages.json` (already correct — do not touch)

### Steps

- [ ] Grep all tsconfig files for `"baseUrl"`:
  ```bash
  grep -r '"baseUrl"' C:/dev/salafi-audios --include="tsconfig*.json" -l
  ```
- [ ] For each package tsconfig that has `"baseUrl": "."` and uses `@/` path aliases: replace with:
  ```json
  {
    "compilerOptions": {
      "paths": {
        "@/*": ["./src/*"]
      }
    }
  }
  ```
  (Remove `baseUrl` entirely — TypeScript 5+ resolves `paths` relative to tsconfig location when `baseUrl` is absent)
- [ ] For each package tsconfig that has `"baseUrl": "."` but does NOT use `@/` aliases: simply remove `baseUrl` with no replacement
- [ ] For `apps/api/tsconfig.json`: remove `baseUrl: "./"`, add `"paths": { "@/*": ["./src/*"] }` if any `@/` imports exist in the API, otherwise just remove `baseUrl`
- [ ] For `apps/web/tsconfig.json`: remove `baseUrl: "."` — it already has `moduleResolution: "Bundler"` via the next.json base
- [ ] Run `pnpm typecheck` across all packages — fix any import paths that broke because they were relying on `baseUrl` resolution rather than explicit `paths`
- [ ] Run `pnpm build` — verify no build errors
- [ ] Commit: `chore(tsconfig): replace baseUrl with paths to eliminate TS deprecation warnings`

---

## Phase 2: Auth Screens — Restore Full Shell Layout on Desktop

**Problem:** Sign-in and sign-up pages currently live in an `(auth)` route group with a minimal layout (no sidebar, no footer). On desktop the result is a grey page with a jarring radial gradient shard line (`screen-wash-primary` applied to the `.page` class in `auth-form.module.css`). The user wants the full app chrome (sidebar + footer) on desktop for these pages.

**Fix:**

1. Move sign-in/sign-up routes into the `(main)` layout group so they share the sidebar + footer.
2. Remove `background: var(--screen-wash-primary), var(--surface-canvas)` from `auth-form.module.css` — the page background is provided by the shell, not the screen itself.
3. The centered card layout is kept; only the page-level background gradient is removed.
4. `TopAuthStrip` already conditionally hides on auth routes — remove that special-casing since auth routes now use the main shell like any other page.

### Files

- Move: `apps/web/src/app/(auth)/sign-in/` → `apps/web/src/app/(main)/(auth)/sign-in/`
- Move: `apps/web/src/app/(auth)/sign-up/` → `apps/web/src/app/(main)/(auth)/sign-up/`
- Delete: `apps/web/src/app/(auth)/layout.tsx` (no longer needed)
- Modify: `packages/feature-auth/src/screens/auth-form.module.css` — remove `background` from `.page`, keep everything else
- Modify: `packages/feature-navigation/src/components/top-auth-strip/top-auth-strip.desktop.web.tsx` — remove the `AUTH_ROUTES` check and the early return for auth paths (**Note:** Phase 4a also modifies this file to remove the `isTablet` branch. If Phase 4a runs first, skip that step here — it will already be gone.)

### Steps

- [ ] Move the `sign-in` and `sign-up` folders into `apps/web/src/app/(main)/(auth)/`
- [ ] Delete `apps/web/src/app/(auth)/layout.tsx`
- [ ] In `auth-form.module.css`, change `.page` from:
  ```css
  background: var(--screen-wash-primary), var(--surface-canvas);
  ```
  to — remove the `background` property entirely (the shell provides the canvas)
- [ ] In `top-auth-strip.desktop.web.tsx` remove the `AUTH_ROUTES` constant and the early-return block that hides the strip on auth paths
- [ ] Run `pnpm dev:web` — verify sign-in and sign-up render with sidebar and footer visible, no gradient, card centered in content area
- [ ] Run `pnpm typecheck:api+web`
- [ ] Commit: `fix(feature-auth): restore full shell layout on auth pages, remove gradient`

---

## Phase 3: Styling Fixes — Search Processing Surface Consistency

**Problem:** The search processing screen's sticky header (search input + filter row) uses `bg-[var(--chrome-surface)]` — a semi-transparent color-mix value. The results area below uses the page canvas. These are different surface values producing a visible split. The `TopAuthStrip` is intentionally transparent and stays that way. The search header should also avoid a solid background but needs to look consistent with the rest of the page when scrolling.

**Fix:** The sticky header should use `backdrop-blur` + a very light `chrome-surface` tint only when content is scrolled underneath it. When nothing is scrolled behind it, it should appear seamless with the canvas. Use `supports(backdrop-filter)` CSS with a fallback.

### Files

- Modify: `packages/feature-search/src/screens/search-processing/search-processing.screen.desktop.web.tsx`
- Modify: `packages/feature-search/src/screens/search-processing/search-processing.screen.mobile.web.tsx`

### Steps

- [ ] In `search-processing.screen.desktop.web.tsx`, in the sticky `<div>` replace:
  ```
  bg-[var(--chrome-surface)] backdrop-blur-sm
  ```
  with a style that uses `color-mix(in srgb, var(--surface-canvas) 80%, transparent)` + `backdrop-blur-sm`. Do NOT use Tailwind's `/80` alpha modifier with CSS variables — it only works when the variable is in RGB channel format, which `--surface-canvas` is not. Use inline style or a CSS module rule instead:
  ```css
  background: color-mix(in srgb, var(--surface-canvas) 80%, transparent);
  backdrop-filter: blur(8px);
  ```
- [ ] Apply same treatment to the mobile web variant
- [ ] Verify in both light and dark mode that no hard surface line is visible between the header and results
- [ ] Commit: `fix(feature-search): remove surface split between search header and results`

---

## Phase 4: Component Deduplication — Cross-Package Cleanup

**Problem:** Several components and patterns are duplicated or mis-placed across feature packages:

1. **`TopAuthStrip` tablet/desktop split** — two JSX components that differ only by CSS module; tablet = mobile so the tablet variant is removed entirely
2. **`TouchableOpacity` usage** — multiple files use `TouchableOpacity`; project rule is `Pressable` everywhere
3. **`feature-search/TitleText`** — a thin `Text` wrapper for a typography token; `@sd/shared` should own typography primitives, not feature packages
4. **`ScreenView` adoption** — most screens are scaffolded without `ScreenView`; rule documented for all future phases
5. **`feature-catalog` deletion** — the package is unused dead code; 6 route files that import it are updated to `ScreenInProgress` before deletion

### 4a — TopAuthStrip: Remove Tablet Variant

**Context:** In this project, tablet breakpoint is treated as mobile (uses Expo Router navigation, not the web shell). `top-auth-strip.desktop.web.tsx` is the responsive dispatcher — it already returns `null` for `isMobile`. The `isTablet` branch currently renders `TopAuthStripTablet`, but since tablet = mobile, no top auth strip is needed at the tablet breakpoint either. The correct fix is to remove the `isTablet` branch entirely (falls through to `null`), not to redirect it to `TopAuthStripWeb`.

### Files

- Delete: `packages/feature-navigation/src/components/top-auth-strip/top-auth-strip.tablet.web.tsx`
- Delete: `packages/feature-navigation/src/components/top-auth-strip/top-auth-strip.tablet.module.css`
- Modify: `packages/feature-navigation/src/components/top-auth-strip/top-auth-strip.desktop.web.tsx` — remove `isTablet` import from `useResponsive`, remove the `if (isTablet) return <TopAuthStripTablet />` block and the `TopAuthStripTablet` import; only desktop (non-mobile, non-tablet) renders the strip
- Modify: `packages/feature-navigation/src/index.web.ts` — remove `TopAuthStripTablet` export if present

### Steps

- [ ] Read `top-auth-strip.desktop.web.tsx` — confirm the `isTablet` branch is the only usage of `TopAuthStripTablet`
- [ ] Remove the `isTablet` check and the `<TopAuthStripTablet />` branch — the component now returns `null` for both mobile and tablet, and `<TopAuthStripWeb />` only for desktop
- [ ] Remove the `TopAuthStripTablet` import from the dispatcher
- [ ] Delete `top-auth-strip.tablet.web.tsx` and `top-auth-strip.tablet.module.css`
- [ ] Remove `TopAuthStripTablet` from the package index exports
- [ ] Run `pnpm typecheck:api+web` and `pnpm dev:web` — verify strip shows only on desktop, not on tablet viewport
- [ ] Commit: `refactor(feature-navigation): remove tablet TopAuthStrip variant (tablet = mobile, no strip needed)`

### 4b — Replace TouchableOpacity with Pressable

Only migrate files that will NOT be completely rewritten in later phases. Files that are just scaffolds (feed, library, live, lecture, playback screens) will be written from scratch in Phases 7–12 using `Pressable` from the start — migrating them now and then discarding the work is wasteful.

**Migrate now (real implementations, not scheduled for rewrite):**

- `packages/feature-auth/src/screens/sign-in/sign-in.screen.native.tsx`
- `packages/feature-auth/src/screens/sign-up/sign-up.screen.native.tsx`
- `packages/feature-account/src/screens/account.screen.native.tsx`
- `packages/feature-downloads/src/components/download-button/download-button.native.tsx`
- `packages/feature-navigation/src/components/CustomTabBar/CustomTabBar.native.tsx`
- `packages/feature-navigation/src/components/SubsectionBarHost/SubsectionBarHost.native.tsx`
- `packages/feature-search/src/components/BrowseCard/BrowseCard.native.tsx`
- `packages/feature-search/src/components/QuickBrowse/QuickBrowse.native.tsx`
- `packages/feature-search/src/components/SearchButton/SearchButton.native.tsx`
- `packages/feature-search/src/components/SearchFilter/SearchFilter.native.tsx`
- `packages/feature-search/src/components/SearchInput/SearchInput.native.tsx`
- `packages/feature-search/src/components/SearchResultEmpty/SearchResultEmpty.native.tsx`
- `packages/feature-search/src/components/SearchResultItem/SearchResultItem.native.tsx`
- `packages/feature-search/src/components/SearchResultsList/SearchResultsList.native.tsx`

**Skip now — will be rewritten in their phases using Pressable from the start:**

- `feature-feed` screens → Phase 10
- `feature-library` screens → Phase 9
- `feature-live` screens → Phase 12
- `feature-lecture` screens → Phase 7
- `feature-playback` screens → Phase 17–19 (architecture plan)

### Steps

- [ ] Global search: `grep -r "TouchableOpacity" packages/ --include="*.tsx" -l` — confirm the full list
- [ ] For each file: replace `import { ..., TouchableOpacity, ... } from 'react-native'` → add `Pressable` to the import, replace `<TouchableOpacity` with `<Pressable`, replace `onPress` props (already compatible), replace `activeOpacity` prop with `style={({ pressed }) => [styles.x, pressed && styles.pressed]}` pattern where needed
- [ ] Run `pnpm typecheck:mobile` — fix any type errors
- [ ] Commit: `fix(native): replace TouchableOpacity with Pressable across all feature packages`

### 4c — Create AppText Typography Primitive in @sd/shared

**Problem:** Feature packages define one-off `Text` wrappers for specific typography tokens (e.g. `feature-search/TitleText` wraps `theme.typography.displayMd`). When another screen needs the same typographic treatment, it either copies the wrapper or uses raw `Text` with an inline style. There is no shared, variant-aware typography primitive.

**Fix:** Create `AppText` in `@sd/shared` with a `variant` prop that maps to design token typography scales. `TitleText` in `feature-search` becomes a thin alias using the correct variant. Any future screen that needs a specific typographic role uses `AppText` rather than inventing a wrapper.

### Files

- Create: `packages/shared/src/components/AppText/AppText.native.tsx`
- Create: `packages/shared/src/components/AppText/AppText.web.tsx`
- Modify: `packages/shared/src/components/AppText/index.ts` — re-export
- Modify: `packages/shared/src/index.native.ts` — export `AppText`
- Modify: `packages/shared/src/index.web.ts` — export `AppText`
- Modify: `packages/feature-search/src/components/TitleText/TitleText.native.tsx` — delegate to `<AppText variant="displayMd">`
- Modify: `packages/feature-search/src/components/TitleText/TitleText.mobile.web.tsx` — delegate to `<AppText variant="displayMd">`
- Modify: `packages/feature-search/src/components/TitleText/TitleText.desktop.web.tsx` — delegate to `<AppText variant="displayMd">`

### Variants to cover (matching existing `theme.typography` keys)

```ts
type AppTextVariant =
  | "displayLg"
  | "displayMd"
  | "displaySm"
  | "titleLg"
  | "titleMd"
  | "titleSm"
  | "bodyLg"
  | "bodyMd"
  | "bodySm"
  | "labelLg"
  | "labelMd"
  | "labelSm"
  | "caption";
```

### Steps

- [ ] Read `packages/design-tokens/src/typography/` (or wherever `theme.typography` keys are defined) — confirm the exact variant names available
- [ ] Create `AppText.native.tsx`:

  ```tsx
  import { Text, type TextStyle } from 'react-native';
  import { StyleSheet, useUnistyles } from 'react-native-unistyles';

  export type AppTextVariant = 'displayLg' | 'displayMd' | /* ... */;

  export type AppTextProps = {
    variant: AppTextVariant;
    children: React.ReactNode;
    style?: TextStyle;
    numberOfLines?: number;
  };

  export function AppText({ variant, children, style, numberOfLines }: AppTextProps) {
    const { theme } = useUnistyles();
    return (
      <Text
        style={[{ color: theme.colors.content.primary, ...theme.typography[variant] }, style]}
        numberOfLines={numberOfLines}
      >
        {children}
      </Text>
    );
  }
  ```

- [ ] Create `AppText.web.tsx` — same shape, uses Unistyles `Text` from `react-native-unistyles/components/native/Text` with `_web` overrides for `lineHeight` (string coercion)
- [ ] Export from `packages/shared/src/index.native.ts` and `index.web.ts`
- [ ] Update `TitleText.native.tsx`, `TitleText.mobile.web.tsx`, `TitleText.desktop.web.tsx` — each becomes a 3-line wrapper that renders `<AppText variant="displayMd">`
- [ ] Run `pnpm typecheck:mobile` and `pnpm typecheck:api+web`
- [ ] Commit: `feat(shared): add AppText typography primitive with variant prop; wire TitleText`

### 4d — ScreenView Adoption Rule

**Problem:** `ScreenViewMobileNative` and `ScreenViewWeb` exist in `@sd/shared` and provide: safe area insets, horizontal page padding (`spacing.layout.pageX`), canvas background, and `backgroundVariant` support (canvas/primaryWash/secondaryWash/mixedWash). Currently only 4 screens use them — all inside `feature-search`. The remaining 20+ native screen files are scaffolded with `flex: 1` + hardcoded padding and inline colours, duplicating layout logic that `ScreenView` already handles.

**Rule for all future screen implementations (Phases 6–13):**

- Every native screen root must be wrapped with `<ScreenViewMobileNative>` (or `<ScreenViewMobileNative backgroundVariant="...">` for washes)
- Every desktop/mobile-web screen must use `<ScreenViewWeb>` as the root, not a raw `View` or `div` with manual padding
- The fullscreen player (`player-fullscreen.screen.native.tsx`) is the only intentional exception — it manages its own insets because it needs edge-to-edge behaviour

**Currently implemented screens that already bypass ScreenView (and need it added when they are properly built):**

| Screen file                                            | Platform | Status                             |
| ------------------------------------------------------ | -------- | ---------------------------------- |
| `feature-account/account.screen.native.tsx`            | native   | scaffold — adopt in Phase 13       |
| `feature-account/account-profile.screen.native.tsx`    | native   | scaffold — adopt in Phase 13       |
| `feature-auth/sign-in.screen.native.tsx`               | native   | scaffold — adopt when implementing |
| `feature-auth/sign-up.screen.native.tsx`               | native   | scaffold — adopt when implementing |
| `feature-feed/feed.screen.native.tsx`                  | native   | scaffold — adopt in Phase 10       |
| `feature-feed/feed-following.screen.native.tsx`        | native   | scaffold — adopt in Phase 10       |
| `feature-feed/feed-recent.screen.native.tsx`           | native   | scaffold — adopt in Phase 10       |
| `feature-lecture/lecture-detail.screen.native.tsx`     | native   | scaffold — adopt in Phase 7        |
| `feature-library/library.screen.native.tsx`            | native   | scaffold — adopt in Phase 9        |
| `feature-library/library-completed.screen.native.tsx`  | native   | scaffold — adopt in Phase 9        |
| `feature-library/library-saved.screen.native.tsx`      | native   | scaffold — adopt in Phase 9        |
| `feature-live/live.screen.native.tsx`                  | native   | scaffold — adopt in Phase 12       |
| `feature-live/live-ended.screen.native.tsx`            | native   | scaffold — adopt in Phase 12       |
| `feature-live/live-scheduled.screen.native.tsx`        | native   | scaffold — adopt in Phase 12       |
| `feature-legal/privacy.screen.native.tsx`              | native   | scaffold — adopt in Phase 13       |
| `feature-legal/terms-of-use.screen.native.tsx`         | native   | scaffold — adopt in Phase 13       |
| `feature-playback/player-fullscreen.screen.native.tsx` | native   | **intentional exception**          |

Desktop/web screens to adopt `ScreenViewWeb` in their respective phases (same pattern — all currently scaffolded without it).

### Steps

- [ ] No code changes in this phase — this is a rule entry to be followed in every subsequent phase
- [ ] In each phase (6–13), when implementing or replacing a scaffolded screen: wrap root with `ScreenViewMobileNative` or `ScreenViewWeb` before adding any content
- [ ] Use the `backgroundVariant` prop for accent surfaces rather than setting `backgroundColor` manually

### 4e — Delete feature-catalog

**Problem:** `feature-catalog` is a dead package with scaffolded `scholar-detail`, `series-detail`, and `collection-detail` screens that will be properly replaced by `feature-scholar` (Phase 6) and `feature-lecture` (Phase 7). It is imported in 6 route files (3 web, 3 mobile) — those imports need to be replaced before the package can be deleted.

**Importing route files:**

- `apps/web/src/app/(main)/scholars/[slug]/page.tsx` — imports `ScholarDetailResponsiveScreen`
- `apps/web/src/app/(main)/collections/[id]/page.tsx` — imports `CollectionDetailResponsiveScreen`
- `apps/web/src/app/(main)/series/[id]/page.tsx` — imports `SeriesDetailResponsiveScreen`
- `apps/mobile/src/app/(tabs)/(search)/scholar/[slug].tsx` — imports `ScholarDetailMobileNativeScreen`
- `apps/mobile/src/app/(tabs)/(search)/collection/[id].tsx` — imports `CollectionDetailMobileNativeScreen`
- `apps/mobile/src/app/(tabs)/(search)/series/[id].tsx` — imports `SeriesDetailMobileNativeScreen`

### Steps

- [ ] In each of the 6 route files above: replace the `@sd/feature-catalog` import and the screen component with an inline `ScreenInProgress` from `@sd/shared`:
  ```tsx
  import { ScreenInProgress } from "@sd/shared";
  export default function ScholarPage() {
    return <ScreenInProgress />;
  }
  ```
- [ ] Remove `"@sd/feature-catalog": "workspace:*"` from `apps/web/package.json` and `apps/mobile/package.json`
- [ ] Delete the entire `packages/feature-catalog/` directory
- [ ] Run `pnpm install` to clean workspace links
- [ ] Run `pnpm typecheck:api+web` and `pnpm typecheck:api+mobile` — confirm clean
- [ ] Commit: `refactor: delete feature-catalog, replace route imports with ScreenInProgress placeholders`

---

## Phase 5: Admin Permission System — DB Schema + Guards

**Problem:** The current schema has `User.role: String` (a single string, either "user" or "admin") and `UserScholarRole` (scholar editing roles). There is no granular admin permission system. Not all admins should have the same access — a livestreams admin should not be able to manage users; a content editor should not be able to grant admin rights.

### Permission constants (defined in `@sd/core-contracts`)

```
manage:scholars       — create/edit/deactivate scholars
manage:topics         — create/edit/delete topics
manage:content        — publish/archive/reorder collections, series, lectures
manage:livestreams    — configure Telegram channels, manage live sessions
manage:users          — ban/unban users, view user list
manage:admin          — grant/revoke admin permissions (super admin only)
```

### DB changes

**New model in `packages/core-db/prisma/schema.prisma`:**

```prisma
model AdminPermission {
  userId     String
  permission String
  grantedAt  DateTime @default(now())
  grantedById String?

  user      User  @relation(fields: [userId], references: [id], onDelete: Cascade)
  grantedBy User? @relation("AdminPermissionGranter", fields: [grantedById], references: [id], onDelete: SetNull)

  @@id([userId, permission])
  @@index([userId])
  @@index([permission])
}
```

Also add the inverse relations to `User`.

### API changes

- New guard: `apps/api/src/shared/guards/admin-permission.guard.ts` — reads `AdminPermission` for the current user, checks requested permission
- New decorator: `@RequiresPermission('manage:scholars')` etc.
- New module: `apps/api/src/modules/admin-permissions/` — endpoints for granting/revoking permissions (requires `manage:admin`)

### Files

- Modify: `packages/core-db/prisma/schema.prisma` — add `AdminPermission` model, add relations to `User`
- Create: `packages/core-db/prisma/migrations/` — new migration for `AdminPermission`
- Create: `packages/core-contracts/src/types/admin.ts` — `AdminPermissionDto`, permission string union type
- Modify: `packages/core-contracts/src/index.ts` — export admin types
- Create: `apps/api/src/shared/guards/admin-permission.guard.ts`
- Create: `apps/api/src/shared/decorators/requires-permission.decorator.ts`
- Create: `apps/api/src/modules/admin-permissions/admin-permissions.module.ts`
- Create: `apps/api/src/modules/admin-permissions/admin-permissions.controller.ts`
- Create: `apps/api/src/modules/admin-permissions/admin-permissions.service.ts`
- Create: `apps/api/src/modules/admin-permissions/admin-permissions.repo.ts`
- Modify: `apps/api/src/app.module.ts` — add `AdminPermissionsModule`

### Steps

- [ ] Add `AdminPermission` model to `packages/core-db/prisma/schema.prisma` (see above)
- [ ] Add `adminPermissions` and `adminPermissionsGranted` relations to `User` model
- [ ] Run `pnpm --filter core-db migrate:create-only` — name: `add_admin_permissions`
- [ ] Run `pnpm --filter core-db prisma:generate`
- [ ] Define `ADMIN_PERMISSIONS` constant in `packages/core-contracts/src/types/admin.ts`:
  ```ts
  export const ADMIN_PERMISSIONS = [
    "manage:scholars",
    "manage:topics",
    "manage:content",
    "manage:livestreams",
    "manage:users",
    "manage:admin",
  ] as const;
  export type AdminPermission = (typeof ADMIN_PERMISSIONS)[number];
  ```
- [ ] Create `RequiresPermission` decorator that attaches the permission string to route metadata
- [ ] Create `AdminPermissionGuard` that resolves the current user, queries `AdminPermission`, and throws `ForbiddenException` if the permission is absent
- [ ] Create `AdminPermissionsModule` with CRUD endpoints — `GET /admin/permissions/:userId`, `POST /admin/permissions/:userId`, `DELETE /admin/permissions/:userId/:permission` — all gated by `manage:admin`
- [ ] Add `AdminPermissionsModule` to `AppModule`
- [ ] Run `pnpm --filter api typecheck` and `pnpm --filter api test`
- [ ] Commit: `feat(admin): add granular AdminPermission model and guard`

---

## Phase 6: Scholar Detail — API Endpoint + Screens

**Problem:** Scholar detail pages are completely missing on web and mobile. The DB has all the data (bio, country, mainLanguage, imageUrl, social links, their content).

### API endpoint

**New module:** `apps/api/src/modules/scholars/`

- `GET /scholars` — list active scholars (name, slug, imageUrl, mainLanguage, isKibar, publishedLectureCount)
- `GET /scholars/:slug` — scholar detail (all fields + stats: series count, lecture count, total duration)
- `GET /scholars/:slug/content` — their published content grouped: `{ collections, standaloneSeries, standaloneLectures }` — paginated

Each endpoint returns only what the frontend needs, nothing more.

### New package: `feature-scholar`

```
packages/feature-scholar/
  package.json
  src/
    index.web.ts
    index.native.ts
    screens/
      scholar-detail/
        scholar-detail.screen.desktop.web.tsx
        scholar-detail.screen.mobile.web.tsx
        scholar-detail.screen.native.tsx
    components/
      scholar-header/
        scholar-header.web.tsx
        scholar-header.native.tsx
      scholar-content-list/
        scholar-content-list.web.tsx
        scholar-content-list.native.tsx
      social-links/
        social-links.web.tsx
        social-links.native.tsx
    hooks/
      use-scholar-detail.ts
    api/
      scholar.api.ts
    types/
      index.ts
    unistyles.d.ts
```

### Route files

**Web:** `apps/web/src/app/(main)/scholars/[slug]/page.tsx`
**Mobile:** `apps/mobile/src/app/(tabs)/(search)/scholar/[slug].tsx`

### Steps

- [ ] Create `apps/api/src/modules/scholars/` with controller, service, repo, DTOs
- [ ] `GET /scholars` returns: `{ scholars: ScholarListItemDto[] }` where `ScholarListItemDto` = `{ id, slug, name, imageUrl, mainLanguage, isKibar, lectureCount }`
- [ ] `GET /scholars/:slug` returns: `ScholarDetailDto` = all fields + `{ lectureCount, seriesCount, totalDurationSeconds }`
- [ ] `GET /scholars/:slug/content` returns: `{ collections: CollectionSummaryDto[], standaloneSeries: SeriesSummaryDto[], standaloneLectures: LectureSummaryDto[], nextCursor?: string }`
- [ ] All three endpoints are `@Public()` — no auth required
- [ ] Add `ScholarsModule` to `apps/api/src/app.module.ts`
- [ ] Add types to `packages/core-contracts/src/types/`
- [ ] Create `packages/feature-scholar/` with the structure above
- [ ] Implement `use-scholar-detail.ts` — TanStack Query hook using `useApiQuery`
- [ ] Implement `scholar-detail.screen.desktop.web.tsx` — two-column layout: left = `ScholarHeader` (image, name, bio, social links, stats), right = `ScholarContentList` (tabbed: Collections / Series / Lectures). Wrap with `<ScreenViewWeb>`.
- [ ] Implement `scholar-detail.screen.mobile.web.tsx` — single column, stacked. Wrap with `<ScreenViewWeb>`.
- [ ] Implement `scholar-detail.screen.native.tsx` — `ScrollView` inside `<ScreenViewMobileNative>` with `ScholarHeader` + sectioned content list
- [ ] In `src/index.web.ts`, export both platform variants. The web route uses the responsive pattern — export `ScholarDetailDesktopWebScreen` and `ScholarDetailMobileWebScreen` separately; the route file selects via the `.desktop.web.tsx` / `.mobile.web.tsx` extension resolution (Next.js does not do this automatically — add a thin `scholar-detail.screen.responsive.web.tsx` that uses `useResponsive()` to switch between them, and export that as `ScholarDetailScreen`).
- [ ] Add web route:
  ```tsx
  // apps/web/src/app/(main)/scholars/[slug]/page.tsx
  import { ScholarDetailScreen } from "@sd/feature-scholar";
  export default function ScholarPage({ params }: { params: { slug: string } }) {
    return <ScholarDetailScreen slug={params.slug} />;
  }
  ```
- [ ] Add mobile route — reads `useLocalSearchParams`, passes `slug` to `ScholarDetailMobileNativeScreen`
- [ ] Add `routes.scholars` to `packages/core-contracts/src/routes.ts`
- [ ] Run `pnpm typecheck:api+web` and `pnpm typecheck:api+mobile`
- [ ] Commit: `feat(feature-scholar): add scholar detail screens and API endpoints`

---

## Phase 7: Lecture Detail — API Endpoint + Screens

**Problem:** Lecture detail pages are completely missing. The DB has title, description, duration, topics, audio asset(s), scholar info.

### API endpoint

**New module:** `apps/api/src/modules/lectures/`

- `GET /lectures/:id` — lecture detail: title, description, duration, language, publishedAt, scholar (name + slug + imageUrl), topics, primaryAudioAsset (url, format, bitrateKbps, durationSeconds), seriesContext (if in a series: series title + slug, prev/next lecture)

Single endpoint, returns everything the detail page needs.

### New package: `feature-lecture`

```
packages/feature-lecture/
  package.json
  src/
    index.web.ts
    index.native.ts
    screens/
      lecture-detail/
        lecture-detail.screen.desktop.web.tsx
        lecture-detail.screen.mobile.web.tsx
        lecture-detail.screen.native.tsx
    components/
      lecture-meta/
        lecture-meta.web.tsx
        lecture-meta.native.tsx
      series-context-bar/
        series-context-bar.web.tsx
        series-context-bar.native.tsx
      topic-chips/
        topic-chips.web.tsx
        topic-chips.native.tsx
    hooks/
      use-lecture-detail.ts
    api/
      lecture.api.ts
    types/
      index.ts
    unistyles.d.ts
```

### Route files

**Web:** `apps/web/src/app/(main)/lectures/[id]/page.tsx`
**Mobile:** `apps/mobile/src/app/(tabs)/(search)/lecture/[id].tsx`

### Steps

- [ ] Create `apps/api/src/modules/lectures/` — controller, service, repo, DTOs
- [ ] `GET /lectures/:id` is `@Public()`, returns `LectureDetailDto`
- [ ] `LectureDetailDto` includes: `{ id, slug, title, description, language, durationSeconds, publishedAt, scholar: ScholarRefDto, topics: TopicRefDto[], primaryAudioAsset: AudioAssetDto | null, seriesContext: SeriesContextDto | null }`
- [ ] `SeriesContextDto` = `{ seriesId, seriesTitle, seriesSlug, prevLecture: LectureRefDto | null, nextLecture: LectureRefDto | null }`
- [ ] Add `LecturesModule` to `apps/api/src/app.module.ts`
- [ ] Add types to `packages/core-contracts/src/types/`
- [ ] Create `packages/feature-lecture/` with structure above; add `@sd/domain-playback` and `@sd/domain-progress` to its `package.json`
- [ ] `lecture-detail.screen.desktop.web.tsx` — wrap with `<ScreenViewWeb>`; left column: lecture title, scholar chip, topic chips, description, series context bar (prev/next); right column: play button (`onPlay` prop — calls `domain-playback` play action, which is already implemented; wire it now)
- [ ] `lecture-detail.screen.mobile.web.tsx` — wrap with `<ScreenViewWeb>`; single column stacked; same `onPlay` wire
- [ ] `lecture-detail.screen.native.tsx` — wrap with `<ScreenViewMobileNative>`; scrollable single column; `onPlay` prop wired to `domain-playback`
- [ ] Add a save/unsave button to all three variants — reads `isSaved(lectureId)` from `domain-progress` store, calls `addSaved`/`removeSaved`
- [ ] Export all three screens from `src/index.web.ts` and `src/index.native.ts`; add a `lecture-detail.screen.responsive.web.tsx` wrapper (same pattern as Phase 6) and export as `LectureDetailScreen`
- [ ] Add web route `apps/web/src/app/(main)/lectures/[id]/page.tsx`
- [ ] Add mobile route `apps/mobile/src/app/(tabs)/(search)/lecture/[id].tsx`
- [ ] Add `routes.lectures` to `packages/core-contracts/src/routes.ts`
- [ ] Run `pnpm typecheck:api+web` and `pnpm typecheck:api+mobile`
- [ ] Commit: `feat(feature-lecture): add lecture detail screens and API endpoint`

---

## Phase 8: Search Home — QuickBrowse Redesign

**Problem:** The current QuickBrowse shows four hardcoded text labels ("Senior Scholars", "Hadith", "Fiqh", "Tafsir"). It should show real ranked content: a "Continue Listening" card, a horizontal scholars row, and a horizontal content row (standalone lectures, series, or collections).

### Ranking model

Content and scholars in QuickBrowse are ranked by a weighted combination of:

1. **Community interest** — derived from `AnalyticsEvent` (play + complete counts in a rolling window)
2. **Admin recommendation** — a new `featured` flag or ordering in relevant DB tables (added below)
3. **User interest** — for signed-in users: their `UserLectureProgress` topics/scholars; for anonymous users: locally stored interaction history

For now, ranking is computed server-side as a simple weighted score. No ML.

### API endpoint

**New optimized endpoint in `apps/api/src/modules/search/` (or a new `home` module):**

- `GET /home/quickbrowse` — returns:
  ```ts
  {
    scholars: ScholarChipDto[];          // top 8, ranked
    suggestions: ContentSuggestionDto[]; // top 10: mix of collections, series, standalone lectures
  }
  ```
  Query params: `topicSlugs?: string` (for personalization), `scholarSlugs?: string`

### "Continue Listening" — collapsed into QuickBrowse response

Instead of a separate `GET /me/progress/recent` call on the search home, include `recentProgress` directly in the `GET /home/quickbrowse` response. When the request carries an `Authorization` header, the server reads the user's most recent in-progress lecture from `UserLectureProgress` and attaches it. When unauthenticated, `recentProgress` is `null` and the client reads from local storage.

This reduces the search home to a single API call regardless of auth state.

```ts
// QuickBrowseDto — updated
{
  scholars: ScholarChipDto[];
  suggestions: ContentSuggestionDto[];
  recentProgress: RecentProgressDto | null; // null for anonymous
}

// RecentProgressDto
{
  lectureId: string;
  lectureTitle: string;
  lectureSlug: string;
  scholarName: string;
  durationSeconds: number;
  positionSeconds: number;
}
```

- **Signed-in users:** `recentProgress` field from API response (most recent incomplete lecture)
- **Anonymous users:** `recentProgress` is `null` from API; client reads AsyncStorage/localStorage fallback

### New schema addition — `isFeatured` flag

Add `isFeatured Boolean @default(false)` to `Scholar` model (for admin to boost in QuickBrowse). Admin can toggle this via the `manage:scholars` permission.

### Files

- Modify: `packages/core-db/prisma/schema.prisma` — add `isFeatured` to `Scholar`
- Create migration for `isFeatured`
- Create: `apps/api/src/modules/home/home.module.ts`, `home.controller.ts`, `home.service.ts`, `home.repo.ts`
- Modify: `apps/api/src/app.module.ts` — add `HomeModule`
- Add types: `packages/core-contracts/src/types/home.ts` — `QuickBrowseDto`, `ScholarChipDto`, `ContentSuggestionDto`
- Modify: `packages/feature-search/src/components/QuickBrowse/` — replace hardcoded data with API data
- Modify: `packages/feature-search/src/screens/search-home/` — pass data from API to QuickBrowse

### Steps

- [ ] Add `isFeatured Boolean @default(false)` to `Scholar` in schema, create migration
- [ ] Create `apps/api/src/modules/home/` module
- [ ] Implement `GET /home/quickbrowse`:
  - Scholars: query active scholars, score by: `isFeatured` weight (3×) + `isKibar` weight (1.5×) + analytics play count (rolling 30d, normalized) — return top 8
  - Suggestions: query published collections + root series + root lectures, score by analytics play count (30d) — return top 10 mix
  - `recentProgress`: if request has valid `Authorization` header, read most recent incomplete `UserLectureProgress` and attach as `RecentProgressDto`; otherwise `null`
  - Endpoint is `@Public()` — keep throttling at default rate (this is called on every search home mount; removing throttle entirely is too permissive)
- [ ] Add `QuickBrowseDto` to `@sd/core-contracts`
- [ ] In `feature-search`, replace the hardcoded `quickLinks` array with a `useQuickBrowse()` hook that calls `/home/quickbrowse`
- [ ] Update `QuickBrowseDesktopWeb` and `QuickBrowseMobileWeb` to render:
  1. "Continue Listening" card — uses `recentProgress` from API response when authenticated; falls back to `domain-progress` local store when anonymous; renders nothing if both are empty (no sign-in gate)
  2. Scholars horizontal row — chips with image + name, tap navigates to scholar detail
  3. Suggestions horizontal row — collection/series/lecture cards with cover image + title + scholar name
- [ ] Update `SearchHomeMobileNativeScreen` — same three sections
- [ ] Run `pnpm typecheck:api+web` and `pnpm typecheck:api+mobile`
- [ ] Commit: `feat(home): add QuickBrowse API endpoint and redesign search home sections`

---

## Phase 9: Library Feature — Local-First + API Sync

**Problem:** `feature-library` is a placeholder. Library = three sections: In Progress, Saved, Completed. Anonymous users must also have a fully functional library — backed by local storage. Authenticated users get the same UI backed by the API, with local data synced on sign-in.

### Local-first data model

The library hooks are the abstraction boundary. They always expose the same interface regardless of auth state. Internally:

```
Anonymous  →  AsyncStorage (native) / localStorage (web)
Authenticated  →  API  (local storage used as write-through cache for offline resilience)
```

Local storage key schema:

```
sd:progress:{lectureId}   →  { positionSeconds, isCompleted, updatedAt }
sd:saved:{lectureId}      →  { savedAt }
```

On sign-in, the auth flow triggers a one-time bulk sync:

1. Read all `sd:progress:*` keys → `POST /me/progress/sync` (bulk upsert, server wins on conflict)
2. Read all `sd:saved:*` keys → `POST /me/library/saved/sync` (bulk union — local saves are never lost)
3. Clear local keys after successful sync

### API endpoints

New module `apps/api/src/modules/library/`:

- `GET /me/library/progress` — in-progress (`isCompleted = false`), `updatedAt desc`, paginated → `{ items: LibraryProgressItemDto[], nextCursor? }`
- `GET /me/library/completed` — completed (`isCompleted = true`), `updatedAt desc`, paginated
- `GET /me/library/saved` — favorited, `createdAt desc`, paginated
- `POST /me/library/saved/:lectureId` — save (idempotent upsert)
- `DELETE /me/library/saved/:lectureId` — unsave
- `POST /me/progress/:lectureId` — upsert `{ positionSeconds, isCompleted }`

New module `apps/api/src/modules/progress/`:

- `POST /me/progress/sync` — bulk upsert for post-sign-in sync: accepts `{ items: ProgressSyncItemDto[] }`, processes each as an upsert (server position wins if `server.updatedAt > item.updatedAt`)
- `POST /me/library/saved/sync` — bulk save: accepts `{ lectureIds: string[] }`, unions with existing saves

All endpoints require authentication. `GET /me/progress/recent` is removed — it is now provided by `GET /home/quickbrowse` for authenticated users.

`LibraryProgressItemDto` = `{ lectureId, lectureTitle, lectureSlug, scholarName, scholarSlug, durationSeconds, positionSeconds, isCompleted, updatedAt }`

### Screens

Three sub-sections, tab-style within a single Library screen (no sub-routes):

- **In Progress** — vertical list with progress bar per item
- **Saved** — vertical list of saved lectures
- **Completed** — vertical list of completed lectures

No sign-in gate. The screen renders for anonymous users using local data.

### Files

- Create: `apps/api/src/modules/library/` — controller, service, repo, DTOs
- Create: `apps/api/src/modules/progress/` — controller, service, repo + sync endpoint
- Modify: `packages/domain-progress/src/store/progress.store.ts` — extend to include saves (favorites) alongside progress; both share local-storage backing and the same sync flow. **Read the existing store first** — it already has progress state; add `savedIds: Set<string>` alongside it.
- Modify: `packages/domain-progress/src/sync/progress.sync.ts` — extend to also sync saves via the new bulk endpoint. **Read existing sync logic first** — build on it, do not rewrite.
- Modify: `packages/feature-library/src/` — implement real screens, add `@sd/domain-progress` to `package.json`
- Modify: `packages/feature-auth/src/` — call sync after successful sign-in (may already be wired; check first)
- Add types to `packages/core-contracts/src/types/library.ts`

### Steps

- [ ] **Read** `packages/domain-progress/src/store/progress.store.ts` and `packages/domain-progress/src/sync/progress.sync.ts` before writing any code — understand what's already there
- [ ] Extend the progress store to include saves: add `savedIds: Set<string>`, `addSaved(id)`, `removeSaved(id)`, `isSaved(id)` — backed by the same local-storage adapter already in use
- [ ] Extend `progress.sync.ts` (at `packages/domain-progress/src/sync/progress.sync.ts`) to push saved IDs via `POST /me/library/saved/sync` after pushing progress
- [ ] Create `LibraryModule` and `ProgressModule` in `apps/api` — all endpoints require `@Auth()`
- [ ] Add `POST /me/progress/sync` and `POST /me/library/saved/sync` bulk endpoints to the API
- [ ] Implement repo queries for progress (in-progress, completed) and favorites
- [ ] Add `LibraryModule` and `ProgressModule` to `AppModule`
- [ ] Add types to `@sd/core-contracts`
- [ ] Add `@sd/domain-progress` to `feature-library/package.json` dependencies
- [ ] In `feature-library`, implement three lazy-loading hooks:
  - `use-library-progress.ts`:
    - If authenticated → `GET /me/library/progress` (TanStack Query)
    - If anonymous → reads from `domain-progress` store (Zustand, already reactive) and maps to `LibraryProgressItemDto` shape
  - `use-library-saved.ts`: same pattern — authenticated reads API, anonymous reads `store.savedIds` from `domain-progress`
  - `use-library-completed.ts`: same pattern, lazy-loads on first "Completed" tab activation
- [ ] Implement `LibraryProgressList`, `LibrarySavedList`, `LibraryCompletedList` (web + native)
- [ ] Update `LibraryDesktopWebScreen`, `LibraryMobileWebScreen`, `LibraryMobileNativeScreen` with `ScreenView`
- [ ] In `packages/domain-progress/src/sync.ts`, implement `syncLocalToServer(apiClient)`:
  ```ts
  // 1. getAllProgress() → POST /me/progress/sync
  // 2. getSaved() → POST /me/library/saved/sync
  // 3. clearAll() on success
  ```
- [ ] In `packages/feature-auth/src/`, call `syncLocalToServer` after successful sign-in (after session is established)
- [ ] Run `pnpm typecheck:api+web` and `pnpm typecheck:api+mobile`
- [ ] Commit: `feat(feature-library): local-first library with anonymous support and post-signin sync`

---

## Phase 10: Feed Feature — API + Screens

**Problem:** `feature-feed` is a placeholder. Feed is a ranked infinite-scroll content discovery surface — vertical scroll with horizontal scroll sections. Ranking is multi-factor: community interest (analytics), admin recommendation (`isFeatured`), and user interest (for signed-in users: their topics/scholars history; for anonymous: local history).

### Feed structure (one screen, vertical scroll)

```
[Horizontal: Scholar chips — ranked]
[Vertical: Content card]
[Vertical: Content card]
[Horizontal: "New from [Scholar X]" row — if user has interacted with that scholar]
[Vertical: Content card]
[Vertical: Content card]
[Horizontal: "New in [Topic X]" row — surfaced from ranked topic affinity]
[Vertical: Content card]
[Vertical: Content card]
[Horizontal: Scholar chips — ranked (repeat if feed is long)]
...
```

Each content card = lecture, standalone series, or collection. The mix is ranked.

**"New from [Scholar X]"** — requires the client to pass `scholarSlugs` (slugs of scholars the user has played content from). Server filters recent content from those scholars and wraps it in a `scholar_row` item with a `scholarName` label.

**"New in [Topic X]"** — requires the client to pass `topicSlugs` (topics of lectures the user has played). Server filters recent content tagged with those topics and wraps it in a `topic_row` item with a `topicName` label.

For anonymous users: both `scholarSlugs` and `topicSlugs` are read from local storage interaction history and passed as query params. The server returns generic ranked content if no hints are provided.

**Post-MVP / not in this plan:** "Related to recently listened" — would require computing content similarity from the last played lecture, which is a heavier server-side operation. Defer until analytics provide enough signal.

### API endpoint

`GET /feed` — paginated, cursor-based

- Query params: `cursor?`, `limit?` (default 20, max 40), `topicSlugs?`, `scholarSlugs?` (personalization hints from client local state)
- Returns: `{ items: FeedItemDto[], nextCursor?: string }`
- `FeedItemDto` has a `kind` discriminator: `'lecture' | 'series' | 'collection' | 'scholar_row' | 'topic_row'`
- Each `kind` has its own payload shape:
  - `lecture | series | collection` → content card payload (title, scholar, thumbnail, duration)
  - `scholar_row` → `{ scholarName: string, scholars: ScholarChipDto[] }` — horizontal scroll
  - `topic_row` → `{ topicName: string, items: ContentSuggestionDto[] }` — horizontal scroll

`GET /feed/scholars` — ranked scholars for the horizontal scholars section

- Returns: `{ scholars: ScholarChipDto[] }` (top 12)

Both endpoints are `@Public()` — anonymous users get a generic ranked feed; personalization hints are passed as query params from local client state.

### Files

- Create: `apps/api/src/modules/feed/feed.module.ts`, `feed.controller.ts`, `feed.service.ts`, `feed.repo.ts`
- Modify: `apps/api/src/app.module.ts`
- Add types: `packages/core-contracts/src/types/feed.ts`
- Modify: `packages/feature-feed/src/` — implement real screens

### Steps

- [ ] Create `FeedModule` in `apps/api`
- [ ] Implement `GET /feed` — repo scores items by: analytics play count (30d, normalized 0–1) × 0.5 + `isFeatured` × 0.3 + recency (days since published, decayed) × 0.2
- [ ] Inject horizontal section items (scholars rows, topic clusters) every 4–5 vertical items server-side
- [ ] Implement `GET /feed/scholars` — same ranking as QuickBrowse scholars
- [ ] Add `FeedItemDto` union type to `@sd/core-contracts` — discriminated union on `kind: 'lecture' | 'series' | 'collection' | 'scholar_row' | 'topic_row'`
- [ ] In `feature-feed`:
  - `use-feed.ts` hook — TanStack Query infinite query; reads scholar/topic slugs from local interaction store and passes as query params
  - `FeedList` component — renders mixed `FeedItemDto[]` using `kind` discriminator; switches between `FeedContentCard`, `FeedScholarRow`, `FeedTopicRow`
  - `FeedContentCard` (web + native) — lecture/series/collection vertical card
  - `FeedScholarRow` (web + native) — horizontal scroll row with `scholarName` label above chips
  - `FeedTopicRow` (web + native) — horizontal scroll row with `topicName` label above content chips
  - `FeedDesktopWebScreen`, `FeedMobileWebScreen`, `FeedMobileNativeScreen` (all use `ScreenView`)
- [ ] Update web route `/feed/page.tsx`
- [ ] Update mobile `feed/index.tsx`
- [ ] Run `pnpm typecheck:api+web` and `pnpm typecheck:api+mobile`
- [ ] Commit: `feat(feature-feed): implement ranked infinite-scroll feed with horizontal sections`

---

## Phase 11: Livestreams Service — `apps/livestreams`

**Problem:** Live session tracking needs a persistent Telegram MTProto connection that polls channels/groups for live status. This is fragile and wasteful to run inside the main API NestJS process. It is its own NestJS app in the monorepo, sharing `@sd/core-db`, deploying separately.

**Design for easy future split:** The service communicates with the rest of the system only through the shared DB. It writes session state to DB; the main API reads it. No direct HTTP coupling between apps. Splitting later = point `apps/livestreams` to its own DB instance and add a sync mechanism.

### DB schema additions

```prisma
model LivestreamChannel {
  id          String   @id @default(cuid())
  scholarId   String?
  telegramId  String   @unique  // Telegram channel/group numeric ID
  telegramSlug String?          // @username if public channel
  displayName String
  language    String?
  isActive    Boolean  @default(true)
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt

  scholar     Scholar?      @relation(fields: [scholarId], references: [id], onDelete: SetNull)
  sessions    LiveSession[]

  @@index([isActive])
  @@index([scholarId])
}

model LiveSession {
  id              String            @id @default(cuid())
  channelId       String
  status          LiveSessionStatus @default(scheduled)
  title           String?
  scheduledAt     DateTime?
  startedAt       DateTime?
  endedAt         DateTime?
  telegramMsgId   String?           // source message that triggered detection
  viewerCount     Int?              // if obtainable via API
  createdAt       DateTime          @default(now())
  updatedAt       DateTime          @updatedAt

  channel         LivestreamChannel @relation(fields: [channelId], references: [id], onDelete: Cascade)

  @@index([channelId, status])
  @@index([status, scheduledAt])
  @@index([status, startedAt])
}

enum LiveSessionStatus {
  scheduled
  live
  ended
}
```

### App structure: `apps/livestreams`

```
apps/livestreams/
  package.json
  tsconfig.json
  src/
    main.ts
    app.module.ts
    telegram/
      telegram.module.ts
      telegram.service.ts        ← gramjs client, connection lifecycle
      telegram.monitor.ts        ← event listener: new messages, live start/end
    channels/
      channels.module.ts
      channels.controller.ts     ← admin API: CRUD for LivestreamChannel (requires manage:livestreams)
      channels.service.ts
      channels.repo.ts
    sessions/
      sessions.module.ts
      sessions.service.ts        ← internal only: called by TelegramMonitor to write session state
      sessions.repo.ts
    shared/
      db/                        ← re-exports PrismaService from @sd/core-db
      config/                    ← env vars (TELEGRAM_API_ID, TELEGRAM_API_HASH, TELEGRAM_SESSION)
```

### Main API endpoints (in `apps/api`, not `apps/livestreams`)

The main API reads from the shared DB tables. Add a `live` module with **three sub-routes** — one per section — so each can be polled independently at the right cadence, and **delta fetching** via `?since=<ISO>` so only changed data is transferred on repeat polls.

#### Why split routes?

- `/live/active` — sessions can go live or end unexpectedly; needs fast polling (15–30s)
- `/live/upcoming` — scheduled times rarely change; slower polling (2–5 min)
- `/live/ended` — stale content aging out; slowest polling (5–10 min)

Separate routes also let the server optimize each query independently (different DB index paths, different cache TTLs in future).

#### Delta fetching protocol

Every endpoint accepts optional `?since=<ISO timestamp>`:

- **First fetch** (no `since`): full list of sessions in the window
- **Subsequent fetches** (with `since`): only sessions where `updatedAt > since`, plus `deletedIds[]` for sessions removed from the window
- Every response includes `fetchedAt: string` — client stores this and sends as `since` on next poll

Requires `updatedAt DateTime @updatedAt` on `LiveSession` model (add to schema).

#### Response shape

```ts
// same envelope for all three endpoints
interface LiveSessionDeltaDto {
  sessions: LiveSessionPublicDto[]; // new + changed since ?since; full list on first fetch
  deletedIds: string[]; // IDs that left this window since ?since
  fetchedAt: string; // ISO — store and pass as ?since on next poll
}

interface LiveSessionPublicDto {
  id: string;
  status: "scheduled" | "live" | "ended";
  channelDisplayName: string;
  telegramSlug?: string;
  scholarName?: string;
  scholarSlug?: string;
  scholarImageUrl?: string;
  title?: string;
  scheduledAt?: string;
  startedAt?: string;
  endedAt?: string;
  updatedAt: string;
}
```

#### Endpoints

- `GET /live/active?since=<ISO>` — `status = 'live'`; `deletedIds` = sessions that ended/were cancelled since `since`; poll: 15–30s
- `GET /live/upcoming?since=<ISO>` — `status = 'scheduled'`, `scheduledAt` within 7 days; poll: 2–5 min
- `GET /live/ended?since=<ISO>` — `status = 'ended'`, `endedAt` within 24h; `deletedIds` = sessions that aged out of 24h window; poll: 5–10 min

All endpoints are `@Public()`.

### Environment variables for `apps/livestreams`

```
TELEGRAM_API_ID=
TELEGRAM_API_HASH=
TELEGRAM_SESSION=       ← StringSession from gramjs auth flow
DATABASE_URL=           ← same as main app for now
PORT=3001
```

### Steps

- [ ] Add `LivestreamChannel`, `LiveSession`, `LiveSessionStatus` to `packages/core-db/prisma/schema.prisma`
- [ ] Add `LivestreamChannel` relation to `Scholar`
- [ ] Run `pnpm --filter core-db migrate:create-only` — name: `add_livestream_tables`
- [ ] Run `pnpm --filter core-db prisma:generate`
- [ ] Create `apps/livestreams/package.json` — dependencies: `@nestjs/core`, `@nestjs/common`, `@nestjs/platform-fastify`, `@sd/core-db`, `@sd/core-env`, `gramjs`, `@sd/core-contracts`
- [ ] Add `apps/livestreams` to `pnpm-workspace.yaml`
- [ ] Add `apps/livestreams` to `turbo.json` pipeline
- [ ] Implement `TelegramService`:
  - Initializes `gramjs` `TelegramClient` with `StringSession`
  - Connects on module init
  - Exposes `getChannelInfo(channelId)` — fetches channel metadata from Telegram
  - Listens for `UpdateGroupCallParticipants` and voice chat events to detect live start/end
  - Listens for messages with scheduled group call announcements to detect upcoming sessions
- [ ] Implement `TelegramMonitor` — subscribes to `TelegramService` events, writes `LiveSession` records to DB via `SessionsService`
- [ ] Implement `ChannelsModule` with CRUD for `LivestreamChannel` — all endpoints require `manage:livestreams` permission (validated via `AdminPermissionGuard` from `@sd/core-contracts` shared types)
- [ ] Implement `SessionsModule` with:
  - Internal methods for monitor to write sessions
  - `GET /sessions/current` — internal health/debug endpoint
- [ ] In `apps/api`, create `apps/api/src/modules/live/`:
  - `live.module.ts`, `live.controller.ts`, `live.service.ts`, `live.repo.ts`
  - Controller exposes three routes: `GET /live/active`, `GET /live/upcoming`, `GET /live/ended`
  - Each accepts optional `since?: string` query param (ISO timestamp)
  - Repo query: if `since` provided → `WHERE updatedAt > since AND <window filter>`; else full window
  - Repo also computes `deletedIds`: IDs that were in the window at `since` but no longer are (e.g. a `live` session that `endedAt > since` — it moved to ended, so it's "deleted" from the active window)
  - Response always includes `fetchedAt: new Date().toISOString()`
  - `@Public()`, `@SkipThrottle()`
- [ ] Add `LiveModule` to `apps/api/src/app.module.ts`
- [ ] Add `LiveSessionPublicDto` and `LiveSessionDeltaDto` to `@sd/core-contracts`
- [ ] Run `pnpm --filter livestreams typecheck`
- [ ] Run `pnpm --filter api typecheck`
- [ ] Commit: `feat(livestreams): add Telegram MTProto monitor service and live session DB schema`
- [ ] Commit: `feat(api/live): add GET /live/active, /live/upcoming, /live/ended with delta fetching`

---

## Phase 12: Live Feature — Screens

**Problem:** `feature-live` is a placeholder. It should show active, upcoming, and recently ended sessions using the three separate API sub-routes with delta fetching and per-section polling intervals.

### Screens

One screen, three sections (no sub-routes in the app — it's one live tab):

- **Live Now** — cards with a pulsing "LIVE" badge, scholar image, channel name; tap → deep link to Telegram
- **Upcoming** — cards with scheduled time, title, scholar info
- **Recently Ended** — muted cards, ended time, 24h window

### Data hooks — one parameterized hook, three instances

The three sections share identical hook logic (delta fetch on mount, refetch on interval, merge). Use one `useLiveSection` hook with parameters rather than duplicating the logic three times.

```ts
// feature-live/src/hooks/use-live-section.ts
function useLiveSection(endpoint: string, refetchIntervalMs: number) {
  // stores fetchedAt between refetches — not state, doesn't cause re-render
  const fetchedAtRef = useRef<string | undefined>(undefined);

  const query = useQuery({
    queryKey: ["live", endpoint, fetchedAtRef.current],
    queryFn: async () => {
      const url = fetchedAtRef.current
        ? `${endpoint}?since=${encodeURIComponent(fetchedAtRef.current)}`
        : endpoint;
      return fetchLiveSectionDelta(url); // calls the API, returns LiveSessionDeltaDto
    },
    refetchInterval: refetchIntervalMs, // TanStack handles interval, errors, bg pause
    staleTime: 0,
  });

  // merge delta into accumulated sessions state
  const [sessions, setSessions] = useState<LiveSessionPublicDto[]>([]);
  useEffect(() => {
    if (!query.data) return;
    fetchedAtRef.current = query.data.fetchedAt;
    setSessions((prev) => mergeDelta(prev, query.data!));
  }, [query.data]);

  return { sessions, isLoading: query.isLoading };
}

// usage — three instances with different intervals
const active = useLiveSection("/live/active", 20_000); // 20s
const upcoming = useLiveSection("/live/upcoming", 180_000); // 3 min
const ended = useLiveSection("/live/ended", 480_000); // 8 min
```

Delta merge — O(n+m) using a Map:

```ts
function mergeDelta(
  current: LiveSessionPublicDto[],
  delta: LiveSessionDeltaDto,
): LiveSessionPublicDto[] {
  const deltaMap = new Map(delta.sessions.map((s) => [s.id, s]));
  const deletedSet = new Set(delta.deletedIds);
  const merged = current.filter((s) => !deletedSet.has(s.id)).map((s) => deltaMap.get(s.id) ?? s);
  const existingIds = new Set(current.map((s) => s.id));
  const added = delta.sessions.filter((s) => !existingIds.has(s.id));
  return [...merged, ...added];
}
```

### Steps

- [ ] Create `packages/feature-live/src/hooks/use-live-section.ts` — the single parameterized hook above
- [ ] Create `packages/feature-live/src/hooks/use-live-sessions.ts` — composes three `useLiveSection` instances:
  ```ts
  export function useLiveSessions() {
    const active = useLiveSection("/live/active", 20_000);
    const upcoming = useLiveSection("/live/upcoming", 180_000);
    const ended = useLiveSection("/live/ended", 480_000);
    return { active, upcoming, ended };
  }
  ```
- [ ] Implement `LiveSessionCard` component (web + native) — `status` prop switches rendering: `live` = pulsing badge; `scheduled` = time countdown; `ended` = muted with ended-at label
- [ ] Implement `LiveNowBadge` — pulsing red dot + "LIVE" label (CSS animation on web, Reanimated on native)
- [ ] Implement `LiveDesktopWebScreen`, `LiveMobileWebScreen`, `LiveMobileNativeScreen` — each uses `ScreenView`, composes the three hooks and renders three sections
- [ ] Update web route `/live/page.tsx`
- [ ] Update mobile `live/index.tsx`
- [ ] Deep link: web → `https://t.me/{telegramSlug}`; native → try `tg://` scheme, fall back to `https://t.me/` URL via `Linking.openURL`
- [ ] Run `pnpm typecheck:api+web` and `pnpm typecheck:api+mobile`
- [ ] Commit: `feat(feature-live): implement live screens with per-section delta polling hooks`

---

## Phase 13: Admin Screens — Web + Mobile

**Problem:** There are no admin screens. Admins with appropriate permissions need to manage scholars, topics, content, livestream channels, and user permissions.

### Web — `apps/web/src/app/(main)/(admin)/`

Route group `(admin)` inside `(main)` — uses the same sidebar/footer shell. A middleware/layout checks `manage:*` permission; redirects to home if unauthorized.

```
(admin)/
  layout.tsx              ← checks user has at least one admin permission; 403 if not
  admin/page.tsx          ← dashboard: links to each section
  admin/scholars/page.tsx          ← requires manage:scholars
  admin/scholars/[id]/page.tsx
  admin/topics/page.tsx            ← requires manage:topics
  admin/livestreams/page.tsx       ← requires manage:livestreams
  admin/livestreams/[id]/page.tsx
  admin/users/page.tsx             ← requires manage:users
  admin/permissions/page.tsx       ← requires manage:admin
```

### Mobile — admin section in Account tab

Admin functions appear in the Account tab for users with admin permissions. A conditional section renders admin links if the user has any permission. Mobile admin covers: livestream management (most field-relevant), content publishing approvals.

### New package: `feature-admin`

```
packages/feature-admin/
  package.json
  src/
    index.web.ts
    index.native.ts
    screens/
      admin-dashboard/
      admin-scholars/
      admin-topics/
      admin-livestreams/
      admin-permissions/
    components/
      permission-gate/         ← wrapper that hides content if user lacks permission
      admin-nav/
    hooks/
      use-admin-permissions.ts ← fetches current user's permissions
    api/
      admin.api.ts
    types/
      index.ts
```

### API endpoints needed (in `apps/api`)

Extend existing modules with admin-gated endpoints:

- `apps/api/src/modules/scholars/` — add `POST /admin/scholars`, `PATCH /admin/scholars/:id`, requires `manage:scholars`
- `apps/api/src/modules/topics/` — add `POST /admin/topics`, `PATCH /admin/topics/:slug`, `DELETE /admin/topics/:slug`, requires `manage:topics`
- `apps/api/src/modules/live/` — add `PATCH /admin/live/sessions/:id/status`, requires `manage:livestreams`
- `apps/api/src/modules/admin-permissions/` — already created in Phase 5

### Steps

- [ ] Create `apps/web/src/app/(main)/(admin)/layout.tsx` — server component that checks session, redirects if no admin permissions
- [ ] Create admin route pages for each section (thin wiring, delegates to `feature-admin` screens)
- [ ] Create `packages/feature-admin/` with the structure above
- [ ] Implement `use-admin-permissions.ts` — queries `GET /admin/permissions/me` (new endpoint returning current user's permissions array)
- [ ] Implement `PermissionGate` component — `<PermissionGate requires="manage:scholars">...</PermissionGate>`
- [ ] Implement admin screens:
  - `AdminDashboardScreen` — shows available sections based on permissions
  - `AdminScholarsScreen` — list + create/edit scholars (set `isFeatured`, `isKibar`, `isActive`)
  - `AdminTopicsScreen` — list + create/edit topics, manage hierarchy
  - `AdminLivestreamsScreen` — list channels, create/edit channels (links to `apps/livestreams` data via main API), manually set session status if needed
  - `AdminPermissionsScreen` — grant/revoke permissions for users (requires `manage:admin`)
- [ ] In `apps/mobile`, add admin section to Account tab — visible only if user has permissions
- [ ] Add `GET /admin/permissions/me` endpoint to `admin-permissions` module
- [ ] Run `pnpm typecheck:api+web` and `pnpm typecheck:api+mobile`
- [ ] Commit: `feat(feature-admin): add admin screens with permission-gated sections`

---

## Execution Order

| Phase | Description                          | Risk   | Prerequisite       |
| ----- | ------------------------------------ | ------ | ------------------ |
| 1     | TypeScript deprecation fix           | Low    | —                  |
| 2     | Auth screens to main shell           | Low    | —                  |
| 3     | Search processing surface            | Low    | —                  |
| 4     | TopAuthStrip deduplication           | Low    | —                  |
| 5     | Admin permission system (DB + guard) | Medium | —                  |
| 6     | Scholar detail API + screens         | Medium | Phase 5            |
| 7     | Lecture detail API + screens         | Medium | Phase 5            |
| 8     | QuickBrowse redesign                 | Medium | Phases 6, 7        |
| 9     | Library feature                      | Medium | Phase 5            |
| 10    | Feed feature                         | Medium | Phases 6, 7, 8     |
| 11    | Livestreams service                  | High   | Phase 5            |
| 12    | Live feature screens                 | Low    | Phase 11           |
| 13    | Admin screens                        | Medium | Phases 5, 6, 7, 11 |

Phases 1–4 are pure fixes, no dependencies, can all run in parallel. Phases 6 and 7 can run in parallel. Phase 11 can start as soon as Phase 5 is done (independent of 6/7).

---

## Definition of Done

- [ ] `pnpm typecheck` passes with zero deprecation warnings and zero errors
- [ ] Sign-in and sign-up pages show sidebar and footer on desktop; no gradient
- [ ] Scholar detail page renders on web and mobile with bio, social links, and content list
- [ ] Lecture detail page renders on web and mobile with scholar info, topics, and play callback
- [ ] QuickBrowse shows real scholars, real content suggestions, and a continue-listening card
- [ ] Library tab shows in-progress, saved, and completed sections with real data
- [ ] Feed renders ranked content with horizontal scholar and content rows
- [ ] `apps/livestreams` starts, connects to Telegram, and writes live session state to DB
- [ ] Live tab shows live/upcoming/ended sessions from the shared DB
- [ ] Admin route group in `apps/web` is accessible only to users with at least one admin permission
- [ ] `PermissionGate` correctly hides content based on the user's specific permissions
- [ ] `pnpm lint` passes with zero errors
