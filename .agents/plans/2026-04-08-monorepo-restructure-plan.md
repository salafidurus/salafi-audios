# Monorepo Restructure — In-App Feature Slices + TDD Enforcement Plan

> **For agentic workers:** REQUIRED: Use superpowers:subagent-driven-development (if subagents available) or superpowers:executing-plans to implement this plan. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Dissolve `packages/feature-*` into per-app `src/features/` slices, extract shared data logic into domain packages, split `packages/shared` primitives into their owning apps, enforce full TDD, and remove all React Native Web from `apps/web`.

**Architecture:** Each app owns its feature code entirely (`apps/mobile/src/features/`, `apps/web/src/features/`). Shared data/state lives in `packages/domain-*` organized by bounded context. Truly cross-app UI primitives live in `packages/shared`. The `app/` layer in each app is routing-only and only imports from the local `../features/` layer.

**Tech Stack:** Expo Router (mobile native only), Next.js App Router (web, CSS-responsive), pnpm workspaces, Turborepo, Jest (unit + component), Playwright (e2e web)

---

## New Folder Conventions

### `apps/mobile/src/`

```
app/               ← Expo Router — routing ONLY, imports from ../features or ../shared
features/
  <feature>/
    components/    ← feature-scoped UI components
      SomeComp.tsx
      SomeComp.ios.tsx      ← iOS-only override (only when truly diverges)
      SomeComp.android.tsx  ← Android-only override (only when truly diverges)
    hooks/         ← feature-local hooks (non-shared)
    utils/         ← feature-local pure utils
    screens/
      some.screen.tsx
      some.screen.ios.tsx   ← iOS-only screen (only when truly diverges)
shared/            ← primitives/wrappers used across 2+ features (mobile-only)
  components/
  hooks/
  utils/
```

### `apps/web/src/`

```
app/               ← Next.js App Router — routing ONLY, imports from ../features or ../shared
features/
  <feature>/
    components/
      SomeComp.tsx          ← base (fully responsive via CSS is the default)
      SomeComp.desktop.tsx  ← only when desktop layout truly diverges
      SomeComp.mobile.tsx   ← only when mobile-web layout truly diverges
    hooks/
    utils/
    screens/
      some.screen.tsx
      some.screen.desktop.tsx
      some.screen.mobile.tsx
shared/            ← primitives used across 2+ features (web-only)
  components/
  hooks/
  utils/
```

### `packages/` after restructure

```
core-*             ← infrastructure (db, env, auth, api, config, styles, i18n, contracts)
domain-content     ← NEW: lectures, scholars, series, feed, library data hooks
domain-account     ← NEW: user profile, auth state hooks
domain-live        ← NEW: live sessions/channels hooks
domain-playback    ← EXISTS: player engine/state
domain-progress    ← EXISTS: progress tracking
domain-search      ← EXISTS: search/quick-browse hooks
design-tokens      ← stays as-is
shared/            ← TRIMMED: only truly cross-app (web + native) utilities remain
util-*             ← stays as-is
```

---

## TDD Rule (applies to every task in this plan)

For EVERY piece of code moved or created:

1. Write the failing test first (co-located `.spec.tsx` or `.spec.ts`)
2. Run it — confirm it fails with an expected error, not a setup error
3. Write minimal implementation to make it pass
4. Run it — confirm it passes
5. Run ALL tests in the workspace — confirm nothing else broke
6. Commit test + implementation together

Test everything: screens, components, hooks, utils, domain stores. No exceptions.

---

## Phase 0 — Documentation & Rules

### Task 0.1: Update root AGENT.md with new structure and TDD rules

**Files:**

- Modify: `AGENT.md`

- [ ] **Step 1: Write a failing test that verifies AGENT.md contains the new structure keys**

```bash
# Use grep as a quick assertion — this "test" is the review gate
grep -q "apps/mobile/src/features" AGENT.md && echo "PASS" || echo "FAIL - missing features section"
grep -q "apps/web/src/features" AGENT.md && echo "PASS" || echo "FAIL - missing features section"
grep -q "\.ios\.tsx" AGENT.md && echo "PASS" || echo "FAIL - missing iOS extension rule"
grep -q "domain-content" AGENT.md && echo "PASS" || echo "FAIL - missing domain-content"
```

Expected: all FAIL (the content doesn't exist yet)

- [ ] **Step 2: Update the "Repo layout" section in `AGENT.md`**

Replace the existing App Structure and Repo Layout sections with:

````markdown
## Repo layout

- `apps/api` - authoritative backend core
- `apps/web` - public/admin web client (Next.js, CSS-responsive — no React Native Web)
- `apps/mobile` - offline-first native client (iOS + Android — no Expo Web)
- `packages/*` - shared libraries: core infra, domain state, design tokens, cross-app utilities
- `docs/` - product + implementation authority

### App source structure

Both apps follow this layout:

```text
src/
  app/        ← routing ONLY — imports screen components from ../features or ../shared
  features/   ← one folder per feature; each owns components, hooks, screens, utils
  shared/     ← components and hooks used across 2+ features within this app
```
````

### Platform file extensions

Mobile (`apps/mobile`):

- `.tsx` — base native component (iOS + Android)
- `.ios.tsx` — iOS-only override (only when behavior truly diverges)
- `.android.tsx` — Android-only override (only when behavior truly diverges)

Web (`apps/web`):

- `.tsx` — base component, fully responsive via CSS (default)
- `.desktop.tsx` — desktop-only layout variant (only when truly needed)
- `.mobile.tsx` — mobile-web layout variant (only when truly needed)

### Package map

- `packages/core-db` - Database schema and client
- `packages/core-env` - Environment variable schemas
- `packages/core-i18n` - Internationalization config and keys
- `packages/core-contracts` - Shared TypeScript contracts (DTOs, types, query hooks)
- `packages/design-tokens` - Design tokens (colors, spacing, radius, typography)
- `packages/shared` - Cross-app utilities only (no platform-specific UI primitives)
- `packages/core-*` - Shared platform infrastructure (auth, API, config, styling)
- `packages/domain-content` - Lectures, scholars, series, feed, library data hooks
- `packages/domain-account` - User profile and auth state hooks
- `packages/domain-live` - Live session and channel hooks
- `packages/domain-playback` - Playback engine and player state
- `packages/domain-progress` - Progress tracking state
- `packages/domain-search` - Search and quick-browse hooks
- `packages/util-config` - Shared lint/build config
- `packages/util-ingest` - Content ingestion

````

- [ ] **Step 3: Replace TDD section in `AGENT.md` with the new stricter policy**

Replace the existing `## TDD policy` section with:

```markdown
## TDD policy

This repo follows strict Test-Driven Development. **No exceptions.**

### The workflow (non-negotiable)

1. Write the failing test — describe the behavior, not the implementation.
2. Run it: confirm it fails with the expected error, not a setup error.
3. Write the minimal code to make it pass.
4. Run it again: confirm it passes.
5. Run all tests: confirm nothing else broke.
6. Commit: test and implementation in the same commit.

### What to test

Test everything: screens, components, hooks, utils, stores, guards, services.
The only exceptions are:

- Framework-provided behavior (NestJS DI wiring, Expo Router navigation internals).
- Third-party library internals.
- Generated code artifacts.

Testing everything prevents duplication — you will not write the same test twice if
everything is already covered.

### Test placement

| Location | Test file |
|---|---|
| `apps/mobile/src/features/<f>/screens/` | co-located `.spec.tsx` |
| `apps/mobile/src/features/<f>/components/` | co-located `.spec.tsx` |
| `apps/mobile/src/features/<f>/hooks/` | co-located `.spec.ts` |
| `apps/web/src/features/<f>/screens/` | co-located `.spec.tsx` |
| `apps/web/src/features/<f>/components/` | co-located `.spec.tsx` |
| `apps/web/src/features/<f>/hooks/` | co-located `.spec.ts` |
| `apps/mobile/src/shared/` | co-located `.spec.tsx` |
| `apps/web/src/shared/` | co-located `.spec.tsx` |
| `packages/domain-*/src/` | co-located `.spec.ts` |
| `apps/api/src/modules/<m>/` | co-located `.service.spec.ts` |

### Running tests

- All: `pnpm test`
- Mobile only: `pnpm --filter mobile test`
- Web only: `pnpm --filter web test`
- Single file: `pnpm --filter mobile test -- src/features/feed/screens/feed.screen.spec.tsx`
````

- [ ] **Step 4: Run the grep assertions from Step 1**

```bash
grep -q "apps/mobile/src/features" AGENT.md && echo "PASS" || echo "FAIL"
grep -q "\.ios\.tsx" AGENT.md && echo "PASS" || echo "FAIL"
grep -q "domain-content" AGENT.md && echo "PASS" || echo "FAIL"
```

Expected: all PASS

- [ ] **Step 5: Commit**

```bash
git add AGENT.md
git commit -m "docs(agent): update structure, platform extensions, and TDD policy"
```

---

### Task 0.2: Update guardrails skill with new structure and TDD rules

**Files:**

- Modify: `.agents/skills/project-guardrails/SKILL.md`

- [ ] **Step 1: Write grep assertions that will fail**

```bash
grep -q "Test everything" .agents/skills/project-guardrails/SKILL.md && echo "PASS" || echo "FAIL - TDD section missing"
grep -q "apps/mobile/src/features" .agents/skills/project-guardrails/SKILL.md && echo "PASS" || echo "FAIL - app structure missing"
```

Expected: all FAIL

- [ ] **Step 2: Replace the "App Structure" section in SKILL.md**

Replace existing `## App Structure` section with:

```markdown
## App Structure

### Mobile (`apps/mobile/src/`)

- **`app/`**: Routing ONLY — Expo Router. Imports screen components from `../features` or `../shared`.
- **`features/<name>/`**: One folder per feature. Contains `components/`, `hooks/`, `screens/`, `utils/`.
- **`shared/`**: Primitives used across 2+ features within the mobile app.

Platform extension rules:

- `.tsx` — base native (iOS + Android)
- `.ios.tsx` — iOS-only (only when behavior truly diverges)
- `.android.tsx` — Android-only (only when behavior truly diverges)

### Web (`apps/web/src/`)

- **`app/`**: Routing, layouts, and server components ONLY — Next.js App Router. Imports from `../features` or `../shared`.
- **`features/<name>/`**: One folder per feature. Contains `components/`, `hooks/`, `screens/`, `utils/`.
- **`shared/`**: Primitives used across 2+ features within the web app.
- Web is Next.js only — no React Native Web, no Expo Web.

Platform extension rules:

- `.tsx` — base, fully CSS-responsive (default — use this unless layout truly diverges)
- `.desktop.tsx` — desktop-only layout variant
- `.mobile.tsx` — mobile-web layout variant

### Backend (`apps/api/src/`)

- **Interface**: Controllers, DTOs, Auth guards.
- **Application**: Use-case orchestration, transactions.
- **Domain**: Invariants, transition rules.
- **Infrastructure**: DB, media, adapters (no policy).
```

- [ ] **Step 3: Replace the "Monorepo Boundaries" package map in SKILL.md**

Update the Package Map to:

```markdown
### Package Map

- **`@sd/shared`**: Cross-app utilities only (no platform-specific UI). Platform primitives live in each app's `src/shared/`.
- **`@sd/core-*`**: Foundational infrastructure (auth, api, config, styles, i18n, env, db, contracts).
- **`@sd/domain-content`**: Data hooks for lectures, scholars, series, feed, library.
- **`@sd/domain-account`**: Data hooks for user profile and auth state.
- **`@sd/domain-live`**: Data hooks for live sessions and channels.
- **`@sd/domain-playback`**: Playback engine and player state (Zustand + hooks).
- **`@sd/domain-progress`**: Progress tracking state (Zustand + hooks).
- **`@sd/domain-search`**: Search and quick-browse hooks.
- **`@sd/design-tokens`**: Design tokens — authoritative source.
- **`@sd/util-config`**: Shared lint/build config.
- **`@sd/util-ingest`**: Content ingestion tooling.
```

- [ ] **Step 4: Add TDD section to SKILL.md**

Add after the Monorepo Boundaries section:

```markdown
## TDD — Non-Negotiable Workflow

Every code change follows this exact sequence. No exceptions.

1. **Write the failing test** — describe behavior, not implementation.
2. **Run it** — confirm it fails with the expected error (not a setup error).
3. **Write minimal implementation** to make it pass.
4. **Run it again** — confirm it passes.
5. **Run all tests** — confirm nothing else broke (`pnpm test`).
6. **Commit** — test and implementation in the same commit.

Test everything: screens, components, hooks, utils, stores, services, guards.
The only exceptions: framework DI wiring, third-party library internals, generated artifacts.

Co-locate test files next to the source file:

- `SomeComponent.tsx` → `SomeComponent.spec.tsx`
- `use-some-hook.ts` → `use-some-hook.spec.ts`
- `some.screen.tsx` → `some.screen.spec.tsx`
```

- [ ] **Step 5: Run assertions from Step 1**

```bash
grep -q "Test everything" .agents/skills/project-guardrails/SKILL.md && echo "PASS" || echo "FAIL"
grep -q "apps/mobile/src/features" .agents/skills/project-guardrails/SKILL.md && echo "PASS" || echo "FAIL"
```

Expected: all PASS

- [ ] **Step 6: Commit**

```bash
git add .agents/skills/project-guardrails/SKILL.md
git commit -m "docs(guardrails): update app structure, package map, and add strict TDD rules"
```

---

## Phase 1 — Scaffold New App Structures

### Task 1.1: Scaffold `apps/mobile/src/features/` and `apps/mobile/src/shared/`

**Files:**

- Create: `apps/mobile/src/features/.gitkeep`
- Create: `apps/mobile/src/shared/components/.gitkeep`
- Create: `apps/mobile/src/shared/hooks/.gitkeep`
- Create: `apps/mobile/src/shared/utils/.gitkeep`

- [ ] **Step 1: Write a test that asserts the directories exist**

```bash
# This will fail until directories are created
[ -d apps/mobile/src/features ] && echo "PASS" || echo "FAIL - features dir missing"
[ -d apps/mobile/src/shared/components ] && echo "PASS" || echo "FAIL - shared/components missing"
```

Expected: FAIL

- [ ] **Step 2: Create the directories**

```bash
mkdir -p apps/mobile/src/features
mkdir -p apps/mobile/src/shared/components
mkdir -p apps/mobile/src/shared/hooks
mkdir -p apps/mobile/src/shared/utils
touch apps/mobile/src/features/.gitkeep
touch apps/mobile/src/shared/components/.gitkeep
touch apps/mobile/src/shared/hooks/.gitkeep
touch apps/mobile/src/shared/utils/.gitkeep
```

- [ ] **Step 3: Run assertion**

```bash
[ -d apps/mobile/src/features ] && echo "PASS" || echo "FAIL"
[ -d apps/mobile/src/shared/components ] && echo "PASS" || echo "FAIL"
```

Expected: all PASS

- [ ] **Step 4: Commit**

```bash
git add apps/mobile/src/features apps/mobile/src/shared
git commit -m "chore(mobile): scaffold features/ and shared/ directories"
```

---

### Task 1.2: Scaffold `apps/web/src/features/` and `apps/web/src/shared/`

**Files:**

- Create: `apps/web/src/features/.gitkeep`
- Create: `apps/web/src/shared/components/.gitkeep`
- Create: `apps/web/src/shared/hooks/.gitkeep`
- Create: `apps/web/src/shared/utils/.gitkeep`

- [ ] **Step 1: Write assertion that will fail**

```bash
[ -d apps/web/src/features ] && echo "PASS" || echo "FAIL - features dir missing"
[ -d apps/web/src/shared/components ] && echo "PASS" || echo "FAIL"
```

Expected: FAIL

- [ ] **Step 2: Create the directories**

```bash
mkdir -p apps/web/src/features
mkdir -p apps/web/src/shared/components
mkdir -p apps/web/src/shared/hooks
mkdir -p apps/web/src/shared/utils
touch apps/web/src/features/.gitkeep
touch apps/web/src/shared/components/.gitkeep
touch apps/web/src/shared/hooks/.gitkeep
touch apps/web/src/shared/utils/.gitkeep
```

- [ ] **Step 3: Run assertion**

```bash
[ -d apps/web/src/features ] && echo "PASS" || echo "FAIL"
[ -d apps/web/src/shared ] && echo "PASS" || echo "FAIL"
```

Expected: all PASS

- [ ] **Step 4: Commit**

```bash
git add apps/web/src/features apps/web/src/shared
git commit -m "chore(web): scaffold features/ and shared/ directories"
```

---

## Phase 2 — New Domain Packages

### Task 2.1: Create `packages/domain-content`

Covers: lectures, scholars, series, feed, library data-fetching hooks.

**Files:**

- Create: `packages/domain-content/package.json`
- Create: `packages/domain-content/tsconfig.json`
- Create: `packages/domain-content/src/index.ts`
- Create: `packages/domain-content/src/index.spec.ts`

- [ ] **Step 1: Write failing test**

```typescript
// packages/domain-content/src/index.spec.ts
import { domainContentVersion } from "./index";

describe("domain-content", () => {
  it("exports a version string", () => {
    expect(typeof domainContentVersion).toBe("string");
  });
});
```

Run: `pnpm --filter domain-content test`
Expected: FAIL — module not found

- [ ] **Step 2: Create the package**

```json
// packages/domain-content/package.json
{
  "name": "@sd/domain-content",
  "version": "0.0.1",
  "private": true,
  "main": "./src/index.ts",
  "types": "./src/index.ts",
  "scripts": {
    "test": "jest",
    "typecheck": "tsc --noEmit"
  },
  "dependencies": {
    "@sd/core-contracts": "workspace:*"
  },
  "devDependencies": {
    "@sd/util-config": "workspace:*",
    "typescript": "catalog:"
  }
}
```

```json
// packages/domain-content/tsconfig.json
{
  "extends": "../../tsconfig.base.json",
  "compilerOptions": {
    "outDir": "./dist"
  },
  "include": ["src"]
}
```

```typescript
// packages/domain-content/src/index.ts
export const domainContentVersion = "0.0.1";
```

- [ ] **Step 3: Install and run test**

```bash
pnpm i
pnpm --filter domain-content test
```

Expected: PASS

- [ ] **Step 4: Run all tests**

```bash
pnpm test
```

Expected: all pass

- [ ] **Step 5: Commit**

```bash
git add packages/domain-content
git commit -m "feat(domain-content): scaffold package for lectures, scholars, feed, library hooks"
```

---

### Task 2.2: Create `packages/domain-account`

Covers: user profile hooks, auth state hooks shared between mobile and web.

**Files:**

- Create: `packages/domain-account/package.json`
- Create: `packages/domain-account/tsconfig.json`
- Create: `packages/domain-account/src/index.ts`
- Create: `packages/domain-account/src/index.spec.ts`

- [ ] **Step 1: Write failing test**

```typescript
// packages/domain-account/src/index.spec.ts
import { domainAccountVersion } from "./index";

describe("domain-account", () => {
  it("exports a version string", () => {
    expect(typeof domainAccountVersion).toBe("string");
  });
});
```

Run: `pnpm --filter domain-account test`
Expected: FAIL

- [ ] **Step 2: Create package** (same structure as domain-content, name `@sd/domain-account`)

```typescript
// packages/domain-account/src/index.ts
export const domainAccountVersion = "0.0.1";
```

- [ ] **Step 3: Run test**

```bash
pnpm i && pnpm --filter domain-account test
```

Expected: PASS

- [ ] **Step 4: Run all tests + commit**

```bash
pnpm test
git add packages/domain-account
git commit -m "feat(domain-account): scaffold package for user profile and auth state hooks"
```

---

### Task 2.3: Create `packages/domain-live`

Covers: live session and channel hooks shared between mobile and web.

**Files:**

- Create: `packages/domain-live/package.json`
- Create: `packages/domain-live/tsconfig.json`
- Create: `packages/domain-live/src/index.ts`
- Create: `packages/domain-live/src/index.spec.ts`

- [ ] **Step 1: Write failing test**

```typescript
// packages/domain-live/src/index.spec.ts
import { domainLiveVersion } from "./index";

describe("domain-live", () => {
  it("exports a version string", () => {
    expect(typeof domainLiveVersion).toBe("string");
  });
});
```

Run: `pnpm --filter domain-live test`
Expected: FAIL

- [ ] **Step 2: Create package** (same structure, name `@sd/domain-live`)

```typescript
// packages/domain-live/src/index.ts
export const domainLiveVersion = "0.0.1";
```

- [ ] **Step 3: Run test + commit**

```bash
pnpm i && pnpm --filter domain-live test
pnpm test
git add packages/domain-live
git commit -m "feat(domain-live): scaffold package for live session and channel hooks"
```

---

## Phase 3 — Migrate `packages/shared` Native Primitives

### Task 3.1: Move native primitives from `packages/shared` to `apps/mobile/src/shared/`

**Files:**

- Read: `packages/shared/src/index.native.ts` (identify all native-only exports)
- Move each native-only component from `packages/shared/src/components/` → `apps/mobile/src/shared/components/`
- Update `apps/mobile` imports

- [ ] **Step 1: Audit native-only exports**

```bash
cat packages/shared/src/index.native.ts
```

List every export that is `.native.tsx` and has no web counterpart.

- [ ] **Step 2: For each native-only component, write a failing test in its new location**

Example for `ScreenViewMobileNative`:

```typescript
// apps/mobile/src/shared/components/ScreenViewMobileNative.spec.tsx
import React from 'react';
import { render } from '@testing-library/react-native';
import { ScreenViewMobileNative } from './ScreenViewMobileNative';

describe('ScreenViewMobileNative', () => {
  it('renders children', () => {
    const { getByText } = render(
      <ScreenViewMobileNative>
        <React.Fragment>hello</React.Fragment>
      </ScreenViewMobileNative>
    );
    expect(getByText('hello')).toBeTruthy();
  });
});
```

Run: `pnpm --filter mobile test -- src/shared/components/ScreenViewMobileNative.spec.tsx`
Expected: FAIL

- [ ] **Step 3: Copy each native-only component file to `apps/mobile/src/shared/components/`**

Update internal imports to use workspace packages or relative paths as needed.

- [ ] **Step 4: Run tests**

```bash
pnpm --filter mobile test -- src/shared/components/ScreenViewMobileNative.spec.tsx
```

Expected: PASS

- [ ] **Step 5: Update `apps/mobile` usages**

```bash
# Find all mobile files importing ScreenViewMobileNative from @sd/shared
grep -r "ScreenViewMobileNative" apps/mobile/src --include="*.tsx" -l
```

Update each import from `@sd/shared` to `../../shared/components/ScreenViewMobileNative` (or appropriate relative path).

- [ ] **Step 6: Run all mobile tests**

```bash
pnpm --filter mobile test
```

Expected: all pass

- [ ] **Step 7: Remove native-only exports from `packages/shared/src/index.native.ts`**

- [ ] **Step 8: Run all tests**

```bash
pnpm test
```

Expected: all pass

- [ ] **Step 9: Commit**

```bash
git add apps/mobile/src/shared packages/shared/src
git commit -m "refactor(shared): move native-only primitives into apps/mobile/src/shared"
```

---

### Task 3.2: Move web-only primitives from `packages/shared` to `apps/web/src/shared/`

Same process as Task 3.1 but for web-only exports from `packages/shared/src/index.web.ts`.

- [ ] **Step 1: Audit web-only exports**

```bash
cat packages/shared/src/index.web.ts
```

- [ ] **Step 2: For each web-only component, write a failing test in `apps/web/src/shared/components/`**

```typescript
// apps/web/src/shared/components/SomeWebPrimitive.spec.tsx
import React from 'react';
import { render } from '@testing-library/react';
import { SomeWebPrimitive } from './SomeWebPrimitive';

describe('SomeWebPrimitive', () => {
  it('renders without crashing', () => {
    const { container } = render(<SomeWebPrimitive />);
    expect(container).toBeTruthy();
  });
});
```

Run: `pnpm --filter web test`
Expected: FAIL

- [ ] **Step 3: Copy web-only components to `apps/web/src/shared/components/`**

- [ ] **Step 4: Run web tests**

```bash
pnpm --filter web test
```

Expected: PASS

- [ ] **Step 5: Update `apps/web` usages, remove web-only exports from `packages/shared`**

- [ ] **Step 6: Run all tests + commit**

```bash
pnpm test
git add apps/web/src/shared packages/shared/src
git commit -m "refactor(shared): move web-only primitives into apps/web/src/shared"
```

---

## Phase 4 — Feature Migration (one feature at a time)

Each feature follows the same migration template. Execute features in this order (least-coupled first):

1. `feature-legal`
2. `feature-support`
3. `feature-navigation`
4. `feature-auth` → extract hooks to `domain-account`
5. `feature-account` → extract hooks to `domain-account`
6. `feature-feed` → extract hooks to `domain-content`
7. `feature-library` → extract hooks to `domain-content`
8. `feature-lecture` → extract hooks to `domain-content`
9. `feature-scholar` → extract hooks to `domain-content`
10. `feature-search` → merge hooks into existing `domain-search`
11. `feature-playback` → merge hooks into existing `domain-playback`
12. `feature-progress` → merge hooks into existing `domain-progress`
13. `feature-live` → extract hooks to `domain-live`
14. `feature-downloads` (mobile-only)
15. `feature-admin` (web-only)

---

### Feature Migration Template

Replace `<feature>` with the feature name (e.g., `legal`, `feed`).

**Files:**

- Read: `packages/feature-<feature>/src/` (understand what exists)
- Create: `apps/mobile/src/features/<feature>/` (for native screens/components)
- Create: `apps/web/src/features/<feature>/` (for web screens/components)
- Modify: relevant `packages/domain-*` (for shared hooks)
- Delete: `packages/feature-<feature>/` (after all imports updated)

#### Step A — Audit

- [ ] **A1: List all files in the feature package**

```bash
find packages/feature-<feature>/src -type f | sort
```

- [ ] **A2: Identify what goes where**

Categorize each file:

- `.native.tsx` → `apps/mobile/src/features/<feature>/`
- `.ios.tsx` → `apps/mobile/src/features/<feature>/` (keep `.ios.tsx` extension)
- `.web.tsx` / `.desktop.web.tsx` / `.mobile.web.tsx` → `apps/web/src/features/<feature>/` (rename: `.mobile.web.tsx` → `.mobile.tsx`, `.desktop.web.tsx` → `.desktop.tsx`)
- Hooks shared between mobile + web → `packages/domain-<appropriate>/src/`
- Hooks used only in mobile → `apps/mobile/src/features/<feature>/hooks/`
- Hooks used only in web → `apps/web/src/features/<feature>/hooks/`

#### Step B — Write failing tests

- [ ] **B1: For each screen/component being moved, write a co-located failing test at the destination**

Mobile screen example:

```typescript
// apps/mobile/src/features/<feature>/screens/<screen>.screen.spec.tsx
import React from 'react';
import { render } from '@testing-library/react-native';
import { <ScreenName>Screen } from './<screen>.screen';

describe('<ScreenName>Screen', () => {
  it('renders without crashing', () => {
    const { toJSON } = render(<<ScreenName>Screen />);
    expect(toJSON()).toBeTruthy();
  });
});
```

Web screen example:

```typescript
// apps/web/src/features/<feature>/screens/<screen>.screen.spec.tsx
import React from 'react';
import { render } from '@testing-library/react';
import { <ScreenName>Screen } from './<screen>.screen';

describe('<ScreenName>Screen', () => {
  it('renders without crashing', () => {
    const { container } = render(<<ScreenName>Screen />);
    expect(container).toBeTruthy();
  });
});
```

- [ ] **B2: Run tests — confirm they fail**

```bash
pnpm --filter mobile test -- src/features/<feature>/
pnpm --filter web test -- src/features/<feature>/
```

Expected: FAIL — module not found

#### Step C — Migrate

- [ ] **C1: Create feature directory structure**

```bash
mkdir -p apps/mobile/src/features/<feature>/{components,hooks,screens,utils}
mkdir -p apps/web/src/features/<feature>/{components,hooks,screens,utils}
```

- [ ] **C2: Copy native files to `apps/mobile/src/features/<feature>/`**

- Remove the `.native` suffix from filenames (e.g., `feed.screen.native.tsx` → `feed.screen.tsx`)
- Keep `.ios.tsx` suffix as-is
- Update all imports inside each copied file (e.g., `@sd/feature-<feature>` → relative, `@sd/shared` → `../../shared/...`)

- [ ] **C3: Copy web files to `apps/web/src/features/<feature>/`**

- Remove `.desktop.web` suffix (→ `.desktop.tsx`), `.mobile.web` suffix (→ `.mobile.tsx`), `.web` suffix (→ `.tsx`)
- Rewrite any Unistyles / React Native imports to use CSS/Tailwind equivalents
- Remove any React Native Web patterns

- [ ] **C4: Extract shared hooks to the appropriate domain package**

For hooks used by both mobile and web versions of this feature:

1. Write a failing test in the domain package first:

```typescript
// packages/domain-<domain>/src/<hook-name>.spec.ts
import { renderHook } from '@testing-library/react';
import { use<HookName> } from './<hook-name>';

describe('use<HookName>', () => {
  it('returns expected shape', () => {
    const { result } = renderHook(() => use<HookName>());
    expect(result.current).toBeDefined();
  });
});
```

2. Run — confirm FAIL
3. Move hook to `packages/domain-<domain>/src/<hook-name>.ts`
4. Export from `packages/domain-<domain>/src/index.ts`
5. Run — confirm PASS

#### Step D — Wire up

- [ ] **D1: Update routing files to import from local features**

In `apps/mobile/src/app/`:

```typescript
// Before
import { FeedMobileNativeScreen } from "@sd/feature-feed";

// After
import { FeedScreen } from "../features/feed/screens/feed.screen";
```

In `apps/web/src/app/`:

```typescript
// Before
import { FeedResponsiveScreen } from "@sd/feature-feed";

// After
import { FeedScreen } from "../features/feed/screens/feed.screen";
```

- [ ] **D2: Update any other cross-feature or shared imports within the app**

#### Step E — Verify

- [ ] **E1: Run the failing tests from Step B — confirm they now pass**

```bash
pnpm --filter mobile test -- src/features/<feature>/
pnpm --filter web test -- src/features/<feature>/
```

Expected: PASS

- [ ] **E2: Run all tests**

```bash
pnpm test
```

Expected: all pass

- [ ] **E3: Run typecheck**

```bash
pnpm typecheck
```

Expected: no errors

#### Step F — Delete the feature package

- [ ] **F1: Remove `packages/feature-<feature>/` from the workspace**

```bash
rm -rf packages/feature-<feature>
```

- [ ] **F2: Remove from `pnpm-workspace.yaml` if explicitly listed**

- [ ] **F3: Remove `@sd/feature-<feature>` from any `package.json` that still references it**

```bash
grep -r "feature-<feature>" apps packages --include="package.json"
```

- [ ] **F4: Run install + all tests**

```bash
pnpm i
pnpm test
pnpm typecheck
```

Expected: all pass

- [ ] **F5: Commit**

```bash
git add -A
git commit -m "feat(<feature>): migrate to apps/mobile/src/features and apps/web/src/features, remove packages/feature-<feature>"
```

---

## Phase 5 — Feature-Specific Migration Notes

### 5.1 `feature-legal` (simple — no shared hooks)

- Native screens → `apps/mobile/src/features/legal/screens/`
- Web screens → `apps/web/src/features/legal/screens/`
- No hooks to extract to domain packages
- Web: drop `.mobile.web.tsx` variants — replace with single responsive `.tsx` screen using CSS breakpoints

### 5.2 `feature-support` (simple — no shared hooks)

- Same pattern as legal
- No domain package extraction needed

### 5.3 `feature-navigation` (mobile-only nav helpers + web nav helpers)

- Mobile nav utilities → `apps/mobile/src/features/navigation/`
- Web nav utilities → `apps/web/src/features/navigation/`
- No domain package needed

### 5.4 `feature-auth`

- Native screens → `apps/mobile/src/features/auth/screens/`
- Web screens → `apps/web/src/features/auth/screens/`
- Shared auth state hooks → `packages/domain-account/src/`
- Both apps depend on `@sd/domain-account` after migration

### 5.5 `feature-account`

- Same split as auth
- Profile hooks shared between mobile + web → `packages/domain-account/src/`

### 5.6 `feature-feed`

- Native screens → `apps/mobile/src/features/feed/screens/`
- Web screens → `apps/web/src/features/feed/screens/`
- `useFeed`, `useFeedScholars` → `packages/domain-content/src/`
- Drop `.mobile.web.tsx` and `.responsive.web.tsx` web variants — web gets a single responsive `.tsx` screen + optional `.desktop.tsx` if layout truly diverges

### 5.7 `feature-library`

- Same split pattern as feed
- Library data hooks → `packages/domain-content/src/`

### 5.8 `feature-lecture`

- Mobile lecture screens → `apps/mobile/src/features/lecture/screens/`
- Web lecture screens → `apps/web/src/features/lecture/screens/`
- Lecture detail hooks → `packages/domain-content/src/`

### 5.9 `feature-scholar`

- Mobile scholar screens → `apps/mobile/src/features/scholar/screens/`
- Web scholar screens → `apps/web/src/features/scholar/screens/`
- Scholar data hooks → `packages/domain-content/src/`

### 5.10 `feature-search`

- Mobile screens → `apps/mobile/src/features/search/screens/`
- Web screens → `apps/web/src/features/search/screens/`
- `useQuickBrowse`, search hooks → `packages/domain-search/src/` (already exists — add to it)

### 5.11 `feature-playback`

- Mobile-only — fullscreen player → `apps/mobile/src/features/playback/screens/`
- Any new hooks → `packages/domain-playback/src/` (already exists)

### 5.12 `feature-progress`

- Check if it has screens; if not, only hooks extraction needed
- Hooks → `packages/domain-progress/src/` (already exists)

### 5.13 `feature-live`

- Mobile live screens → `apps/mobile/src/features/live/screens/`
- Web live screens → `apps/web/src/features/live/screens/`
- Live session hooks → `packages/domain-live/src/`

### 5.14 `feature-downloads` (mobile-only)

- All code → `apps/mobile/src/features/downloads/`
- No web counterpart
- No domain package extraction (download state is mobile-only)

### 5.15 `feature-admin` (web-only)

- All code → `apps/web/src/features/admin/`
- No mobile counterpart
- No domain package extraction

---

## Phase 6 — Build Configuration Updates

### Task 6.1: Update `turbo.json` pipeline

**Files:**

- Modify: `turbo.json`

- [ ] **Step 1: Write assertion that will fail**

```bash
# Verify turbo doesn't reference deleted feature packages
grep -r "feature-" turbo.json && echo "FAIL - stale feature refs" || echo "PASS"
```

- [ ] **Step 2: Remove any explicit feature package pipeline entries**

Remove pipeline entries for `@sd/feature-*` if they exist. The apps (`mobile`, `web`) now own their feature code and their existing pipeline entries cover it.

- [ ] **Step 3: Add new domain packages to the pipeline**

Ensure `@sd/domain-content`, `@sd/domain-account`, `@sd/domain-live` have `build` and `test` entries consistent with existing `@sd/domain-*` entries.

- [ ] **Step 4: Run assertion + commit**

```bash
grep -r "feature-" turbo.json && echo "FAIL" || echo "PASS"
git add turbo.json
git commit -m "chore(turbo): remove feature package pipeline entries, add new domain packages"
```

---

### Task 6.2: Update `next.config.ts` transpile list

**Files:**

- Modify: `apps/web/next.config.ts`

- [ ] **Step 1: Write assertion**

```bash
grep "feature-" apps/web/next.config.ts && echo "FAIL - stale transpilePackages" || echo "PASS"
```

- [ ] **Step 2: Remove all `@sd/feature-*` from `transpilePackages`**

Add `@sd/domain-content`, `@sd/domain-account`, `@sd/domain-live` to `transpilePackages`.

- [ ] **Step 3: Run web build**

```bash
pnpm --filter web build
```

Expected: success

- [ ] **Step 4: Commit**

```bash
git add apps/web/next.config.ts
git commit -m "chore(web): update transpilePackages — remove feature-*, add new domain packages"
```

---

### Task 6.3: Update `apps/mobile/package.json` dependencies

**Files:**

- Modify: `apps/mobile/package.json`

- [ ] **Step 1: Remove all `@sd/feature-*` dependencies**

```bash
grep "feature-" apps/mobile/package.json
```

Remove each one. Add `@sd/domain-content`, `@sd/domain-account`, `@sd/domain-live` as workspace dependencies.

- [ ] **Step 2: Run install + typecheck**

```bash
pnpm i
pnpm --filter mobile typecheck
```

Expected: no errors

- [ ] **Step 3: Commit**

```bash
git add apps/mobile/package.json
git commit -m "chore(mobile): remove feature-* deps, add domain-* deps"
```

---

### Task 6.4: Update `apps/web/package.json` dependencies

**Files:**

- Modify: `apps/web/package.json`

- [ ] **Step 1: Remove all `@sd/feature-*` dependencies, add new domain deps**

```bash
grep "feature-" apps/web/package.json
```

- [ ] **Step 2: Run install + typecheck + build**

```bash
pnpm i
pnpm --filter web typecheck
pnpm --filter web build
```

Expected: no errors

- [ ] **Step 3: Commit**

```bash
git add apps/web/package.json
git commit -m "chore(web): remove feature-* deps, add domain-* deps"
```

---

## Phase 7 — Final Verification

### Task 7.1: Confirm no remaining `packages/feature-*` references

- [ ] **Step 1: Search for stale references**

```bash
grep -r "@sd/feature-" apps packages --include="*.ts" --include="*.tsx" --include="*.json" | grep -v "node_modules" | grep -v ".git"
```

Expected: zero results

- [ ] **Step 2: Confirm all feature package directories are gone**

```bash
ls packages/ | grep "^feature-"
```

Expected: no output

---

### Task 7.2: Full test suite

- [ ] **Step 1: Run all tests**

```bash
pnpm test
```

Expected: all pass

- [ ] **Step 2: Run typecheck across all packages**

```bash
pnpm typecheck
```

Expected: no errors

- [ ] **Step 3: Run lint**

```bash
pnpm lint
```

Expected: no errors

- [ ] **Step 4: Build web**

```bash
pnpm --filter web build
```

Expected: success

---

### Task 7.3: Update workspace README and docs

**Files:**

- Modify: `docs/architecture.md` (if it exists)
- Modify: `apps/mobile/AGENT.md`
- Modify: `apps/web/AGENT.md`

- [ ] **Step 1: Check what needs updating**

```bash
grep -l "feature-\|packages/feature" docs/ apps/mobile/AGENT.md apps/web/AGENT.md 2>/dev/null
```

- [ ] **Step 2: Update each file to reflect the new in-app feature structure**

- [ ] **Step 3: Final commit**

```bash
git add docs/ apps/mobile/AGENT.md apps/web/AGENT.md
git commit -m "docs: update architecture docs and workspace AGENT.md files for new feature-slice structure"
```

---

## Summary of what changes

| Before                                                          | After                                                          |
| --------------------------------------------------------------- | -------------------------------------------------------------- |
| `packages/feature-feed/src/screens/feed.screen.native.tsx`      | `apps/mobile/src/features/feed/screens/feed.screen.tsx`        |
| `packages/feature-feed/src/screens/feed.screen.web.tsx`         | `apps/web/src/features/feed/screens/feed.screen.tsx`           |
| `packages/feature-feed/src/screens/feed.screen.desktop.web.tsx` | `apps/web/src/features/feed/screens/feed.screen.desktop.tsx`   |
| `packages/feature-feed/src/screens/feed.screen.mobile.web.tsx`  | `apps/web/src/features/feed/screens/feed.screen.mobile.tsx`    |
| `packages/feature-feed/src/hooks/use-feed.ts` (shared)          | `packages/domain-content/src/use-feed.ts`                      |
| `packages/shared/src/components/ScreenViewMobileNative.tsx`     | `apps/mobile/src/shared/components/ScreenViewMobileNative.tsx` |
| `packages/shared/src/components/SomeWebWrapper.tsx`             | `apps/web/src/shared/components/SomeWebWrapper.tsx`            |
| `app/` imports `@sd/feature-feed`                               | `app/` imports `../features/feed/screens/feed.screen`          |

## What stays in `packages/`

- `core-*` — all infrastructure (unchanged)
- `domain-playback`, `domain-progress`, `domain-search` — expanded with more hooks
- `domain-content`, `domain-account`, `domain-live` — new, for shared data logic
- `design-tokens` — unchanged
- `shared` — trimmed to only truly cross-app utilities (no UI primitives)
- `util-*` — unchanged
