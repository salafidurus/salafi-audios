---
title: "Consolidate Mobile/Desktop Screen Variants into Unified Responsive Screens"
type: refactor
status: pending
created: 2026-07-09
origin: .agents/plans/2026-07-08-consolidate-screen-variants.md
deepened: null
---

# Consolidate Mobile/Desktop Screen Variants into Unified Responsive Screens

## Summary

Merge 20+ mobile/desktop screen file pairs (40+ files) into single unified screen implementations using CSS media queries for layout/spacing and `useIsDesktop()` hooks for text/size differences. Reduces boilerplate by ~100 lines per screen while maintaining exact same responsive behavior and SSR guarantees.

**Impact:** ~60-80 files deleted, 20+ screens restructured, zero behavioral change.

---

## Problem Frame

The codebase currently separates responsive screens into multiple files:

- `.screen.desktop.tsx` and `.screen.mobile.tsx` (plus `.screen.tsx` router)
- `.screen.desktop.module.css` and `.screen.mobile.module.css`
- Each pair shares 70-90% of logic and JSX structure
- Router boilerplate (`<Responsive mobile={...} desktop={...} />`) adds no value once merged

This structure creates:

- Maintenance burden: changes must be applied to both files, or logic diverges
- Synchronization risk: easy to forget updating the mobile variant when changing desktop
- ~116 files that could be consolidated (4 files per 29 screens)
- Cognitive load: developers must read two files to understand one screen

**Opportunity:** CSS media queries and the existing `useIsDesktop()` hook are mature and well-tested. The SSR pattern is stable. Consolidation preserves behavior while reducing friction.

---

## Goals & Scope

### In Scope

- Consolidate 20+ screen pairs (admin, library, listing, auth, explore, legal, live, search) into single unified implementations
- Merge CSS modules into single `.module.css` file with `@media (max-width: 640px)` queries for mobile overrides
- Use `useIsDesktop()` hook for conditional text labels, icon sizes, button sizes, and component structures
- Delete all `.desktop.tsx`, `.mobile.tsx`, `.desktop.module.css`, `.mobile.module.css` files
- Update router files (`.screen.tsx`) to contain unified implementation directly
- Update `apps/web/AGENT.md` documentation to reflect new pattern
- Verify typecheck, test, and responsive behavior at both breakpoints

### Out of Scope

- Navigation/sidebar components (3-branch logic: mobile/tablet/desktop — keep separate)
- Components using `useResponsive()` multi-branch pattern (keep pattern, just clean up naming)
- Styling-only refactors beyond media query consolidation
- Performance optimization beyond file count reduction

### Deferred to Follow-Up Work

- Convert remaining single-variant screens to consistent consolidated pattern
- Audit and consolidate remaining navigation/layout components if benefits warrant
- Consider extracting common media query patterns into SCSS mixins

---

## Consolidation Rules (Authoritatively)

| Scenario                                                              | Implementation                                                                             |
| --------------------------------------------------------------------- | ------------------------------------------------------------------------------------------ |
| Layout differences (flex-direction, grid vs flex, sidebar vs stacked) | CSS `@media (max-width: 640px)`                                                            |
| Spacing/padding differences                                           | CSS media queries using semantic token variants                                            |
| Text label differences ("Content Management" vs "Content")            | `useIsDesktop()` in JSX: `{isDesktop ? "Desktop Label" : "Mobile Label"}`                  |
| Icon size differences                                                 | `useIsDesktop()` for `size` prop: `size={isDesktop ? 18 : 16}`                             |
| Button size differences                                               | `useIsDesktop()` for `size` prop: `size={isDesktop ? "md" : "sm"}`                         |
| Component structure differences                                       | Conditional ternary with `isDesktop`: `{isDesktop ? <DesktopLayout /> : <MobileLayout />}` |
| Multiple sections/grids                                               | CSS media queries adjust `grid-template-columns`, `display: flex`, `flex-direction`        |

**SSR guarantee:** Consolidated files must maintain SSR default = desktop. CSS media queries work server-side (no JS execution), so layout defaults to desktop-safe styles.

---

## High-Level Technical Design

### Consolidation Pattern

```
Before Consolidation:
screens/admin-dashboard/
  ├── admin-dashboard.screen.tsx                  (router)
  ├── admin-dashboard.screen.desktop.tsx          (desktop impl)
  ├── admin-dashboard.screen.mobile.tsx           (mobile impl)
  ├── admin-dashboard.screen.desktop.module.css   (desktop styles)
  ├── admin-dashboard.screen.mobile.module.css    (mobile styles)
  └── admin-dashboard.screen.spec.tsx

After Consolidation:
screens/admin-dashboard/
  ├── admin-dashboard.screen.tsx                  (unified impl)
  ├── admin-dashboard.screen.module.css           (single file, @media queries)
  └── admin-dashboard.screen.spec.tsx
```

### Unified Implementation Template

```tsx
"use client";

import { useIsDesktop } from "@/shared/hooks/use-responsive";
import styles from "./admin-dashboard.screen.module.css";

export function AdminDashboardScreen() {
  const isDesktop = useIsDesktop();

  return (
    <ScreenView>
      <PageHeader
        title={isDesktop ? "Admin Dashboard" : "Dashboard"}
        actions={<Button size={isDesktop ? "md" : "sm"}>Action</Button>}
      />
      <div className={styles.container}>
        {/* Desktop has grid, mobile uses CSS media query for flex-direction */}
        <section className={styles.section}>Content</section>
      </div>
    </ScreenView>
  );
}
```

### CSS Consolidation Pattern

```css
/* Base styles (desktop-first) */
.container {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: var(--space-component-gap-md);
}

.section {
  padding: var(--space-section-padding-md);
  background: var(--background-primary);
}

/* Mobile overrides */
@media (max-width: 640px) {
  .container {
    display: flex;
    flex-direction: column;
    gap: var(--space-component-gap-sm);
  }

  .section {
    padding: var(--space-section-padding-sm);
  }
}
```

---

## Implementation Units

### U1. Document Consolidation Patterns and Update AGENT.md

**Goal:** Establish canonical documentation so future developers follow the unified pattern.

**Requirements:** Origin document consolidation approach sections.

**Dependencies:** None.

**Files:**

- `apps/web/AGENT.md` (modify)

**Approach:**

1. Read current `apps/web/AGENT.md` responsive architecture section
2. Replace description of `<Responsive>` wrapper pattern with consolidated pattern
3. Document:
   - Single unified screen file per feature
   - CSS media queries for layout/spacing
   - `useIsDesktop()` for conditional text/sizes
   - When to use conditional JSX (`isDesktop ? <A /> : <B />`)
   - SSR default = desktop guarantee
   - Testing patterns for both breakpoints
4. Add code examples for each consolidation rule (layout, text, sizes, structure)
5. Preserve any other AGENT.md sections unchanged

**Patterns to follow:**

- Existing `AGENT.md` language and structure
- Code examples from `apps/web/src/shared/hooks/use-responsive.ts`
- Reference consolidation rules table from plan

**Test scenarios:**

- Test expectation: none — this is documentation. Verify AGENT.md renders as markdown and contains consolidated pattern examples.

**Verification:**

- `apps/web/AGENT.md` updated and committed
- Documentation contains all consolidation rules
- Code examples are syntactically correct TypeScript/CSS

---

### U2. Consolidate admin-contents Screen

**Goal:** Consolidate `admin-contents` (10 screens into 1 file + CSS).

**Requirements:** Origin document phase 1 "admin-contents" entry.

**Dependencies:** U1 (AGENT.md updated first so pattern is documented).

**Files:**

- `apps/web/src/features/admin/screens/admin-contents/admin-contents.screen.tsx` (merge .desktop + .mobile)
- `apps/web/src/features/admin/screens/admin-contents/admin-contents.screen.module.css` (merge CSS files)
- `apps/web/src/features/admin/screens/admin-contents/admin-contents.screen.desktop.tsx` (DELETE)
- `apps/web/src/features/admin/screens/admin-contents/admin-contents.screen.mobile.tsx` (DELETE)
- `apps/web/src/features/admin/screens/admin-contents/admin-contents.screen.desktop.module.css` (DELETE)
- `apps/web/src/features/admin/screens/admin-contents/admin-contents.screen.mobile.module.css` (DELETE)

**Approach:**

1. Read `.screen.desktop.tsx` and `.screen.mobile.tsx` to identify differences
2. Read both CSS modules to map layout/spacing changes
3. Create unified `.screen.tsx`:
   - Copy desktop file as base
   - Add `import { useIsDesktop } from "@/shared/hooks/use-responsive"`
   - Add `const isDesktop = useIsDesktop()` hook call
   - Replace hardcoded text differences: `{isDesktop ? "desktop text" : "mobile text"}`
   - Replace size props: `size={isDesktop ? "md" : "sm"}`
   - Replace component structure conditionals: `{isDesktop ? <DesktopComp /> : <MobileComp />}`
   - Update CSS import: `styles from "./admin-contents.screen.module.css"`
4. Create consolidated `.screen.module.css`:
   - Copy desktop CSS as base
   - Identify mobile CSS overrides
   - Create `@media (max-width: 640px)` block
   - Move only the **differing properties** into the media query (not duplicates)
   - Remove obsolete desktop-only or mobile-only class variations
5. Delete 4 obsolete files
6. Run `pnpm typecheck` in the `apps/web` directory

**Patterns to follow:**

- Consolidation pattern from Phase 3.4 (High-Level Technical Design)
- Existing `useIsDesktop()` usage in navigation (sidebar)
- CSS variable tokens (do not change any token names)
- TypeScript naming: keep `AdminContentsScreen` export name unchanged

**Test scenarios:**

- **Desktop (>900px) layout:** Grid layout renders, "Admin Contents" title shows, buttons are `md` size
- **Mobile (≤640px) layout:** Flex column layout renders via CSS media query, title is shortened, buttons are `sm` size
- **Text variations:** Verify `useIsDesktop()` condition produces correct text on both viewports
- **Icon sizes:** Verify icon size prop changes correctly (if present in desktop variant)
- **Content rendering:** All content sections visible on both layouts

**Verification:**

- File `admin-contents.screen.tsx` contains unified implementation
- File `admin-contents.screen.module.css` contains merged CSS with media queries
- 4 obsolete files deleted
- `pnpm typecheck` passes (no type errors)
- No import errors or missing dependencies

---

### U3-U11. Consolidate Remaining 9 Admin Screens

**Goal:** Consolidate admin-dashboard, admin-lectures, admin-livestreams, admin-permissions, admin-scholar-detail, admin-scholars, admin-stats, admin-topics, admin-users.

**Requirements:** Origin document phase 1.

**Dependencies:** U1, U2 (can parallelize U3-U11 after U2 completes).

**Approach:** Follow consolidation pattern from U2 for each screen. Special case for U7 (admin-scholar-detail): use conditional JSX for sidebar vs stacked layout.

**Patterns to follow:** Consolidation pattern, grid/flex layout differences, spacing token variations.

**Test scenarios per unit:**

- Desktop layout renders correctly with appropriate structure
- Mobile layout renders correctly via CSS media queries
- Text labels and sizes adapt per `useIsDesktop()`
- Data fetching and content rendering works on both viewports
- Responsive breakpoint transitions at 641px boundary

**Verification:** Each screen consolidated, 4 files deleted per screen, typecheck passes.

---

### U12. Consolidate library Screens (3 screens)

**Goal:** Consolidate `library`, `library-completed`, `library-saved`.

**Requirements:** Origin document phase 2.

**Dependencies:** U1-U11 (can parallelize).

**Approach:** Follow consolidation pattern; library screens often have minimal CSS differences.

**Test scenarios:** Content list layout adapts, badges positioned correctly, filters/sorts work on both viewports.

**Verification:** 3 screens consolidated, 12 files deleted, typecheck passes.

---

### U13. Consolidate Listing Screens (2–3 screens)

**Goal:** Consolidate `lecture-detail`, `scholar-detail`.

**Requirements:** Origin document phase 3.

**Dependencies:** U1-U12 (can parallelize).

**Approach:** Follow consolidation pattern. Scholar-detail uses conditional JSX for sidebar vs stacked (like admin-scholar-detail).

**Test scenarios:** Detail page layout stacks on mobile, content visible, navigation correct.

**Verification:** 2-3 screens consolidated, typecheck passes.

---

### U14. Consolidate Auth and Other Screens

**Goal:** Consolidate `sign-in`, `explore-following`, `explore-recent`, `privacy`, `terms-of-use`, `live`, `search-home`.

**Requirements:** Origin document phase 4.

**Dependencies:** U1-U13 (can parallelize).

**Approach:** Follow consolidation pattern per screen.

**Test scenarios:** Form/content layouts adapt to viewport, interaction targets correctly sized.

**Verification:** 6-7 screens consolidated, typecheck passes.

---

### U15. Run Comprehensive Typecheck

**Goal:** Verify all TypeScript types pass after all consolidations.

**Requirements:** All preceding units complete.

**Dependencies:** U2-U14.

**Files:** None (checks only).

**Approach:**

1. Run `pnpm typecheck` in `apps/web`
2. Fix any import or type errors
3. Verify zero errors before proceeding

**Test scenarios:** All imports valid, hooks properly typed, no TypeScript warnings.

**Verification:** `pnpm typecheck` exits with zero errors.

---

### U16. Test Consolidated Screens at Both Breakpoints

**Goal:** Manually verify responsive behavior at mobile and desktop.

**Requirements:** U15 (typecheck passes).

**Dependencies:** U15.

**Approach:**

1. Start dev server: `pnpm dev`
2. For each consolidated screen: test at desktop (≥900px) and mobile (≤640px)
3. Verify layout, text, button sizes correct per viewport
4. Verify CSS media queries and `useIsDesktop()` work as intended

**Test scenarios:** Grid/flex switches, text labels change, button sizes adapt, no layout shifts.

**Verification:** All 20+ screens render correctly on both breakpoints, no visual regressions.

---

### U17. Verify Tests Still Pass

**Goal:** Ensure all existing screen tests pass after consolidation.

**Requirements:** U15 (typecheck passes).

**Dependencies:** U15.

**Files:** All `*.screen.spec.tsx` files (update imports).

**Approach:**

1. Run `pnpm test`
2. Fix import paths in failing tests (desktop → consolidated)
3. Verify all tests pass

**Test scenarios:** Permission filtering works, rendering tests pass, responsive behavior correct.

**Verification:** `pnpm test` exits with zero failures.

---

### U18. Update AGENT.md with Completion Status

**Goal:** Mark consolidation complete in documentation.

**Requirements:** U17 (tests pass).

**Dependencies:** U17.

**Approach:** Add completion status, update screen architecture notes.

**Verification:** AGENT.md documents completed consolidation.

---

## System-Wide Impact

### Performance

- **Bundle size:** Slightly reduced (~5-10% fewer duplicate imports)
- **Runtime:** Zero impact
- **SSR:** Unchanged (still defaults to desktop)

### Developer Experience

- Reduced cognitive load (one file per screen)
- Easier maintenance (changes in one place)
- Clearer intent (modern responsive pattern)

### Testing

- Coverage unchanged
- Test maintenance simpler
- No new test types needed

---

## Key Technical Decisions

### CSS Media Queries Over useResponsive()

Use CSS media queries for layout/spacing (SSR-safe). Use `useIsDesktop()` only for conditional content (text, sizes, branches).

**Why:** CSS works on server (no viewport info), `useResponsive()` requires client hydration.

### Preserve SSR Default = Desktop

All consolidated files render desktop-safe styles server-side. CSS media queries override for mobile only.

**Why:** Server cannot determine client viewport width; desktop ensures full-featured initial render.

---

## Risks & Mitigation

### Risk: SSR Hydration Mismatch

**Mitigation:** Use CSS media queries for layout (not `useResponsive()`). Hook defaults to `true` on server. Pattern proven in navigation.

### Risk: Missed CSS Differences

**Mitigation:** Carefully compare both CSS files, create media query block, test both viewports (U16).

### Risk: Import Breakage in Tests

**Mitigation:** Typecheck (U15) catches errors. Update test imports to consolidated `.screen.tsx`.

---

## Success Criteria

1. ✅ All 20+ screens render correctly at both breakpoints
2. ✅ `pnpm typecheck` passes
3. ✅ All tests pass
4. ✅ Manual testing confirms responsive behavior
5. ✅ AGENT.md updated
6. ✅ No behavioral changes
7. ✅ ~60–80 files deleted
8. ✅ Git history preserved

---

## Open Questions & Deferred Items

### Resolved

- Sidebar vs stacked layout: Use conditional JSX
- SSR safety: CSS media queries + `useIsDesktop()` defaults to `true`
- Which screens: All feature screens using `<Responsive>` (20+ identified)

### Deferred

- Navigation components (complex 3-branch logic)
- Remaining single-variant screens
- SCSS mixin extraction
- Product documentation updates

---

## Documentation Plan

**Changes:**

- `apps/web/AGENT.md` — responsive architecture section updated

**No changes:**

- Feature READMEs, design tokens, testing documentation

---

## Sources & Research

- `useIsDesktop()` hook: mature, SSR-safe, well-tested
- `Responsive` component: proven pattern
- Existing 20+ multi-variant screens
- CSS Module + token system: stable
- Vitest + React Testing Library patterns

---

## Implementation Sequencing

1. **Foundation (U1):** Update AGENT.md
2. **Admin Screens (U2–U11):** 10 screens (parallelize after U1)
3. **Library Screens (U12):** 3 screens (parallelize)
4. **Listing Screens (U13):** 2–3 screens (parallelize)
5. **Other Screens (U14):** 6+ screens (parallelize)
6. **Verification (U15–U18):** Typecheck, tests, manual testing, final docs

**Parallelization:** U2–U14 can run in parallel after U1, grouped by feature for clarity.

---

## Acceptance Criteria

- [ ] 20+ screens consolidated
- [ ] ~60–80 files deleted
- [ ] `pnpm typecheck` passes
- [ ] `pnpm test` passes
- [ ] Manual testing confirms both breakpoints work
- [ ] AGENT.md updated
- [ ] No behavioral changes
- [ ] PR passes CI
