# AGENT.md - apps/web (Public + Admin Client)

This Next.js app is a client of the backend API, not an authority.

## Core responsibilities

- Public discovery (SEO-friendly pages, deep links, shareable routes).
- Admin/editor workflows with efficient UI and safe UX.
- Strict adherence to backend contracts and permissions.

## Agent skills scope

- If using Claude Code: Skills are defined at the root and listed in CLAUDE.md.
- If using OpenCode: Project-local skills live in `.opencode/skills/`.
- Keep web/Next.js skills scoped to this app directory.

## Non-negotiables

- Never move business rules from API into web.
- Authorization is backend-only; UI gating is convenience only.
- Never bypass explicit API transition endpoints.

---

## ui-mobile Integration

`@sd/ui-mobile` is a direct dependency used via cross-platform component transpilation.

**How it works:**

- `next.config.ts` has `transpilePackages: ["@sd/ui-mobile"]` — Next.js transpiles the package directly instead of importing pre-built bundles
- `@sd/ui-mobile` exports `.native.ts`, `.web.ts`, and fallback `.ts` files
- Next.js resolves `.web.ts` variants automatically
- `react-native` is aliased to `react-native-web` via module resolver in Next config

**When to use ui-mobile components:**

- Use `useResponsive()` hook (from `src/shared/hooks/use-responsive.ts`) for breakpoint-aware rendering:
  - **Tablets/mobile (≤900px):** render `@sd/ui-mobile` components (native feel)
  - **Desktop (>900px):** render web-specific layouts or skip ui-mobile
- Breakpoints: `MOBILE_MAX = 640px`, `TABLET_MAX = 900px`
- Example:

```typescript
import { useResponsive } from '@/shared/hooks/use-responsive';
import { SearchHomeScreen } from '@sd/ui-mobile';
import { DesktopSearchLayout } from '@/features/search/components/desktop-search-layout';

export function SearchScreen() {
  const { isMobile, isTablet } = useResponsive();

  // Render native-style UI on mobile/tablet
  if (isMobile || isTablet) {
    return <SearchHomeScreen />;
  }

  // Render web-specific layout on desktop
  return <DesktopSearchLayout />;
}
```

**Web-specific CSS properties in ui-mobile components:**

- `.web.tsx` files in ui-mobile use `_web` key inside `StyleSheet.create()` for CSS-only properties
- Import `View`/`Text`/`Pressable` from `react-native-unistyles/components/native/*` to enable `_web` key
- These are automatically applied on web, ignored on native
- See `packages/ui-mobile/AGENT.md` for details

---

## Structure and Dependency Direction

- `app/` — routing/layout/composition only
- `features/` — domain-facing UI/hooks
- `core/` — platform concerns (API wiring, session, caching, error normalization)
- `shared/` — primitives/utilities with no inward deps

**Route wrappers** in `src/app/**/page.tsx`:

- Import screen + metadata helpers from `features/*/screens/*`
- Avoid domain data fetching and feature business logic
- Keep routing declarative and minimal

**Feature ownership:**

- Feature folders are vertical slices (`api/`, `screens/`, `components/`, `hooks/`, `store/`, `types/`, `utils/`)
- A feature owns its domain-specific formatting, SEO helpers, UI state, and API wrappers
- Do not place catalog-specific code in `core/` or `shared/`

**Shared promotion:**

- Promote code to `shared/` only when at least two features need the same behavior
- `shared/` stays domain-agnostic (no catalog semantics, no API route knowledge)
- When in doubt, keep code inside the feature until reuse is proven

**API client:**

- Import API types from `@sd/contracts` public exports
- Use query hooks from `@sd/contracts/query/hooks` for data fetching
- Initialize the API client once per app with `initApiClient()`

---

## Styling Rules

**Web-own components:**

- Use CSS Modules + design tokens via CSS variables (e.g., `var(--surface-canvas)`)
- Theme tokens are injected as CSS variables in `src/app/theme-css.ts` and applied in `src/app/layout.tsx`
- Never hardcode color/spacing/radius values — always reference a design token

**For ui-mobile components rendered in web context:**

- Styling happens via unistyles theme factory (see `packages/ui-mobile/AGENT.md`)
- Web-specific CSS properties use `_web` key inside `StyleSheet.create()`
- You don't need to override these — they're already set up in ui-mobile

**Design tokens (complete reference):**
See `packages/design-tokens/AGENT.md` for the authoritative token guide covering surface, border, content, spacing, radius, and typography.

---

## Icons

Two icon libraries available:

- **`lucide-react`** — primary icon library (consistent, minimal designs)
- **`huge-icons`** (from `'huge-icons/react'`) — alternative/distinctive icons

**Web-own components:** Use `lucide-react` or `huge-icons` depending on design needs.

**ui-mobile components rendered in web context:**

- The `.web.tsx` variants automatically import `lucide-react` (not lucide-react-native)
- They also support `huge-icons` via the same import paths
- No manual override needed — ui-mobile components handle the correct imports

**Icon selection:**

- Prefer lucide-react for consistency
- Use huge-icons when lucide lacks an icon or for distinctive branding

---

## Animations

Use `framer-motion` for web animations.

```typescript
import { motion } from 'framer-motion';

<motion.div
  animate={{ scale: isHovered ? 1.05 : 1, opacity: isHovered ? 1 : 0.8 }}
  transition={{ type: 'spring', damping: 10, stiffness: 100 }}
  onMouseEnter={() => setIsHovered(true)}
  onMouseLeave={() => setIsHovered(false)}
/>
```

**⚠️ CRITICAL WARNING:** framer-motion does **NOT** work with react-native-web.

- Only use framer-motion in web-own components
- Never use framer-motion in shared ui-mobile components
- For cross-platform animations in ui-mobile, use react-native-ease (native) only

---

## Navigation

**Web sidebar:**

- Lives in `src/features/navigation/components/sidebar/`
- Not an `@sd/ui-mobile` component (web-specific layout)

**Shared navigation types + store:**

- All navigation types, routes, and state come from `@sd/ui-mobile`:
  - `SECTION_TABS`, `SECTION_ROUTES`, `SECTION_LABELS` — constants
  - `getCurrentSection()`, `getActiveTabFromPath()` — utilities
  - `useNavigationStore()` — Zustand store for active section/tab
- Web sidebar consumes these shared utilities to stay in sync with mobile

**Mobile navigation:**

- `AdaptiveShell` + `SectionTabBar` from `@sd/ui-mobile` (native-only)
- Uses the same shared store and types as web

---

## Data-Fetching Guidance

- Public pages: SSR/SSG as appropriate; respect publication status
- Auth/admin flows: interactive client paths, backend-authorized
- Keep client state derived from authoritative API responses

---

## Brand Assets

- Favicons/app icons live in `apps/web/src/app/favicon.ico` and `apps/web/public/icons/*`; wire them via Next metadata in `apps/web/src/app/layout.tsx`
- Logos live in `apps/web/public/logo/*`; reference them as `/logo/<file>` in UI (e.g. with `next/image`)

---

## Information Architecture

- Web route IA can diverge from backend endpoint shapes when UX/SEO benefits
- Backend remains authoritative; web IA is a presentation concern

---

## Dependency Direction

```file
app → features/*/screens
features/*/screens → features/*/components
features/*/components → core/shared
core → shared
```

---

## API Contracts

- Import shared types from `@sd/contracts`
- Types are hand-written and stable — no codegen required
- When API changes, update `packages/contracts/src/types/` manually

---

## Quality Expectations

- Preserve clear separation between UX logic and policy logic
- Keep errors explicit and user-safe; do not swallow failures
- Add tests for admin actions and permission-sensitive views
- TypeScript strictness is non-negotiable: do not allow implicit `any`
- For screen loaders/view-model builders, add explicit return types (especially around `Promise.all` results)
- For `map`/`filter`/`reduce` callbacks that can lose inference in CI, add explicit element types
- Before finishing web changes, run `pnpm --filter web typecheck` and `pnpm --filter web build` locally to mirror CI

---

## Commands (run from repo root)

- Dev: `pnpm dev:web`
- Build: `pnpm --filter web build`
- Lint: `pnpm --filter web lint`
- Typecheck: `pnpm --filter web typecheck`
- Unit/integration tests: `pnpm --filter web test`
- E2E (Playwright): `pnpm --filter web test:e2e`

### Single-test commands

- Jest file: `pnpm --filter web test -- src/path/to/file.test.tsx`
- Jest by name: `pnpm --filter web test -- -t "renders heading"`
- Playwright file: `pnpm --filter web test:e2e -- e2e/catalog.spec.ts`
- Playwright by title: `pnpm --filter web test:e2e -- --grep "catalog list"`
- Playwright project: `pnpm --filter web test:e2e -- --project chromium`

---

## Documentation Sync

When implementing features, update:

- `docs/product-overview/AGENT.md` - Update gap analysis status
- Relevant implementation-guide file - If patterns change
