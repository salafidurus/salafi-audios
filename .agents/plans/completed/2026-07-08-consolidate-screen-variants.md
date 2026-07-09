# Plan: Consolidate Mobile/Desktop Screen Variants

## Overview

Merge all mobile/desktop screen variants into single unified screen files using CSS media queries for responsive styling.

**Current state:** 29 screen pairs (58 files) + 29 router files + ~58 CSS module files
**Target state:** 29 unified screens + 29 CSS module files

---

## Implementation Approach

### For Each Screen

1. **Merge CSS modules** - Combine desktop/mobile CSS into single file with `@media (max-width: 640px)` for mobile overrides
2. **Consolidate TSX** - Use desktop variant as base, add `useIsDesktop()` for text/size differences
3. **Delete obsolete files** - Remove `.desktop.tsx`, `.mobile.tsx`, and their CSS modules
4. **Update router** - Router file becomes the unified implementation (no more `<Responsive>`)

### File Naming After Consolidation

```
screen-name/
  screen-name.screen.tsx         <- unified implementation
  screen-name.screen.module.css  <- single CSS with media queries
```

---

## Consolidation Rules

| Scenario                      | Approach                               |
| ----------------------------- | -------------------------------------- |
| Layout (flex-direction, grid) | CSS `@media (max-width: 640px)`        |
| Spacing/padding               | CSS media queries                      |
| Different text labels         | `useIsDesktop()` in JSX                |
| Different icon sizes          | `useIsDesktop()` for inline size       |
| Different button sizes        | `useIsDesktop()` for `size` prop       |
| Different component structure | Conditional rendering with `isDesktop` |

---

## CSS Pattern

```css
/* Base styles (desktop) */
.item {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

/* Mobile overrides */
@media (max-width: 640px) {
  .item {
    flex-direction: column;
    gap: var(--space-sm);
  }
}
```

---

## JSX Pattern for Text/Size Differences

```tsx
import { useIsDesktop } from "@/shared/hooks/use-responsive";

export function SomeScreen() {
  const isDesktop = useIsDesktop();

  return (
    <PageHeader
      title={isDesktop ? "Content Management" : "Content"}
      actions={
        <Button size={isDesktop ? "md" : "sm"} icon={<Plus size={isDesktop ? 18 : 16} />}>
          {isDesktop ? "Add Topic" : "Topic"}
        </Button>
      }
    />
  );
}
```

---

## Screens to Consolidate (29 total)

### Admin (11 screens)

1. `admin-contents` - CSS + title/button text
2. `admin-dashboard` - CSS + grid/list layout
3. `admin-lectures` - CSS + title/button text
4. `admin-livestreams` - CSS + title/button text
5. `admin-permissions` - CSS + title/button text
6. `admin-scholar-detail` - sidebar vs stacked layout
7. `admin-scholars` - CSS + grid/list layout
8. `admin-stats` - CSS differences
9. `admin-topics` - CSS + title/button text
10. `admin-users` - CSS + title/button text

### Auth (1 screen)

11. `sign-in` - CSS differences

### Explore (2 screens)

12. `explore-following` - minimal differences
13. `explore-recent` - minimal differences

### Legal (2 screens)

14. `privacy` - CSS differences
15. `terms-of-use` - CSS differences

### Library (3 screens)

16. `library` - CSS differences
17. `library-completed` - CSS differences
18. `library-saved` - CSS differences

### Listing (3 screens)

19. `lecture-detail` - layout structure
20. `scholar-detail` - sidebar vs stacked
21. `scholar-list` - CSS differences

### Live (3 screens)

22. `live` - CSS differences
23. `live-ended` - CSS differences
24. `live-scheduled` - CSS differences

### Search (2 screens)

25. `search-home` - CSS differences
26. `search-processing` - CSS differences

### Settings (2 screens)

27. `account` - CSS differences
28. `account-profile` - CSS differences

### Support (1 screen)

29. `support` - CSS differences

---

## Step-by-Step Per Screen

### 1. Merge CSS

- Copy desktop CSS as base
- Add mobile CSS inside `@media (max-width: 640px)` block
- Remove duplicate properties (keep only overrides in mobile)
- Save as `<name>.screen.module.css`

### 2. Consolidate TSX

- Copy desktop TSX as base into router file
- Add `import { useIsDesktop } from "@/shared/hooks/use-responsive"`
- Add `const isDesktop = useIsDesktop()` at top of component
- Update import: `styles from "./<name>.screen.module.css"`
- Replace hardcoded text/sizes with `isDesktop ? desktopValue : mobileValue`
- Remove `Responsive` import and usage

### 3. Delete Files

- Delete `<name>.screen.desktop.tsx`
- Delete `<name>.screen.mobile.tsx`
- Delete `<name>.screen.desktop.module.css`
- Delete `<name>.screen.mobile.module.css`

### 4. Verify

- Run `pnpm typecheck`
- Test at desktop (>900px) and mobile (<=640px) breakpoints

---

## Special Case: Layout Structure Differences

For screens like `scholar-detail` where desktop has sidebar/main and mobile is stacked:

```tsx
export function ScholarDetailScreen({ slug }: Props) {
  const isDesktop = useIsDesktop();
  const { data: scholar } = useScholarDetail(slug);

  if (!scholar) return <Loading />;

  return (
    <ScreenView>
      {isDesktop ? (
        <div className={styles.layout}>
          <div className={styles.sidebar}>
            <ScholarHeader scholar={scholar} />
          </div>
          <div className={styles.main}>
            <ScholarContentList slug={slug} />
          </div>
        </div>
      ) : (
        <>
          <ScholarHeader scholar={scholar} />
          <div className={styles.content}>
            <ScholarContentList slug={slug} />
          </div>
        </>
      )}
    </ScreenView>
  );
}
```

---

## Documentation Update

After consolidation, update `apps/web/AGENT.md`:

- Remove responsive routing architecture section about desktop/mobile variants
- Document new pattern: single screen file with CSS media queries and `useIsDesktop()` for JS-level branching

---

## Verification

1. `pnpm typecheck` - All types pass
2. `pnpm build` - Build succeeds
3. Manual testing at breakpoints:
   - Desktop: >900px
   - Tablet: 641-900px
   - Mobile: <=640px
4. Verify no visual regressions in key screens

---

## Files to Modify

**Critical reference files:**

- `apps/web/src/shared/hooks/use-responsive.ts` - `useIsDesktop()` hook
- `apps/web/AGENT.md` - Update documentation

**Files to delete per screen:**

- `*.screen.desktop.tsx`
- `*.screen.mobile.tsx`
- `*.screen.desktop.module.css`
- `*.screen.mobile.module.css`

**Total deletions:** ~116 files (29 screens x 4 files each)
