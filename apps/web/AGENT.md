# AGENT.md - apps/web (Public + Admin Client)

This Next.js app is a client of the backend API, not an authority.

## Core responsibilities

- Public discovery (SEO-friendly pages, deep links, shareable routes).
- Admin/editor workflows with efficient UI and safe UX.
- Strict adherence to backend contracts and permissions.

## Agent skills scope

- Project-local OpenCode skills live in `.opencode/skills/`.
- Keep Next.js and web-specific skills scoped to this app directory.
- For image-driven UI tasks, run root `google-stitch` first, then adapt output using this file and web-local skills.
- After Stitch baseline generation, enforce web structure (`app/`, `features/`, `core/`, `shared/`) and tokenized styling rules.

## Non-negotiables

- Never move business rules from API into web.
- Authorization is backend-only; UI gating is convenience only.
- Never bypass explicit API transition endpoints.

## Structure and dependency direction

- `app/` - routing/layout/composition only
- `features/` - domain-facing UI/hooks
- `core/` - platform concerns (API wiring, session, caching, error normalization)
- `shared/` - primitives/utilities with no inward deps

Route wrappers in `src/app/**/page.tsx` must:

- Import screen + metadata helpers from `features/*/screens/*`.
- Avoid domain data fetching and feature business logic.
- Keep routing declarative and minimal.

Feature ownership rules:

- Feature folders are vertical slices (`api/`, `screens/`, `components/`, `hooks/`, `store/`, `types/`, `utils/`).
- A feature owns its domain-specific formatting, SEO helpers, UI state, and API wrappers.
- Do not place catalog-specific code in `core/` or `shared/`.

Shared promotion rules:

- Promote code to `shared/` only when at least two features need the same behavior.
- `shared/` stays domain-agnostic (no catalog semantics, no API route knowledge).
- When in doubt, keep code inside the feature until reuse is proven.

API client import policy:

- Import API types from `@sd/contracts` public exports.
- Use query hooks from `@sd/contracts/query/hooks` for data fetching.
- Initialize the API client once per app with `initApiClient()`.

Styling policy:

- Use design tokens from `@sd/design-tokens` as the single source of truth for CSS variables (emitted via `src/app/theme-css.ts`).
- Use tokenized design primitives from `src/app/globals.css` and component styles (no legacy hardcoded values).
- Avoid one-off hardcoded colors/spacing/radius/shadows in feature components.
- If a required token is missing, make a small, deliberate update in `packages/design-tokens`.
- Keep green-accent catalog language calm, structured, and readable.

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

## Brand assets

- Favicons/app icons live in `apps/web/src/app/favicon.ico` and `apps/web/public/icons/*`; wire them via Next metadata in `apps/web/src/app/layout.tsx`.
- Logos live in `apps/web/public/logo/*`; reference them as `/logo/<file>` in UI (e.g. with `next/image`).

Information architecture:

- Web route IA can diverge from backend endpoint shapes when UX/SEO benefits.
- Backend remains authoritative; web IA is a presentation concern.

Direction:

- features -> core/shared
- core -> shared
- app composes features

## Data-fetching guidance

- Public pages: SSR/SSG as appropriate; respect publication status.
- Auth/admin flows: interactive client paths, backend-authorized.
- Keep client state derived from authoritative API responses.

## Commands (run from repo root)

- Dev: `pnpm dev:web`
- Build: `pnpm --filter web build`
- Lint: `pnpm --filter web lint`
- Typecheck: `pnpm --filter web typecheck`
- Unit/integration tests: `pnpm --filter web test`
- E2E (Playwright): `pnpm --filter web test:e2e`

## Single-test commands

- Jest file: `pnpm --filter web test -- src/path/to/file.test.tsx`
- Jest by name: `pnpm --filter web test -- -t "renders heading"`
- Playwright file: `pnpm --filter web test:e2e -- e2e/catalog.spec.ts`
- Playwright by title: `pnpm --filter web test:e2e -- --grep "catalog list"`
- Playwright project: `pnpm --filter web test:e2e -- --project chromium`

## API contracts

- Import shared types from `@sd/contracts`.
- Types are hand-written and stable - no codegen required.
- When API changes, update `packages/contracts/src/types/` manually.

## Quality expectations

- Preserve clear separation between UX logic and policy logic.
- Keep errors explicit and user-safe; do not swallow failures.
- Add tests for admin actions and permission-sensitive views.
- TypeScript strictness is non-negotiable: do not allow implicit `any`.
- For screen loaders/view-model builders, add explicit return types (especially around `Promise.all` results).
- For `map`/`filter`/`reduce` callbacks that can lose inference in CI, add explicit element types.
- Before finishing web changes, run `pnpm --filter web typecheck` and `pnpm --filter web build` locally to mirror CI.
