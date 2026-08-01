# Plan: Screen Standardization

**Created:** 2026-07-08
**Worktree:** `.worktrees/f-screen-standardization`
**Branch:** `f/screen-standardization`

## Summary

Enforce consistent screen patterns and percentage-based responsive widths across all user-facing screens. Sub-nav tabs must align with content width at all breakpoints.

---

## Current State (Deep Review Findings)

### ScreenView Already Has Correct Pattern

The `ScreenView` component at `apps/web/src/shared/components/ScreenView/screen-view.module.css` already implements the desired percentage-based widths:

```css
.content {
  width: 70%;
  max-width: 1400px;
  margin-inline: auto;
}
@media (max-width: 1199px) {
  .content {
    width: 90%;
  }
}
@media (max-width: 899px) {
  .content {
    width: 100%;
  }
}
```

### Problems Found

| Screen                            | Issue                                                                                   |
| --------------------------------- | --------------------------------------------------------------------------------------- |
| `privacy.screen.desktop.tsx`      | Inline styles, hardcoded `maxWidth: 720`, color `#555`, no CSS Module                   |
| `terms-of-use.screen.desktop.tsx` | Same as privacy                                                                         |
| `TopSubnavTabs`                   | Uses `--space-layout-content-max` (84rem) instead of matching ScreenView's 70%/90%/100% |
| Various screens                   | Don't use ScreenView; have inconsistent max-widths                                      |

### Example Violation (privacy.screen.desktop.tsx)

```tsx
<div style={{ maxWidth: 720, margin: "0 auto", padding: "32px 16px" }}>
  <h1 style={{ fontSize: 28, fontWeight: 700, marginBottom: 24 }}>Privacy Policy</h1>
  <p style={{ color: "#555", lineHeight: 1.6 }}>...</p>
</div>
```

All of these should be CSS variables/design tokens.

---

## Width Strategy

**Two container tiers based on screen type:**

| Screen Type                                 | Desktop (>1199px) | Tablet (900-1199px) | Mobile (<899px) | Max-Width |
| ------------------------------------------- | ----------------- | ------------------- | --------------- | --------- |
| **Content** (explore, library, live, legal) | 70%               | 90%                 | 100%            | 1400px    |
| **Forms** (auth, settings, profile)         | 50%               | 70%                 | 100%            | 720px     |

### CSS Implementation

Already exists in `screen-view.module.css` for content screens. For forms, add a new variant or use narrower max-width.

```css
/* Form variant (proposed) */
.formContent {
  width: 50%;
  max-width: 720px;
  margin-inline: auto;
}
@media (max-width: 1199px) {
  .formContent {
    width: 70%;
  }
}
@media (max-width: 899px) {
  .formContent {
    width: 100%;
  }
}
```

---

## Sub-Nav Tab Alignment Fix

**Current (misaligned):**

```css
.inner {
  max-width: min(calc(var(--space-layout-content-max) + (var(--space-layout-page-x) * 2)), 100%);
}
```

**Target (aligned with ScreenView):**

```css
.inner {
  width: 70%;
  max-width: 1400px;
  margin-inline: auto;
  padding-inline: var(--space-layout-page-x);
}
@media (max-width: 1199px) {
  .inner {
    width: 90%;
  }
}
@media (max-width: 899px) {
  .inner {
    width: 100%;
  }
}
```

---

## Screens to Refactor

### Priority 0 (Critical - No Design Tokens)

| Screen       | File                                                     | Issues                                |
| ------------ | -------------------------------------------------------- | ------------------------------------- |
| Privacy      | `features/legal/screens/privacy.screen.desktop.tsx`      | Inline styles, hardcoded colors/sizes |
| Terms of Use | `features/legal/screens/terms-of-use.screen.desktop.tsx` | Same                                  |

### Priority 1 (Width Inconsistency)

| Screen           | File                                          | Current Width | Target                      |
| ---------------- | --------------------------------------------- | ------------- | --------------------------- |
| Library screens  | `features/library/screens/*`                  | 720px fixed   | ScreenView (70%/90%/100%)   |
| Settings Profile | `features/settings/screens/*`                 | 640px fixed   | Form variant (50%/70%/100%) |
| Account Profile  | `features/settings/screens/account-profile/*` | 600px fixed   | Form variant                |

### Priority 2 (Already Correct, Verify)

| Screen            | File                                           | Status             |
| ----------------- | ---------------------------------------------- | ------------------ |
| Explore Recent    | `features/explore/screens/explore-recent/*`    | ✅ Uses ScreenView |
| Explore Following | `features/explore/screens/explore-following/*` | ✅ Uses ScreenView |

---

## Implementation Steps

1. **Update TopSubnavTabs alignment**
   - File: `features/navigation/components/top-subnav-tabs/top-subnav-tabs.module.css`
   - Change: Match ScreenView's 70%/90%/100% breakpoints

2. **Create CSS Module for legal screens**
   - New file: `features/legal/screens/legal.module.css`
   - Migrate privacy + terms-of-use to use CSS Module + design tokens

3. **Add form variant to ScreenView (optional)**
   - If needed, add `.formContent` class for narrower form screens
   - Or create separate `FormContainer` component

4. **Update library screens to use ScreenView**
   - Verify they use `<ScreenView>` wrapper
   - Remove hardcoded 720px max-widths

5. **Update settings/profile screens to form width**
   - Either use ScreenView form variant or explicit percentage widths

---

## Files to Modify

| File                                                                                     | Action                                 |
| ---------------------------------------------------------------------------------------- | -------------------------------------- |
| `apps/web/src/features/navigation/components/top-subnav-tabs/top-subnav-tabs.module.css` | Align with ScreenView breakpoints      |
| `apps/web/src/features/legal/screens/privacy.screen.desktop.tsx`                         | Add CSS Module, use design tokens      |
| `apps/web/src/features/legal/screens/privacy.screen.desktop.module.css`                  | Create                                 |
| `apps/web/src/features/legal/screens/terms-of-use.screen.desktop.tsx`                    | Add CSS Module, use design tokens      |
| `apps/web/src/features/legal/screens/terms-of-use.screen.desktop.module.css`             | Create                                 |
| `apps/web/src/features/library/screens/*/library-screens.module.css`                     | Update to percentage widths            |
| `apps/web/src/features/settings/screens/*/*.module.css`                                  | Update to form percentage widths       |
| `apps/web/src/shared/components/ScreenView/screen-view.module.css`                       | Add `.formContent` variant (if needed) |

---

## Gold Standard Checklist

Every refactored screen must:

- [ ] Router file ≤50 lines (only `<Responsive>` wrapper)
- [ ] Desktop/Mobile variants ≤100 lines each
- [ ] Use ScreenView or equivalent percentage-based container
- [ ] Responsive widths at all breakpoints (mobile 100%, tablet 90%, desktop 70%)
- [ ] All spacing via `var(--space-*)` tokens
- [ ] All colors via `var(--content-*)` or `var(--surface-*)` tokens
- [ ] All typography via `var(--typo-*)` tokens
- [ ] CSS Module for all styling (no inline style objects with hardcoded values)
- [ ] No business logic in screen files

---

## Verification

1. **Visual alignment check at 3 viewports:**
   - 375px (mobile)
   - 768px (tablet)
   - 1440px (desktop)

2. **Sub-nav tabs must left-align with content** at all sizes

3. **Run typecheck + build:**

   ```bash
   cd apps/web && bun run typecheck && bun run build
   ```

4. **Manual review:** Open each screen and verify design token usage
