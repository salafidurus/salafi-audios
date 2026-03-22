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

## Shared Package Integration

The web app consumes the split shared packages directly: `@sd/shared`, `@sd/core-*`, and `@sd/feature-*`.

**How it works:**

- `next.config.ts` transpiles the shared `@sd/*` UI packages directly instead of importing pre-built bundles
- The repo now uses `.desktop.web.tsx`, `.web.tsx`, `.native.tsx`, and fallback `.tsx` variants
- Next.js resolves `.desktop.web` and `.web` variants first
- `react-native` is aliased to `react-native-web` via module resolver in Next config

**When to use shared package components:**

- Use `useResponsive()` from `@sd/shared` for breakpoint-aware rendering:
  - **Tablets/mobile (≤900px):** render package-provided mobile/tablet variants when they exist
  - **Desktop (>900px):** render desktop-specific layouts or `.desktop.web` variants
- Breakpoints: `MOBILE_MAX = 640px`, `TABLET_MAX = 900px`

**Web-specific CSS properties in shared package components:**

- `.web.tsx` files in shared packages use `_web` key inside `StyleSheet.create()` for CSS-only properties
- Import `View`/`Text`/`Pressable` from `react-native-unistyles/components/native/*` to enable `_web` key
- These are automatically applied on web, ignored on native
- Prefer colocating platform-specific files inside the owning package

---

## Responsive Routing Architecture

**CRITICAL — this is how all feature screens are structured:**

```text
app/(feature)/page.tsx                         ← server component, metadata only
features/<feature>/screens/<name>/
  <name>.screen.tsx                            ← responsive router (client component)
  <name>.screen.desktop.tsx                    ← desktop-only implementation
```

### Rules

- **`app/**/page.tsx`\*\* — server component, no hooks, imports one screen component, adds metadata
- **`features/**/screens/<name>/<name>.screen.tsx`\*\* — responsive router only:
  - Contains `useResponsive()`, decides mobile vs desktop
  - For mobile/tablet: renders the package-provided shared screen component with callback props wired to `authClient` / `router`
  - For desktop: renders `<NameDesktopScreen />`
- **`features/**/screens/<name>/<name>.screen.desktop.tsx`\*\* — desktop-only UI:
  - Uses Tailwind + CSS variables (`var(--token-name)`)
  - No `useResponsive()`, no mobile imports
  - All styles use design token CSS variables — never hardcode colors/spacing

```typescript
// features/auth/screens/sign-in/sign-in.screen.tsx — responsive router
"use client";
import { useRouter, useSearchParams } from "next/navigation";
import { SignInScreen as MobileSignInScreen } from "@sd/feature-auth";
import { SignInDesktopScreen } from "./sign-in.screen.desktop";
import { useResponsive } from "@sd/shared";
import { authClient } from "@sd/core-auth";

export function SignInScreen() {
  const router = useRouter();
  const { isMobile, isTablet } = useResponsive();

  if (isMobile || isTablet) {
    return (
      <MobileSignInScreen
        onSignIn={async (email, password) => { ... }}
        onSignInWithGoogle={() => authClient.signIn.social({ provider: "google" })}
        onSignInWithApple={() => authClient.signIn.social({ provider: "apple" })}
        onNavigateToSignUp={() => router.push("/sign-up")}
      />
    );
  }

  return <SignInDesktopScreen />;
}
```

### Naming Conventions

- Feature screen folders: `features/<feature>/screens/<name>/` (kebab-case)
- Responsive router: `<name>.screen.tsx`
- Desktop file: `<name>.screen.desktop.tsx`

### Top Auth Strip

- `TopAuthStrip` is hidden on auth routes (`/sign-in`, `/sign-up`) via `usePathname` check at the component level
- Add new auth routes to the `AUTH_ROUTES` constant in `top-auth-strip.tsx` if needed

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

- Import API types from `@sd/core-contracts` public exports
- Use query hooks from `@sd/core-contracts/query/hooks` for data fetching
- Initialize the API client once per app with `initApiClient()`

---

## Styling Rules

**Web-own components:**

- Use CSS Modules + design tokens via CSS variables (e.g., `var(--surface-canvas)`)
- Theme tokens are injected as CSS variables in `src/app/theme-css.ts` and applied in `src/app/layout.tsx`
- Never hardcode color/spacing/radius values — always reference a design token

**For shared package components rendered in web context:**

- Styling happens via the shared unistyles theme factory in `@sd/core-styles`
- Web-specific CSS properties use `_web` key inside `StyleSheet.create()`
- You don't need to override these when the package already owns the platform variant

**Design tokens (complete reference):**
See `packages/design-tokens/AGENT.md` for the authoritative token guide covering surface, border, content, spacing, radius, and typography.

---

## Icons

Two icon libraries available:

- **`lucide-react`** — primary icon library (consistent, minimal designs)
- **`huge-icons`** (from `'huge-icons/react'`) — alternative/distinctive icons

**Web-own components:** Use `lucide-react` or `huge-icons` depending on design needs.

**Shared package components rendered in web context:**

- The `.web.tsx` variants automatically import `lucide-react` (not lucide-react-native)
- They also support `huge-icons` via the same import paths
- No manual override needed when the shared package already provides the web variant

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
- Never use framer-motion in shared cross-platform package components
- For cross-platform animations in shared packages, use react-native-ease (native) only

---

## Navigation

**Web sidebar:**

- Lives in `src/features/navigation/components/sidebar/`
- Not a shared cross-platform package component (web-specific layout)

**Shared navigation types + store:**

- Shared navigation types, routes, and state come from `@sd/feature-navigation`:
  - `SECTION_TABS`, `SECTION_ROUTES`, `SECTION_LABELS` — constants
  - `getCurrentSection()`, `getActiveTabFromPath()` — utilities
  - `useNavigationStore()` — Zustand store for active section/tab
- Web sidebar consumes these shared utilities to stay in sync with mobile

**Mobile navigation:**

- Expo Router `Tabs` owns top-level mobile navigation
- Mobile renders an app-owned custom tab bar and subsection bar over tab state
- Shared section constants and helpers in `@sd/feature-navigation` still keep web and mobile aligned

---

## Data-Fetching Guidance

- Public pages: SSR/SSG as appropriate; respect publication status
- Auth/admin flows: interactive client paths, backend-authorized
- Keep client state derived from authoritative API responses

---

## Brand Assets

- Favicons/app icons live in `apps/web/src/app/favicon.ico` and `apps/web/public/icons/*`; wire them via Next metadata in `apps/web/src/app/layout.tsx`
- Logos live in `apps/web/public/logo/*`; reference them as `/logo/<file>` in UI (e.g. with `next/image`)
- Auth provider button assets live in `apps/web/public/auth/*`
- Web auth provider buttons should stay provider-branded; use the full branded button assets rather than recoloring them into app-brand CTAs

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

- Import shared types from `@sd/core-contracts`
- Types are hand-written and stable — no codegen required
- When API changes, update `packages/core-contracts/src/types/` manually

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

- `docs/AGENT.md` - Update implementation gap analysis and phase status when needed
- Relevant top-level docs file in `docs/` - If web architecture, routing, SEO, or platform boundaries change
