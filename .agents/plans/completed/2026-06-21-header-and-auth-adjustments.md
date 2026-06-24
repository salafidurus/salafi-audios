# Header & AuthRequiredState Style Adjustments

We will implement the following changes based on your choices (Q1: Option A, Q2: Option A):

1. **Worktree Creation**: Create a new git worktree `.worktrees/f-head` on a new branch `f/head`.
2. **Language Switcher**: Remove the language switcher from `TopAuthStrip` (leaving the one in the footer).
3. **Subnav Bar Styling & Alignment**: Make the desktop subnav bar (`TopSubnavTabs`) transparent with the same border style as `TopAuthStrip`. The tabs will be wrapped in an `.inner` layout container (with `max-width` matching the page layout content boundary) and left-aligned within that container.
4. **Sign-In Button on Following Feed**: Replace the hardcoded styles on the Sign-In button and description text in `AuthRequiredState` (for both desktop and mobile screens) with the shared `<Button variant="primary">` component and the `var(--content-muted)` text color design token.

---

## Proposed Changes

### Git Setup

- Create a new git worktree:
  ```bash
  git worktree add -b f/head .worktrees/f-head main
  ```
- All subsequent file modifications and command runs will be executed within `C:\dev\salafi-audios\.worktrees\f-head`.

### Navigation Components

#### [MODIFY] [top-auth-strip.desktop.tsx](file:///C:/dev/salafi-audios/apps/web/src/features/navigation/components/top-auth-strip/top-auth-strip.desktop.tsx)

- Remove `LanguageSwitch` import and `<LanguageSwitch />` element rendering from the desktop auth strip.

#### [MODIFY] [top-subnav-tabs.tsx](file:///C:/dev/salafi-audios/apps/web/src/features/navigation/components/top-subnav-tabs/top-subnav-tabs.tsx)

- Add a `<div className={styles.inner}>` wrapper around the mapped tab link items inside `<nav>`.

#### [MODIFY] [top-subnav-tabs.module.css](file:///C:/dev/salafi-audios/apps/web/src/features/navigation/components/top-subnav-tabs/top-subnav-tabs.module.css)

- Style `.tabsContainer` to match `.strip` in `TopAuthStrip`:
  - Change `background` to `transparent`
  - Change `border-bottom` to `1px solid var(--chrome-border)`
  - Remove `backdrop-filter: blur(10px)` (since they are no longer translucent)
- Style the new `.inner` element to constrain layout width, padding, and left-align the flex elements:
  ```css
  .inner {
    width: 100%;
    max-width: min(calc(var(--space-layout-content-max) + (var(--space-layout-page-x) * 2)), 100%);
    margin-inline: auto;
    height: 100%;
    padding: 0 var(--space-layout-page-x);
    display: flex;
    align-items: stretch;
    gap: var(--space-component-gap-sm);
    justify-content: flex-start;
  }
  ```

---

### Shared Components

#### [MODIFY] [AuthRequiredState.desktop.tsx](file:///C:/dev/salafi-audios/apps/web/src/shared/components/AuthRequiredState/AuthRequiredState.desktop.tsx)

- Import `Button` from `@/shared/components/Button/Button`.
- Replace the raw `<button>` tag with `<Button variant="primary">`.
- Remove hardcoded `backgroundColor` and styling for the button from `buttonStyle`.
- Change description text color from `#6b7280` to `var(--content-muted)`.

#### [MODIFY] [AuthRequiredState.mobile.tsx](file:///C:/dev/salafi-audios/apps/web/src/shared/components/AuthRequiredState/AuthRequiredState.mobile.tsx)

- Import `Button` from `@/shared/components/Button/Button`.
- Replace the raw `<button>` tag with `<Button variant="primary" size="lg">` (representing the mobile scale).
- Remove hardcoded styling for the button from `buttonStyle`.
- Change description text color from `#6b7280` to `var(--content-muted)`.

---

## Verification Plan

### Automated Tests

- Run Next.js checks and Vitest unit/integration tests to ensure no regressions:
  ```bash
  pnpm --filter web typecheck
  pnpm --filter web test
  pnpm --filter web build
  ```

### Manual Verification

- View `/feed/following` in unauthenticated state to verify the Sign-In button uses the brand primary token, is fully theme-compatible, and the description uses the standard muted gray.
- View any main page layout to verify the desktop subnav bar is perfectly left-aligned with page headers, matches the transparent background of `TopAuthStrip`, and uses the same border-bottom styling.
