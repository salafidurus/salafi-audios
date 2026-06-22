# Remaining Plan — Design-Token Sweep & Feed/Live Modernization (`f/feed-live-tokens`)

Stage-by-stage plan for the remaining work on branch **`f/feed-live-tokens`** (worktree
`.worktrees/f-feed-live-tokens`, based on `origin/main`). Branches 1 (route access) and 2
(navigation + i18n) are already merged/pushed.

**Rules for every stage:** at the end of each stage, run the stage's verification, then
**commit and push** (per-stage commit; clean Conventional-Commit messages — **no phase
names or numbers** in messages). Pushing runs the prepush gate (lint / typecheck /
test:prepush / build / web e2e / expo-doctor); a flaky network-only expo-doctor RN-directory
check can be retried. Keep `packages/core-db/.env` present in the worktree so the gate's
`prisma:generate`/build steps work.

---

## Context

The goal is system-wide design-token adoption (no hardcoded colors/spacing/shadows) plus
modernized, state-driven Feed and Live screens. An audit found **~443 hardcoded color
literals across ~60 files** — the bulk in off-theme admin screens. The **web** side is mostly
CSS-variable substitution; the **native** side is heavier because many components use inline
hex and must be converted to Unistyles `StyleSheet.create((theme) => …)` / `useUnistyles` to
access tokens at all.

**Already done & pushed** (`a02f82f`): web live components
(`live-session-card.module.css`, `currently-live-indicator.module.css`) tokenized.

---

## Token mapping reference (reuse in every stage)

Web → CSS variables `var(--token)` (generated in `apps/web/src/app/theme-css.ts`).
Native → `theme.colors.<group>.<token>` via Unistyles. Source of truth:
`packages/design-tokens/src/colors/shared.ts`.

| Hardcoded value(s)                                                                    | Semantic token                 | Web var                    | Native                               |
| ------------------------------------------------------------------------------------- | ------------------------------ | -------------------------- | ------------------------------------ |
| Blues `#3b82f6 #2563eb #1d4ed8 #0066cc #004499`, teal `#14b8a6` (brand/links/accents) | action.primary (+hover/active) | `--action-primary`         | `theme.colors.action.primary`        |
| Brand-tint bgs `#eff6ff #e6f2ff #f0f7ff #f0fdfb`                                      | surface.primarySubtle          | `--surface-primary-subtle` | `theme.colors.surface.primarySubtle` |
| White `#fff #ffffff` as background                                                    | surface.default                | `--surface-default`        | `theme.colors.surface.default`       |
| White as text on a colored fill                                                       | content.onPrimary / onDanger   | `--content-on-primary`     | `theme.colors.content.onPrimary`     |
| Off-white bgs `#f2f2f3 #f8f9fa #f9fafb #fafafa`                                       | surface.canvas                 | `--surface-canvas`         | `theme.colors.surface.canvas`        |
| Light bgs `#f3f4f6 #f1f5f9 #f5f5f5 #eee #eeeeef`                                      | surface.subtle                 | `--surface-subtle`         | `theme.colors.surface.subtle`        |
| Borders `#d1d5db #d4d4d8 #e0e0e0`                                                     | border.default                 | `--border-default`         | `theme.colors.border.default`        |
| Soft borders/dividers `#e5e7eb #e4e4e6 #e5e5e5 #e2e8f0`                               | border.subtle                  | `--border-subtle`          | `theme.colors.border.subtle`         |
| Muted text `#666 #6b7280 #71717a #888 #999`                                           | content.muted                  | `--content-muted`          | `theme.colors.content.muted`         |
| Decorative/disabled gray `#9ca3af #a1a1aa`                                            | content.disabled               | `--content-disabled`       | `theme.colors.content.disabled`      |
| Subtle text `#555 #52525b #64748b #475569`                                            | content.subtle                 | `--content-subtle`         | `theme.colors.content.subtle`        |
| Body text `#374151 #3f3f46 #4b5563 #333`                                              | content.default                | `--content-default`        | `theme.colors.content.default`       |
| Strong text `#111 #18181b #0f172a #1e293b #1a1a1a #1f2937 #0d0d0d`                    | content.strong                 | `--content-strong`         | `theme.colors.content.strong`        |
| Danger `#dc2626 #ef4444 #b91c1c #d32f2f` (icon/accent)                                | state.danger / action.danger   | `--state-danger`           | `theme.colors.state.danger`          |
| Danger bg `#fef2f2 #ffebee #fee2e2`                                                   | state.dangerSurface            | `--state-danger-surface`   | `theme.colors.state.dangerSurface`   |
| Danger text `#991b1b #c62828`                                                         | state.dangerContent            | `--state-danger-content`   | `theme.colors.state.dangerContent`   |
| Success `#16a34a #10b981 #059669 #2e7d32`                                             | state.success / action.success | `--state-success`          | `theme.colors.state.success`         |
| Success bg `#ecfdf5 #e8f5e9 #f0fdf4 #eef3e8`                                          | state.successSurface           | `--state-success-surface`  | `theme.colors.state.successSurface`  |
| Success text `#065f46`                                                                | state.successContent           | `--state-success-content`  | `theme.colors.state.successContent`  |
| Amber `#f59e0b #d97706 #eab308`                                                       | action.secondary               | `--action-secondary`       | `theme.colors.action.secondary`      |
| Shadows `rgba(0,0,0,…)`, `box-shadow` literals                                        | shadow scale                   | `--shadow-xs…lg`           | `theme.shadows.*`                    |
| px spacing/radii literals                                                             | spacing/radius scale           | `--space-*`, `--radius-*`  | `theme.spacing.*`, `theme.radius.*`  |

**Ambiguity rule:** a hex maps differently by role (e.g. `#fff` = surface vs on-primary text).
Always resolve by _what the value does_ in context, never by blanket find/replace. Drop any
redundant hardcoded fallback in existing `var(--x, #hex)` (the vars are always defined).

**Native conversion pattern:** for a component using inline hex in `style={{…}}`, introduce
`const styles = StyleSheet.create((theme) => ({ … }))` (from `react-native-unistyles`) and move
colors/spacing into it referencing `theme.*`; for one-off inline needs use
`const { theme } = useUnistyles()`. Match the patterns already used by tokenized native
components (e.g. `SubsectionBarHost`).

---

## Stages

### Stage 1 — Web: remaining CSS color sweep

- Files: every `.module.css`/`.css` under `apps/web/src` still containing hex/rgb — primarily
  `features/i18n/.../language-switch`, and the admin bulk (`features/admin/...`,
  `features/admin-lectures/...`). Exclude feed/live **screens** (redesigned in Stages 5 & 7).
- Replace per the mapping table; remove redundant `var(--x, #hex)` fallbacks.
- Verify: `pnpm --filter web typecheck && pnpm --filter web lint && pnpm --filter web build`;
  `grep -rIoE "#[0-9a-fA-F]{3,8}\b|rgba?\(" apps/web/src --include=*.css` returns only the
  feed/live screen files deferred to redesign (ideally nothing).
- Commit: `style(tokens): migrate remaining web stylesheets to design tokens` → push.

### Stage 2 — Native: audio & player components

- Files: `features/audio/components/{mini-player,playback-controls,progress-bar}.tsx`.
- Convert inline hex to Unistyles `theme.colors.*` (introduce `StyleSheet.create((theme)=>…)`
  where needed).
- Verify: `pnpm --filter native typecheck && pnpm --filter native lint`.
- Commit: `style(tokens): tokenize native audio player components` → push.

### Stage 3 — Native: library, account, scholar, lecture, progress, downloads, legal

- Files: the non-admin, non-feed/live native feature components/screens with hex (per audit):
  `features/library/screens/*`, `features/account/screens/*`,
  `features/scholar/components/scholar-card`, `features/lecture/components/*`,
  `features/progress/components/*`, `features/downloads/components/*`,
  `features/legal/screens/*`.
- Convert to Unistyles theme tokens.
- Verify: `pnpm --filter native typecheck && pnpm --filter native lint`.
- Commit: `style(tokens): tokenize native content & library screens` → push.

### Stage 4 — Native: admin screens

- Files: `features/admin/...`, `features/admin-lectures/...`, `features/admin-live/...`,
  `features/admin-scholars/...` (screens + sheets) with hex.
- Convert to Unistyles theme tokens.
- Verify: `pnpm --filter native typecheck && pnpm --filter native lint`.
- Commit: `style(tokens): tokenize native admin screens` → push.

### Stage 5 — Feed modernization (web)

- File: `features/feed/screens/feed-recent.screen.desktop.tsx` (+ any feed CSS).
- Layout: hero header → filters → responsive grid; cards with 1px `--border-subtle`, soft
  `--shadow-sm`, hover lift (`--shadow-md`), `--radius-component-card`.
- Add `<FeedSkeleton />` (token-driven placeholder boxes); error + empty states using the
  existing i18n keys `feed.loading/empty/error/retry` (already in locales), wired to `useFeed()`
  (`fetchNextPage`/refetch) from `@sd/domain-content`. Use `getEmptyStateText`/`getErrorStateText`.
- Verify: `pnpm --filter web typecheck && lint && build`; spot-check Loading/Error/Empty/Content.
- Commit: `feat(feed): modernize web feed with grid layout and state handling` → push.

### Stage 6 — Feed modernization (native)

- Files: `features/feed/screens/feed.screen.tsx` (+ `feed-following`, `feed-recent`) and
  `features/feed/components/{feed-content-card,feed-scholar-row,feed-topic-row}.tsx`.
- Unistyles styling; horizontal scholar row with circular frames; `<FeedSkeleton />`; error +
  empty states using `feed.*` keys + `useFeed()` (`{ data, isFetching, hasNextPage, fetchNextPage }`).
- Verify: `pnpm --filter native typecheck && lint`.
- Commit: `feat(feed): modernize native feed screen with skeletons and states` → push.

### Stage 7 — Live modernization (web)

- File: `features/live/screens/live.screen.desktop.tsx` (+ `live.screen.mobile.tsx`).
- State-driven grid: ongoing (pulsing `--state-danger` badge + viewer count), scheduled
  (calendar + start time, `--content-primary`), ended (grayscale + archived badge). Reuse the
  already-tokenized `live-session-card`/`currently-live-indicator`.
- Skeletons + localized empty states using `live.sections.*` / `live.empty` (already in locales).
- Verify: `pnpm --filter web typecheck && lint && build` + e2e.
- Commit: `feat(live): modernize web live screen with status-driven grid` → push.

### Stage 8 — Live modernization (native)

- Files: `features/live/screens/{live,live-scheduled,live-ended}.screen.tsx` and
  `features/live/components/{live-session-card,currently-live-indicator}.tsx`.
- Unistyles status badges (ongoing/scheduled/ended); skeletons; localized empty states using
  `live.sections.*` keys.
- Verify: `pnpm --filter native typecheck && lint`.
- Commit: `feat(live): modernize native live screen with status badges` → push.

### Stage 9 — Final audit, full verification, PR

- Confirm zero remaining hardcoded colors:
  `grep -rIoE "#[0-9a-fA-F]{3,8}\b|rgba?\(" apps/web/src apps/native/src` (allow only
  intentional exceptions, e.g. pure black/white in image masks or `transparent`).
- Run `pnpm --filter web typecheck && build`, `pnpm --filter native typecheck`,
  `pnpm --filter web test`, plus a light/dark spot-check of feed/live on both platforms
  (Argent MCP for the Android dev client; localhost via `adb reverse`).
- Open a PR for `f/feed-live-tokens` against `main` (after Branch 2's PR merges).
- Commit (if any cleanup): `style(tokens): final hardcoded-value cleanup` → push.

---

## Notes & risks

- **Sequencing:** Stages 5–8 redesign the feed/live screens, so those files are intentionally
  excluded from the Stages 1–4 sweep to avoid double work.
- **Native theme access** is the main effort multiplier — budget more time for Stages 2–4, 6, 8
  than the web stages.
- **Verify mappings in light _and_ dark**: the whole point of tokens is theme correctness; a
  wrong token (e.g. `content.muted` vs `content.subtle`) won't fail a build but will look wrong.
- **expo-doctor** on push can flake on the RN-directory network check — retry the push.
- Keep each stage to a single coherent commit so any stage can be reviewed/reverted independently.
