# AGENT.md - apps/mobile (Offline-First Client)

This Expo/React Native app prioritizes offline listening and resilient sync.

## Core responsibilities

- Deliver reliable playback and offline continuity.
- Queue user intent locally and sync safely.
- Reflect backend-authoritative state after sync.

## Agent skills scope

- Project-local OpenCode skills live in `.opencode/skills/`.
- Keep mobile-specific skills scoped to this app directory.
- For image-driven UI tasks, run root `google-stitch` first, then adapt output using this file and mobile-local skills.
- After Stitch baseline generation, enforce mobile structure (`app/`, `features/`, `core/`, `shared/`) and offline-first constraints.

## Non-negotiables

- Mobile is never the authority for protected state transitions.
- Offline mode records intent only.
- No admin/editorial authority while offline.
- Backend resolves conflicts deterministically.

## Offline sync rules

- Use an outbox pattern for offline-writable intents.
- Outbox entries must be idempotent and retry-safe.
- Sync on reconnect, foreground, periodic triggers, and explicit refresh.
- Reconcile to backend truth after sync completion.

## Structure and dependency direction

- `app/` - routing and composition
- `features/` - domain UX slices
- `core/` - API/auth/playback/persistence/sync infrastructure
- `shared/` - primitives/utilities

Direction:

- features -> core/shared
- core -> shared
- shared -> no inward deps

## API contracts

- Import shared types from `@sd/contracts`.
- Use query hooks from `@sd/contracts/query/hooks` for data fetching.
- Initialize the API client once with `initApiClient()`.

## Media rules

- Consume backend-provided media references.
- Never ship storage credentials in app code.
- Treat downloads as continuity cache, not ownership.

## Brand assets

- App icons/splash are configured in `apps/mobile/app.config.ts` and sourced from `apps/mobile/assets/images/*`.
- In UI, use the brand logos from `apps/mobile/assets/images/logo/*` (avoid starter/template React logos).

## Styling rules

- Use `StyleSheet.create((theme) => ({ ... }))` from `react-native-unistyles` by default.
- Use `useUnistyles()` only when runtime conditions require it (insets, platform switches, or dynamic state).
- Prefer design tokens from `@sd/design-tokens` for colors, spacing, radius, shadows, and typography.
- If a required token is missing, make a small, deliberate update in `packages/design-tokens`.

// USAGE
// import { StyleSheet } from "react-native-unistyles";
//
// export const styles = StyleSheet.create( ( theme ) => ( {
// screen: {
// paddingHorizontal: theme.spacing.layout.pageX,
// paddingVertical: theme.spacing.layout.pageY,
// },
//
// card: {
// padding: theme.spacing.component.cardPadding,
// borderRadius: theme.radius.component.card,
// backgroundColor: theme.colors.surface.default,
// },
//
// title: {
// ...theme.typography.titleLg,
// color: theme.colors.content.strong,
// },
//
// body: {
// ...theme.typography.bodyMd,
// color: theme.colors.content.default,
// },
//
// caption: {
// ...theme.typography.caption,
// color: theme.colors.content.muted,
// },
// } ) );

## Design Token Usage Guide: `surface`, `border`, and `content`

Use these token groups by **role**, not by visual preference.

### Core rule

- `surface` = backgrounds and fills
- `border` = outlines, separators, rings
- `content` = text, icons, and foreground elements placed on top of surfaces

Never use a `content` token as a background.
Never use a `surface` token for text.
Never use a `border` token for main text.

### 1. `surface` tokens

Use `surface.*` for anything that forms the visual layer a user sees **behind content**.

Use `surface` for:

- page backgrounds
- cards
- panels
- containers
- hover fills
- subtle selected fills
- disabled fills
- tinted backgrounds for primary/secondary emphasis

#### Meaning of each surface token

- `surface.canvas` -> app/page background
- `surface.default` -> default background of components
- `surface.subtle` -> softer background than default
- `surface.elevated` -> lifted surfaces (modals, popovers)
- `surface.hover` -> hover/pressed background on neutral surfaces
- `surface.inverse` -> reversed surface relative to main theme
- `surface.primarySubtle` -> soft primary-tinted surfaces
- `surface.secondarySubtle` -> soft secondary-tinted surfaces
- `surface.selected` -> selected state backgrounds
- `surface.disabled` -> disabled backgrounds only

### 2. `border` tokens

Use `border.*` only for edges, dividers, separators, outlines, and focus treatments.

Use `border` for:

- component outlines
- separators
- dividers
- input borders
- hover border emphasis
- focus rings
- accent borders
- disabled borders

#### Meaning of each border token

- `border.default` -> normal component borders
- `border.subtle` -> soft separators
- `border.strong` -> emphasized borders
- `border.muted` -> barely visible boundaries
- `border.hover` -> hover border changes
- `border.focus` -> focus-visible treatment
- `border.primary` -> soft primary-accent borders
- `border.primaryStrong` -> emphasized primary borders
- `border.secondary` -> soft secondary borders
- `border.secondaryStrong` -> strong secondary borders
- `border.disabled` -> disabled borders

### 3. `content` tokens

Use `content.*` for any foreground element shown on top of a surface.

Use `content` for:

- text
- icons
- glyphs
- foreground indicators
- inline metadata

#### Meaning of each content token

- `content.default` -> normal body content
- `content.muted` -> secondary content
- `content.subtle` -> quiet tertiary content
- `content.strong` -> headings/high emphasis
- `content.inverse` -> text on inverse surfaces
- `content.primary` -> primary-accent foreground
- `content.primaryStrong` -> stronger primary foreground
- `content.secondary` -> secondary foreground
- `content.secondaryStrong` -> stronger secondary foreground
- `content.onPrimary` -> text/icons on strong primary background
- `content.onSecondary` -> text/icons on strong secondary background
- `content.onDanger` -> text/icons on danger backgrounds
- `content.onSuccess` -> text/icons on success backgrounds
- `content.disabled` -> disabled foreground content

### 4. Practical pairing rules

- neutral container -> surface.default + border.default + content.default + content.strong
- subtle container -> surface.subtle + border.subtle + content.default
- elevated container -> surface.elevated + border.default (or none) + content.default
- selected item -> surface.selected + border.primary/primaryStrong + content.strong
- primary tinted block -> surface.primarySubtle + border.primary + content.primaryStrong + content.default
- inverse block -> surface.inverse + content.inverse
- disabled component -> surface.disabled + border.disabled + content.disabled
- primary button -> action.primary + content.onPrimary
- secondary button -> action.secondary + content.onSecondary

### 5. Decision rules for the agent

1. Determine the layer

- background/container -> surface
- outline/separator -> border
- text/icon/foreground -> content

1. Determine emphasis

- standard -> default
- quieter -> subtle/muted
- stronger -> strong
- disabled -> disabled
- selected/accented -> primary/secondary
- on colored fill -> onPrimary/onSecondary/inverse

1. Preserve contrast and semantics

- Foreground must remain readable against its background
- Prefer semantic pairing over visual guessing
- Do not swap token groups across roles

### 6. Anti-patterns

- use content tokens as backgrounds
- use surface tokens as text colors
- use border tokens as primary text colors
- use content.inverse on normal light surfaces
- use content.onPrimary unless on strong primary fill
- use surface.hover as resting background
- use border.focus as permanent border

### 7. Preferred defaults

- page background -> surface.canvas
- standard container -> surface.default
- muted container -> surface.subtle
- default text -> content.default
- heading text -> content.strong
- helper text -> content.muted
- default border -> border.default
- subtle divider -> border.subtle
- focus ring -> border.focus
- disabled UI -> surface.disabled + border.disabled + content.disabled

### 8. Short version

Token usage:

- surface.\* = backgrounds and fills
- border.\* = outlines, dividers, separators, focus rings
- content.\* = text, icons, and other foreground elements

Defaults:

- page bg -> surface.canvas
- container bg -> surface.default
- subtle bg -> surface.subtle
- elevated bg -> surface.elevated
- default border -> border.default
- subtle divider -> border.subtle
- focus ring -> border.focus
- body text -> content.default
- heading text -> content.strong
- secondary text -> content.muted
- inverse text -> content.inverse
- disabled fg -> content.disabled

Pairings:

- selected item -> surface.selected + border.primary + content.strong
- primary-tinted section -> surface.primarySubtle + border.primary + content.primaryStrong
- inverse section -> surface.inverse + content.inverse
- disabled component -> surface.disabled + border.disabled + content.disabled
- primary button -> action.primary + content.onPrimary
- secondary button -> action.secondary + content.onSecondary

Never:

- use content tokens as backgrounds
- use surface tokens as text colors
- use border tokens as primary text colors
- use onPrimary/onSecondary unless text is on a strong action/accent fill

## Design Token Usage Guide: `spacing`, `radius`, and `typography`

Use the shared guide in `packages/design-tokens/AGENT.md` to avoid duplication and keep rules consistent.

## Commands (run from repo root)

- Dev: `pnpm dev:mobile`
- Lint: `pnpm --filter mobile lint`
- Typecheck: `pnpm --filter mobile typecheck`
- Test: `pnpm --filter mobile test`

## Single-test commands

- Jest file: `pnpm --filter mobile test -- src/path/to/file.test.tsx`
- Jest by name: `pnpm --filter mobile test -- -t "renders heading"`
- Jest watch: `pnpm --filter mobile test:watch -- src/path/to/file.test.tsx`

## Quality expectations

- Fail safely and explicitly; avoid silent drops.
- Keep persistence/cache replaceable and non-authoritative.
- Add tests for outbox behavior, retry semantics, and reconciliation paths.
