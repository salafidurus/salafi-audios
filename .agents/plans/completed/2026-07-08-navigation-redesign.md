# Plan: Navigation Redesign

**Created:** 2026-07-08
**Worktree:** `.worktrees/f-navigation-redesign`
**Branch:** `f/navigation-redesign`

## Summary

Redesign navigation for consistent experience across devices:

- **Desktop (>900px)**: Sidebar open by default (unchanged)
- **Tablet (641-900px)**: Sidebar collapsed by default (expandable)
- **Mobile (≤640px)**: Hamburger menu → slide-out drawer

---

## Current State (Deep Review Findings)

### Desktop Sidebar (`sidebar.desktop.tsx`)

- 262 lines, well-structured
- Collapse state: `useState(false)` - **not persisted**
- Sets CSS variable: `--sidebar-width` (16.5rem expanded, 4.5rem collapsed)
- Contains nav items + admin section + user profile footer

### Mobile/Tablet (`sidebar.mobile.tsx`, `sidebar.tablet.tsx`)

- Both render `<AdaptiveBottomBar />` (bottom navigation)
- User finds this "confusing" and "hard to access all sections"

### Breakpoints (from `use-responsive.ts`)

- Mobile: ≤640px
- Tablet: 641-900px
- Desktop: >900px

### Layout (`globals.css`)

```css
.appMain {
  padding-inline-start: var(--sidebar-width, 16.5rem);
}
@media (max-width: 900px) {
  .appMain {
    padding-inline-start: 0;
    padding-bottom: var(--bottom-tab-height, 4.25rem);
  }
}
```

---

## Target Architecture

```
Mobile (≤640px):
┌─────────────────────────┐
│ ☰  Brand/Logo           │  ← Fixed header with hamburger
├─────────────────────────┤
│                         │
│      Page Content       │
│                         │
└─────────────────────────┘

Drawer open:
┌────────┬────────────────┐
│ Nav    │ (backdrop)     │  ← Slide-out from left
│ Items  │                │
│        │                │
└────────┴────────────────┘

Tablet (641-900px):
┌──┬──────────────────────┐
│◀ │                      │  ← Collapsed sidebar (icons only)
│  │    Page Content      │     Click expand button to widen
│  │                      │
└──┴──────────────────────┘

Desktop (>900px) - unchanged:
┌──────────┬──────────────┐
│ Sidebar  │              │  ← Full sidebar, open by default
│ (open)   │ Page Content │
│          │              │
└──────────┴──────────────┘
```

---

## State Management Updates

### Current State (sidebar.desktop.tsx:84)

```tsx
const [collapsed, setCollapsed] = useState(false);
```

### Target State (navigation-store.ts)

```typescript
interface NavigationStore {
  // Existing section/tab state...

  // New sidebar state
  isMobileDrawerOpen: boolean;
  isTabletSidebarCollapsed: boolean; // default: true, persisted
  isDesktopSidebarCollapsed: boolean; // default: false, persisted

  // Actions
  openMobileDrawer: () => void;
  closeMobileDrawer: () => void;
  toggleMobileDrawer: () => void;
  setTabletSidebarCollapsed: (collapsed: boolean) => void;
  setDesktopSidebarCollapsed: (collapsed: boolean) => void;
}
```

The store already uses Zustand `persist` middleware, so new state will auto-persist to localStorage.

---

## New Components

### 1. MobileHeader (`mobile-header.tsx`)

Fixed header at top of screen on mobile:

- Hamburger button (left) → opens drawer
- Brand/logo (center)
- Height: `--mobile-header-height: 3.5rem`
- Safe area: `padding-top: env(safe-area-inset-top)`

```tsx
export function MobileHeader() {
  const { openMobileDrawer } = useNavigationStore();
  return (
    <header className={styles.header}>
      <button onClick={openMobileDrawer} aria-label="Open menu">
        <Menu size={24} />
      </button>
      <Link href="/" className={styles.brand}>
        <Image src="/logo/logo_72.png" ... />
      </Link>
    </header>
  );
}
```

### 2. SidebarDrawer (`sidebar-drawer.tsx`)

Slide-out drawer from left:

- Uses `framer-motion` for animation (slide from `-100%` to `0`)
- Uses `createPortal` to render at document.body
- Overlay backdrop (click to close)
- Focus trapping when open
- ESC key closes
- Body scroll lock
- Reuses nav items from desktop sidebar

```tsx
export function SidebarDrawer() {
  const { isMobileDrawerOpen, closeMobileDrawer } = useNavigationStore();

  return createPortal(
    <AnimatePresence>
      {isMobileDrawerOpen && (
        <>
          <motion.div className={styles.backdrop} onClick={closeMobileDrawer} />
          <motion.aside
            className={styles.drawer}
            initial={{ x: "-100%" }}
            animate={{ x: 0 }}
            exit={{ x: "-100%" }}
          >
            <NavItems onItemClick={closeMobileDrawer} />
          </motion.aside>
        </>
      )}
    </AnimatePresence>,
    document.body,
  );
}
```

### 3. NavItems (`nav-items.tsx`)

Shared nav item list extracted from `sidebar.desktop.tsx`:

- Used by both desktop sidebar and mobile drawer
- Accepts `collapsed?: boolean` prop for icon-only mode
- Accepts `onItemClick?: () => void` for drawer close

---

## Implementation Steps

### Step 1: Update Navigation Store

File: `apps/web/src/features/navigation/store/navigation-store.ts`

- Add `isMobileDrawerOpen`, `isTabletSidebarCollapsed`, `isDesktopSidebarCollapsed`
- Add actions: `openMobileDrawer`, `closeMobileDrawer`, `setTabletSidebarCollapsed`, `setDesktopSidebarCollapsed`
- Persist collapse states (not drawer open state)

### Step 2: Extract NavItems Component

File: `apps/web/src/features/navigation/components/sidebar/nav-items.tsx`

- Extract `navItems` array and rendering logic from `sidebar.desktop.tsx`
- Create `NavItems` component that accepts `collapsed` and `onItemClick` props
- Reuse in both desktop sidebar and mobile drawer

### Step 3: Create MobileHeader Component

Files:

- `apps/web/src/features/navigation/components/sidebar/mobile-header.tsx`
- `apps/web/src/features/navigation/components/sidebar/mobile-header.module.css`

### Step 4: Create SidebarDrawer Component

Files:

- `apps/web/src/features/navigation/components/sidebar/sidebar-drawer.tsx`
- `apps/web/src/features/navigation/components/sidebar/sidebar-drawer.module.css`

Patterns to follow (from existing AuthModal):

- `framer-motion` for animations
- `createPortal` for rendering
- Focus trapping
- Body scroll lock

### Step 5: Update sidebar.mobile.tsx

Replace `<AdaptiveBottomBar />` with:

```tsx
export function SidebarMobile() {
  return (
    <>
      <MobileHeader />
      <SidebarDrawer />
    </>
  );
}
```

### Step 6: Update sidebar.tablet.tsx

Use desktop sidebar but collapsed by default:

```tsx
export function SidebarTablet() {
  return <SidebarDesktop defaultCollapsed />;
}
```

### Step 7: Update sidebar.desktop.tsx

- Accept `defaultCollapsed?: boolean` prop
- Use navigation store for collapse state instead of local `useState`
- Differentiate between tablet and desktop collapse state

### Step 8: Update globals.css

```css
/* Mobile: header at top, no sidebar */
@media (max-width: 640px) {
  .appMain {
    padding-inline-start: 0;
    padding-top: calc(var(--mobile-header-height, 3.5rem) + env(safe-area-inset-top));
    padding-bottom: 0;
  }
}

/* Tablet: collapsed sidebar by default */
@media (min-width: 641px) and (max-width: 900px) {
  :root {
    --sidebar-width: 4.5rem;
  }
  .appMain {
    padding-inline-start: var(--sidebar-width);
    padding-bottom: 0;
  }
}

/* Desktop: unchanged */
```

### Step 9: Delete AdaptiveBottomBar

Files to remove:

- `apps/web/src/features/navigation/components/sidebar/adaptive-bottom-bar.tsx`
- `apps/web/src/features/navigation/components/sidebar/sidebar-bottom.module.css`

---

## Files Summary

### Create

| File                        | Purpose                     |
| --------------------------- | --------------------------- |
| `mobile-header.tsx`         | Fixed header with hamburger |
| `mobile-header.module.css`  | Header styles               |
| `sidebar-drawer.tsx`        | Slide-out navigation drawer |
| `sidebar-drawer.module.css` | Drawer + overlay styles     |
| `nav-items.tsx`             | Shared navigation items     |

### Modify

| File                  | Changes                                  |
| --------------------- | ---------------------------------------- |
| `navigation-store.ts` | Add drawer/collapse state                |
| `sidebar.mobile.tsx`  | Use MobileHeader + SidebarDrawer         |
| `sidebar.tablet.tsx`  | Use SidebarDesktop with defaultCollapsed |
| `sidebar.desktop.tsx` | Accept defaultCollapsed prop, use store  |
| `globals.css`         | Update layout rules                      |

### Delete

| File                        | Reason             |
| --------------------------- | ------------------ |
| `adaptive-bottom-bar.tsx`   | Replaced by drawer |
| `sidebar-bottom.module.css` | No longer needed   |

---

## Accessibility Requirements

- `aria-modal="true"` on drawer
- `aria-expanded` on hamburger button
- `aria-label` on all interactive elements
- Focus trap in drawer (first element on open, cycle within)
- Return focus to hamburger on close
- ESC key closes drawer
- Click outside (backdrop) closes drawer

---

## Verification

### Mobile (≤640px)

- [ ] Hamburger icon visible in header
- [ ] Clicking hamburger opens drawer
- [ ] ESC key closes drawer
- [ ] Clicking backdrop closes drawer
- [ ] Focus trapped in drawer when open
- [ ] All nav items accessible
- [ ] Safe area insets respected on notch devices

### Tablet (641-900px)

- [ ] Sidebar starts collapsed (icons only)
- [ ] Expand button widens sidebar
- [ ] Collapse state persists across page navigation
- [ ] All nav items accessible in both states

### Desktop (>900px)

- [ ] Sidebar starts expanded (unchanged behavior)
- [ ] Collapse toggle works
- [ ] State persists across sessions

### Cross-cutting

- [ ] Run typecheck + build: `cd apps/web && bun run typecheck && bun run build`
- [ ] Test keyboard navigation throughout
- [ ] Verify no hydration mismatches (SSR)
