---
title: "feat: Unified List and Search Component System"
created: "2026-07-10"
plan_type: "feat"
---

# Unified List and Search Component System

## Summary

Create a minimal, focused component system with two independent, composable concerns:

1. **List System** — List (container), List.Item (row), List.Item.Actions (action button group) — for standardizing item layout and action button patterns across all 32 feature screens.

2. **Search System** — Search.Bar (search input with optional filters slot) and Search.Filter (chip-group filter control) — for standardizing search and filtering UI independently, composable with List but not dependent on it.

Both systems use compound component patterns (matching Dropdown), CSS module styling with design tokens, and full responsive support. They compose together on screens but remain fully independent — Search.Bar and Search.Filter work without List, and List works without Search.

---

## Problem Frame

**Across 32 feature screens**, two cross-cutting patterns are inconsistent:

### List/Item Pattern Problems

- Item action buttons follow inconsistent patterns (spacing, flex layout, border separators)
- Flex layout logic repeated per-card (flex-shrink-0, margin-left auto, custom gaps)
- Action button accessibility (aria-label, keyboard focus) not standardized
- New item cards must reinvent the action button layout each time

### Search/Filter Pattern Problems

- Search input and filter controls appear in different arrangements across screens
- Some screens co-locate search and filter in one row; others separate them vertically
- Filter chip styling varies (gap, padding, responsive behavior)
- Search + Filter composition is ad-hoc per-screen instead of standardized

**Result**: Higher cognitive load for implementers, inconsistent UX, maintenance burden, difficult to refactor search/filter logic across 32 screens at once.

---

## Requirements

### List System

1. Create a **List.Item.Actions** component that standardizes the action button layout pattern — flex container with consistent spacing, optional visual separator, accessible keyboard navigation.
2. Apply **List** (ListContainer) + **List.Item** + **List.Item.Actions** to all 32 screens across admin, settings, live, library, search, and explore features.
3. Maintain responsive behavior — List works the same on desktop, tablet, and mobile (layout changes via CSS media queries, not component branching).
4. Preserve accessibility — keyboard navigation (Enter/Space), focus-visible states, aria-labels on action buttons.
5. All components use design token CSS variables for spacing, colors, borders, typography.

### Search System

1. Create **Search.Bar** (search input + optional filter slot) as a standalone, reusable component.
2. Create **Search.Filter** (chip-group filter control) as a standalone, reusable component.
3. Both components work independently and can compose together when needed.
4. Standardize search input appearance and filter chip styling across all screens.
5. Maintain responsive behavior — Search.Bar + Search.Filter stack on mobile, sit side-by-side on desktop.
6. Preserve accessibility — search input has label/placeholder, filter chips are keyboard-navigable.

### Composition

1. List and Search systems compose cleanly (e.g., `<Search.Bar /> <List> <List.Item /> </List>`)
2. List works without Search.Bar (and vice versa) — no dependency coupling
3. 32 feature screens adopt standardized List + Search composition

---

## Scope Boundaries

### In Scope: List System

- Formalize List.Item.Actions as a reusable sub-component
- Standardize action patterns across all item cards (ScholarCard, AdminCard, SearchResultItem, LectureCard, etc.)
- Ensure List components are used consistently across all 32 screens
- Update existing components to use List.Item.Actions where actions appear
- Full responsive support (desktop, tablet, mobile via CSS media queries)

### In Scope: Search System

- Create Search.Bar with search input + optional filters slot
- Create Search.Filter with chip-group filter control
- Standardize search input styling, filter chip styling, responsive layout
- Document composition patterns showing how to use Search.Bar + List together
- Full responsive support (side-by-side on desktop, stacked on mobile)

### Out of Scope

- Pagination components — deferred for later (not part of this plan)
- Complex action menus (dropdowns within actions) — if needed, handled via nested components inside List.Item.Actions, not part of the core pattern
- New item card designs — plan standardizes existing patterns, not inventing new UX
- Search backend/API — Search.Bar is a UI container; API integration happens in feature screens
- Advanced filter types (date pickers, sliders) — Search.Filter handles chip-group only; complex filters live in feature screens

### Deferred to Follow-Up Work

- Pagination component system (if consensus emerges it's needed)
- List virtualization for very large lists (only if performance testing shows need)
- Advanced action patterns (swipe actions on mobile, keyboard shortcuts) — can be added to List.Item.Actions in later phases
- Advanced filter patterns (date-range, slider, multi-select) — can be added to Search.Filter or as new Search.\* sub-components in later phases

---

## High-Level Technical Design

### Component Architecture

**List System:**

```
List (ListContainer wrapper)
├── List.Item (individual row)
│   ├── Content (children — whatever item UI you want)
│   └── List.Item.Actions (optional action button group)
│       ├── Button (action 1)
│       ├── Button (action 2)
│       └── Button (action N)
```

**Search System:**

```
Search.Bar (search container)
├── Input (search input field)
└── Slot (optional filters slot)
    └── Search.Filter (chip-group filter, optional)
        ├── Chip (filter 1)
        ├── Chip (filter 2)
        └── Chip (filter N)
```

### Composition on Feature Screens

**Current (ad-hoc):**

```tsx
// Scattered across 32 screens — no standard pattern
<input placeholder="Search..." />
<div className={styles.filterChips}>
  {/* Custom chip rendering */}
</div>
<div className={styles.listContainer}>
  {/* Custom list item rendering with ad-hoc action buttons */}
</div>
```

**After Plan (standardized):**

```tsx
<Search.Bar value={search} onChange={setSearch}>
  <Search.Filter
    chips={filters}
    onChipChange={setFilters}
  />
</Search.Bar>
<List>
  <List.Item interactive onClick={handleItemClick}>
    <ItemContent />
    <List.Item.Actions>
      <Button>Edit</Button>
      <Button>Delete</Button>
    </List.Item.Actions>
  </List.Item>
</List>
```

### Props and Styling

**List.Item.Actions Props:**

```typescript
type ListItemActionsProps = {
  children: ReactNode; // Action buttons
  className?: string; // Optional custom styling
  orientation?: "horizontal" | "vertical"; // Desktop/tablet action stacking (default: 'horizontal')
  mobileOrientation?: "horizontal" | "vertical"; // Mobile action stacking (default: 'horizontal')
};
```

**Search.Bar Props:**

```typescript
type SearchBarProps = {
  value: string; // Search input value
  onChange: (value: string) => void;
  placeholder?: string; // Placeholder text (default: "Search...")
  children?: ReactNode; // Optional filters slot
  className?: string; // Optional custom styling
};
```

**Search.Filter Props:**

```typescript
type SearchFilterProps = {
  chips: Array<{ id: string; label: string }>; // Filter chips
  onChipChange: (chipIds: string[]) => void; // Handle chip selection
  selected?: string[]; // Selected chip IDs (default: [])
  className?: string; // Optional custom styling
};
```

### Styling Strategy

**List.Item.Actions:**

- **Desktop/Tablet Layout:**
  - Orientation: Flex row (horizontal, default) or flex column (vertical, if prop set)
  - Position: Absolute right, margin-left auto pushes actions to right side of row
  - Spacing: gap-sm between buttons (horizontal) or gap-xs between buttons (vertical)
  - No divider separator
- **Mobile Layout:**
  - Position: Below content (flex-direction: column on parent ListItem to stack content and actions vertically)
  - Orientation: Flex row (horizontal, default) or flex column (vertical, if mobileOrientation prop set)
  - Spacing: gap-sm between buttons (horizontal) or gap-xs between buttons (vertical)
  - Actions span full width or wrap as needed
- **Responsive CSS Media Query (max-width: 640px):**
  - Parent ListItem switches to flex-direction: column (content on top, actions below)
  - Actions container applies mobileOrientation (horizontal/vertical)
  - Spacing adjusts: gap-xs for mobile (tighter spacing)
- **Design tokens:** All values via CSS variables (spacing, borders, colors from theme-css.ts)

**Search.Bar:**

- Container: Flex row, background-color: var(--surface-default), border-radius: var(--radius-component-card), border: 1px solid var(--border-subtle)
- Input: Flex: 1, padding: var(--space-component-gap-lg), font-size: inherit, no border
- Filters slot: Flex row, gap-sm, flex-shrink-0
- Responsive: On mobile, stack vertically if filters present (flex-direction: column)

**Search.Filter:**

- Container: Flex row, gap-sm, flex-wrap: wrap (allows multi-line if needed)
- Chips: Display: inline-flex, padding: gap-sm / gap-md, border-radius: var(--radius-pill), background-color: var(--surface-subtle), border: 1px solid var(--border-subtle)
- Selected state: background-color: var(--surface-active), border-color: var(--border-active)
- Responsive: gap-xs on mobile

### Keyboard Navigation & Accessibility

**List System:**

- List.Item: role="button" (when interactive), tabIndex={0}, onKeyDown for Enter/Space
- List.Item.Actions: Flex container, no role
- Action buttons: aria-label (e.g., "Edit Scholar"), disabled attribute when appropriate
- Focus order: natural (Tab key navigates through action buttons)

**Search System:**

- Search.Bar Input: Standard input semantics, aria-label if no associated label, aria-describedby for placeholder/hints
- Search.Filter Chips: role="button" or role="checkbox", tabIndex={0}, onKeyDown for Enter/Space/Backspace (to remove)
- Focus order: Tab navigates Input → Chips → First chip starts focus ring

---

## Implementation Units

### U1. Create List.Item.Actions Sub-Component

**Goal:** Formalize the action button container pattern as a reusable sub-component.

**Requirements:** List system (R1)

**Dependencies:** None — builds on existing ListItem

**Files:**

- `apps/web/src/shared/components/List/ListItemActions.tsx` (new)
- `apps/web/src/shared/components/List/ListItemActions.module.css` (new)
- `apps/web/src/shared/components/List/index.ts` (barrel export, new or update)

**Approach:**

- Create ListItemActions as a flex container wrapper with orientation control
- Accept children (action buttons), optional orientation (horizontal/vertical for desktop/tablet), optional mobileOrientation (for mobile override)
- Implement CSS: flex row (default) or flex column, gap-sm desktop / gap-xs mobile, NO divider separator
- Desktop/Tablet: actions on right side (flex-shrink-0, margin-left auto positioning)
- Mobile: actions below content, full width (media query switches parent ListItem to flex-direction: column)
- Orientation controls: horizontal stacking (row, default) or vertical stacking (column, if prop set)
- Different styling available for desktop vs mobile via separate orientation props
- Export as List.Item.Actions via barrel (compound component pattern matching Dropdown)
- No state management, no context needed — pure presentational component

**Patterns to Follow:**

- Dropdown's compound export pattern (List → List.Item → List.Item.Actions)
- Existing ListItem keyboard nav and accessibility approach
- Design token spacing (gap-sm for horizontal button spacing, gap-xs for vertical or mobile)
- CSS module structure with media query for mobile responsiveness
- Orientation control pattern matching Dropdown's approach to flexibility

**Test Scenarios:**

- Renders children (action buttons) with correct spacing (gap-sm between buttons, default horizontal)
- Default orientation: horizontal (flex-row), buttons sit side-by-side on desktop/tablet
- orientation prop: when set to 'vertical', buttons stack vertically with gap-xs between them
- mobileOrientation prop: when set, overrides mobile layout (e.g., mobileOrientation='vertical' stacks buttons on mobile)
- Custom className merges with default styles (className prop)
- Desktop/Tablet flex layout: actions stay on right side of row (flex-shrink-0, margin-left auto), no divider
- Mobile responsive: parent ListItem switches to flex-direction: column, actions appear below content, full width
- No divider separator between content and actions
- Gap spacing: gap-sm for desktop, gap-xs for mobile
- No keyboard event handling (deferred to parent ListItem)
- Accessibility: no extra roles/aria on container (buttons inside handle their own labels)

**Verification:**

- ListItemActions renders in isolation with 1-3 buttons
- Actions align right in a flex row when placed in a ListItem with content (desktop/tablet)
- Default orientation: horizontal stacking (buttons side-by-side)
- orientation prop: changes desktop/tablet stacking to vertical (buttons stacked)
- mobileOrientation prop: changes mobile stacking independently
- Mobile view: actions appear below content (no gap, full width available)
- Responsive breakpoint switches layout correctly on mobile view (content on top, actions below)
- Tests pass with no accessibility violations

---

### U2. Create List Barrel Export and Documentation

**Goal:** Establish List as the compound component entry point, matching Dropdown's pattern.

**Requirements:** List system (R1)

**Dependencies:** U1 (ListItemActions must exist first)

**Files:**

- `apps/web/src/shared/components/List/index.ts` (barrel export, updated from U1)
- `apps/web/src/shared/components/List/README.md` (new, optional but recommended)

**Approach:**

- Rename ListContainer → List (or keep both, with List as alias to ListContainer for backward compatibility)
- Export List, List.Item, List.Item.Actions as compound API
- Documented usage pattern showing composition
- Clear prop documentation (what each component accepts, what it doesn't)
- Examples for common use cases (simple action button, multiple actions with divider)

**Patterns to Follow:**

- Dropdown's barrel export structure (Dropdown → Dropdown.Trigger → Dropdown.Content)
- Next.js conventions for component organization
- Design token documentation (link to design-tokens package for spacing/color reference)

**Test Scenarios:**

- All exports available: `import { List } from '@/shared/components/List'`
- List.Item and List.Item.Actions are accessible as compound properties
- TypeScript types exported correctly (ListProps, ListItemProps, ListItemActionsProps)
- No circular dependencies or import issues

**Verification:**

- Barrel export works in test file: can import and use List, List.Item, List.Item.Actions
- TypeScript finds all types without errors
- README clearly shows composition pattern and prop options

---

### U3. Create Search.Bar Component

**Goal:** Create a standardized search input component that optionally accepts a filter slot.

**Requirements:** Search system (R2)

**Dependencies:** None

**Files:**

- `apps/web/src/shared/components/Search/SearchBar.tsx` (new)
- `apps/web/src/shared/components/Search/SearchBar.module.css` (new)
- `apps/web/src/shared/components/Search/index.ts` (barrel export, new)
- `apps/web/src/shared/components/Search/Search.spec.tsx` (new)

**Approach:**

- Create SearchBar as a flex container with search input + optional children (filters slot)
- Accept value, onChange, placeholder, and children props
- Implement CSS: flex container, border, border-radius, background-color via CSS module
- Input styling: flex: 1, padding, font-size, no border
- Responsive: on mobile, stack input and filters vertically if filters present
- Export as Search.Bar via barrel
- No state management in component — parent controls value and onChange

**Patterns to Follow:**

- Similar flex-based layout as ListItem (flex row → column on mobile)
- Design token styling (border-subtle, surface-default, radius-component-card)
- CSS module structure with media query for mobile responsiveness
- Input accessibility: aria-label if no associated label

**Test Scenarios:**

- Renders search input with placeholder
- Value prop controls input value, onChange fires when input changes
- Custom className merges with default styles
- Flex layout: input takes full width (flex: 1), optional children slot on right (flex-shrink-0)
- Responsive: input and children stack vertically on mobile (flex-direction: column)
- No validation or character limits — pure container component
- Accessibility: input has aria-label or label

**Verification:**

- SearchBar renders with search input focused and ready to type
- Typing in input triggers onChange callback with new value
- Optional children (filters) render alongside input on desktop, below on mobile
- Responsive breakpoint switches layout correctly

---

### U4. Create Search.Filter Component

**Goal:** Create a standardized chip-group filter component.

**Requirements:** Search system (R2)

**Dependencies:** None

**Files:**

- `apps/web/src/shared/components/Search/SearchFilter.tsx` (new)
- `apps/web/src/shared/components/Search/SearchFilter.module.css` (new)
- `apps/web/src/shared/components/Search/index.ts` (barrel export, updated)
- `apps/web/src/shared/components/Search/Search.spec.tsx` (updated)

**Approach:**

- Create SearchFilter as a flex row container with chip buttons
- Accept chips array (id, label), selected IDs, and onChipChange callback
- Implement CSS: flex row, gap-sm, flex-wrap: wrap for overflow
- Chip styling: inline-flex, padding, border-radius, background-color (default/selected states)
- Keyboard navigation: Tab between chips, Enter/Space to toggle, Backspace to remove
- Export as Search.Filter via barrel
- No internal state — parent controls selected state

**Patterns to Follow:**

- Similar flex-based layout as List.Item.Actions (chip buttons in row)
- Design token styling (surface-subtle, surface-active, border-subtle, border-active)
- CSS module structure with responsive gap adjustment
- Accessibility: role="button" on chips, aria-label or aria-pressed

**Test Scenarios:**

- Renders chip buttons with labels
- Click/Enter/Space on chip toggles selection, calls onChipChange with updated selected IDs
- Selected chips show active background (surface-active, border-active)
- Multiple chips can be selected (not mutually exclusive — unless parent enforces it)
- Flex layout: chips sit in row, wrap to next line if container too narrow
- Responsive: gap-xs on mobile instead of gap-sm
- Keyboard: Tab navigates chips, Enter/Space toggles, Backspace removes selection
- Accessibility: chips have aria-pressed or aria-label

**Verification:**

- SearchFilter renders with all chips visible
- Clicking a chip toggles its selection and calls onChipChange
- Visual feedback (active state) appears on selected chips
- Multiple chips can be selected simultaneously
- Responsive breakpoint adjusts gap correctly

---

### U5. Create Search Barrel Export and Documentation

**Goal:** Establish Search.Bar and Search.Filter as compound components with clear composition patterns.

**Requirements:** Search system (R2)

**Dependencies:** U3, U4

**Files:**

- `apps/web/src/shared/components/Search/index.ts` (barrel export, updated from U3/U4)
- `apps/web/src/shared/components/Search/README.md` (new, optional but recommended)

**Approach:**

- Export Search.Bar and Search.Filter as independent, composable components
- Documented usage patterns showing composition (Search.Bar with filters slot, standalone Search.Filter)
- Clear prop documentation
- Examples for common use cases (search + filters together, search only, filters only)

**Patterns to Follow:**

- Compound pattern (Search.Bar → children slot can contain Search.Filter)
- Clear separation of concerns (Search.Bar is input container, Search.Filter is chip control)
- Design token documentation

**Test Scenarios:**

- All exports available: `import { Search } from '@/shared/components/Search'`
- Search.Bar and Search.Filter are accessible as independent exports
- TypeScript types exported correctly
- No circular dependencies

**Verification:**

- Barrel export works in test file: can import and use Search.Bar, Search.Filter
- TypeScript finds all types without errors
- README clearly shows composition patterns and prop options

---

### U6. Standardize Action Patterns in Existing Item Cards (Phase 1: Admin Components)

**Goal:** Update admin item cards (ScholarCard, AdminCard, LectureCard, etc.) to use List.Item.Actions.

**Requirements:** List system (R1), action button standardization

**Dependencies:** U1, U2

**Files:**

- `apps/web/src/features/admin/components/ScholarCard/ScholarCard.tsx` (modify)
- `apps/web/src/features/admin/components/ScholarCard/scholar-card.module.css` (modify)
- `apps/web/src/features/admin/components/AdminCard/AdminCard.tsx` (modify)
- `apps/web/src/features/admin/components/AdminCard/AdminCard.module.css` (modify)
- `apps/web/src/features/admin/components/LectureCard/LectureCard.tsx` (modify, if exists)
- `apps/web/src/features/admin/components/LectureCard/lecture-card.module.css` (modify, if exists)
- Screen test files (modify if tests reference card structure)

**Approach:**

- Replace ad-hoc action layout divs with `<List.Item.Actions>` wrapper
- Remove custom action spacing CSS (gap, flex-shrink-0, margin-left: auto) — List.Item.Actions handles it
- Keep action buttons unchanged (Button component, aria-label, etc.)
- Remove border-left separators and padding-left styles (no divider in new design)
- Update card CSS to simplify (remove .actions selector, .row layout rules if they only existed for actions)
- Verify responsive behavior works (CSS media queries in ListItem handle mobile flex-direction change, ListItemActions handles action stacking)

**Patterns to Follow:**

- No changes to Button component usage or aria-label patterns
- Keep existing onClick handlers unchanged
- Maintain same visual spacing (gap-sm between buttons for horizontal, gap-xs for vertical)
- Use design tokens exclusively (var(--space-_), var(--border-_))

**Test Scenarios:**

- ScholarCard renders with List.Item.Actions: action button appears on right side (desktop/tablet)
- Multiple action buttons (Edit + Delete) render with gap-sm between them (horizontal, default)
- orientation='vertical': buttons stack vertically with gap-xs
- No divider separator between content and actions
- Action buttons have correct aria-label (e.g., "Edit Scholar")
- Click handler fires when action button clicked
- Responsive: on mobile, actions appear below content (full width), default horizontal or mobileOrientation='vertical' if specified

**Verification:**

- Admin Scholar screen shows cards with actions aligned right on desktop/tablet, actions below content on mobile
- Admin Lecture screen shows cards with same layout
- Default: actions are horizontally stacked (side-by-side)
- Hover/active states work as before (Button component unchanged)
- Clicking edit/delete buttons triggers expected actions
- Mobile view shows actions below content (full width), stacked horizontally or vertically based on mobileOrientation

---

### U7. Standardize Search Patterns in Search Screens (Phase 1)

**Goal:** Update search screens to use Search.Bar and Search.Filter standardized components.

**Requirements:** Search system (R2), search UI standardization

**Dependencies:** U3, U4, U5

**Files:**

- `apps/web/src/features/search/screens/SearchScreen.tsx` (modify)
- `apps/web/src/features/search/screens/SearchScreen.module.css` (modify)
- Related search feature component files that render search input/filters
- Screen test files (modify if tests reference search structure)

**Approach:**

- Replace ad-hoc search input + filter rendering with Search.Bar and Search.Filter
- Remove custom search input styling — Search.Bar handles it
- Remove custom filter chip styling — Search.Filter handles it
- Keep search logic and state unchanged (parent controls value, filters, onChange)
- Verify responsive behavior works (CSS media queries in SearchBar/SearchFilter handle mobile)
- Keep search backend integration unchanged (API calls happen in parent screen)

**Patterns to Follow:**

- Search.Bar wraps search input + optional Search.Filter in children
- Search state lives in parent (value, filters, handlers)
- No state in SearchBar/SearchFilter themselves

**Test Scenarios:**

- Search screen renders Search.Bar with search input visible
- Search.Bar accepts optional Search.Filter as children
- Typing in search input updates search value
- Clicking/selecting filter chips updates filter state
- Responsive: on mobile, input and filters stack vertically
- Search logic (calling API, displaying results) works unchanged

**Verification:**

- Search screen displays search input and filter chips consistently
- Search and filter state changes trigger expected behavior
- Results display correctly based on search + filter values
- Mobile layout stacks search and filters vertically

---

### U8. Standardize Action Patterns in Existing Item Cards (Phase 2: Other Feature Screens)

**Goal:** Update remaining item cards across library, settings, live, explore screens to use List.Item.Actions.

**Requirements:** List system (R1), action button standardization

**Dependencies:** U1, U2, U6

**Files:**

- `apps/web/src/features/search/components/SearchResultItem/SearchResultItem.tsx` (modify)
- `apps/web/src/features/search/components/SearchResultItem/SearchResultItem.module.css` (modify)
- `apps/web/src/features/library/components/*Card/*.tsx` (modify, for each card using actions)
- `apps/web/src/features/explore/components/*Card/*.tsx` (modify, for each card using actions)
- `apps/web/src/features/settings/components/*Item/*.tsx` (modify, for each settings item with actions)
- `apps/web/src/features/live/components/*Card/*.tsx` (modify, for each live card with actions)
- Corresponding `.module.css` files for each component
- Screen test files (modify if tests reference card structure)

**Approach:**

- Apply same refactor pattern as U6 to all remaining item cards
- Identify which cards have action buttons, which don't (cards without actions don't need changes)
- Replace action layout divs with `<List.Item.Actions>`
- Remove duplicate action spacing styles
- Keep feature-specific UI unchanged — only restructure action container
- Ensure responsive behavior works via CSS media queries (no component branching)

**Patterns to Follow:**

- Consistent with U6 approach (same refactoring pattern across all screens)
- Keep feature-specific button labels/actions unchanged
- Use design tokens for spacing/colors

**Test Scenarios:**

- SearchResultItem: Play/More action buttons appear with List.Item.Actions, divider present
- Library cards: Edit/Remove actions render correctly
- Settings items: Toggle/Delete actions aligned right
- Explore cards: Save/Share actions styled consistently
- All responsive: mobile gap adjusts, actions stay right-aligned
- Click handlers work as before
- No breaking changes to existing screen tests

**Verification:**

- All 32 feature screens use List.Item.Actions where actions appear
- Consistent spacing and alignment across all screens
- Mobile/tablet/desktop layouts all work (CSS handles breakpoints)
- No functional regressions (all onClick handlers, state updates work)
- Tests pass for all updated screens

---

### U9. Standardize Search Patterns in Other Feature Screens (Phase 2)

**Goal:** Update remaining feature screens that have search/filter UI to use Search.Bar and Search.Filter.

**Requirements:** Search system (R2), search UI standardization

**Dependencies:** U3, U4, U5, U7

**Files:**

- Library screens with search: `apps/web/src/features/library/screens/*/[screen].tsx` (modify)
- Explore screens with search: `apps/web/src/features/explore/screens/*/[screen].tsx` (modify)
- Settings screens with search: `apps/web/src/features/settings/screens/*/[screen].tsx` (modify)
- Live screens with search: `apps/web/src/features/live/screens/*/[screen].tsx` (modify)
- Corresponding screen component files and test files

**Approach:**

- Apply same refactor pattern as U7 to all screens with search/filter UI
- Replace ad-hoc search input + filter rendering with Search.Bar + Search.Filter
- Keep search logic and state in parent unchanged
- Keep search backend integration unchanged
- Ensure responsive behavior works via CSS media queries

**Patterns to Follow:**

- Consistent with U7 approach
- Search state lives in parent screen, not in SearchBar/SearchFilter
- Use design tokens for styling

**Test Scenarios:**

- All screens with search use standardized Search.Bar component
- Search.Bar optionally includes Search.Filter for screens with filters
- Search and filter functionality works as before (state, API calls, results display)
- Responsive: mobile stacks input and filters vertically
- No breaking changes to existing screen logic

**Verification:**

- All feature screens using search/filters use standardized Search.Bar + Search.Filter
- Search and filter behavior works correctly
- Mobile/tablet/desktop layouts work
- Tests pass for all updated screens

---

### U10. Create List and Search Component Tests and Documentation

**Goal:** Establish test coverage for List and Search components and document both systems.

**Requirements:** List system (R1), Search system (R2)

**Dependencies:** U1-U5 (core components), U6-U9 (component usage across screens)

**Files:**

- `apps/web/src/shared/components/List/List.spec.tsx` (new)
- `apps/web/src/shared/components/List/ListItem.spec.tsx` (new)
- `apps/web/src/shared/components/List/ListItemActions.spec.tsx` (new)
- `apps/web/src/shared/components/List/README.md` (comprehensive guide, from U2)
- `apps/web/src/shared/components/Search/SearchBar.spec.tsx` (new)
- `apps/web/src/shared/components/Search/SearchFilter.spec.tsx` (new)
- `apps/web/src/shared/components/Search/README.md` (comprehensive guide, from U5)

**Approach:**

- Unit tests for List, List.Item, List.Item.Actions components
- Unit tests for Search.Bar, Search.Filter components
- Integration tests: List + List.Item + List.Item.Actions composed together
- Integration tests: Search.Bar with Search.Filter in children slot
- Accessibility tests: keyboard navigation (Enter/Space), focus-visible, aria-labels
- Responsive tests: CSS media query behavior on mobile breakpoint
- Documentation: usage patterns, prop reference, common patterns, responsive guidelines, composition examples
- No new component logic — tests verify existing behavior is maintained

**Patterns to Follow:**

- Jest + React Testing Library (same stack as existing tests)
- Testing behavior, not implementation (test click handlers, focus, keyboard, not internal styles)
- Component composition tests (render List with List.Item and List.Item.Actions together)

**Test Scenarios:**

**List Component Tests:**

- Renders children (List.Item components)
- No role or aria attributes added by List itself (transparent wrapper)
- Custom className merges with default styles
- Works with any children (List.Item or custom divs)

**List.Item Tests:**

- Renders children with transparent background
- role="button" + tabIndex={0} when interactive (onClick provided)
- No role/tabIndex when not interactive
- Keyboard: Enter and Space keys trigger onClick
- Cursor: pointer on interactive, default on non-interactive
- CSS divider between items (`.item + .item` border-top)
- focus-visible state shows box-shadow
- Responsive: padding adjusts on mobile (CSS media query)

**List.Item.Actions Tests:**

- Renders action buttons with flex layout
- Default orientation: horizontal (flex-row), gap-sm between buttons
- orientation='vertical': buttons stack vertically with gap-xs
- mobileOrientation prop: independently controls mobile stacking
- No divider separator (clean design between content and actions)
- flex-shrink-0 on container (actions don't shrink on desktop/tablet)
- Custom className merges correctly
- Responsive: on mobile (max-width 640px), parent ListItem flex-direction changes to column, actions move below content
- Gap adjusts on mobile (gap-xs at 640px for desktop, gap-xs for mobile buttons)
- No keyboard event handling (inherited from ListItem)

**Search.Bar Tests:**

- Renders search input with placeholder
- Value prop controls input value
- onChange fires when input changes
- Custom className merges with default styles
- Flex layout: input takes full width, children slot on right (flex-shrink-0)
- Responsive: input and children stack vertically on mobile
- Accessibility: input has proper aria attributes

**Search.Filter Tests:**

- Renders chip buttons with labels
- Click/Enter/Space toggles chip selection
- onChipChange fires with updated selected IDs
- Selected chips show active background color
- Multiple chips can be selected simultaneously
- Flex layout: chips in row, wrap to next line if needed
- Responsive: gap-xs on mobile
- Keyboard: Tab navigates chips, Enter/Space toggles, Backspace deselects
- Accessibility: chips have proper aria attributes

**Integration Tests:**

- List + List.Item + List.Item.Actions render together
- Multiple items in List render with dividers between them
- Search.Bar with Search.Filter in children slot
- Search input and filter chips work together
- List and Search compose together on a screen

**Accessibility Tests:**

- List.Item: keyboard focus (Tab key)
- List.Item: Enter/Space key triggers onClick
- List.Item: focus-visible state present
- List.Item.Actions: buttons inside are tab-stoppable
- Search.Bar Input: proper aria attributes
- Search.Filter Chips: proper aria attributes, keyboard navigation
- No ARIA violations (axe-core or similar)

**Responsive Tests:**

- Mobile view (max-width: 640px): List gaps adjust
- Mobile view: Search.Bar and Search.Filter stack vertically
- List.Item padding remains consistent
- Layout remains flex (no collapse to block)
- Touch target sizes remain ≥44px

**Verification:**

- All unit and integration tests pass
- 100% coverage on List, Search components
- Accessibility tests pass (no ARIA violations)
- Responsive tests verify CSS media queries work
- Documentation is clear and comprehensive (usage + props + examples)

---

## Key Technical Decisions

### List System

1. **List.Item.Actions as a sub-component, not a hook** — Simple flex container, no complex state or logic. Matches Dropdown's compound pattern and makes composition explicit.

2. **No divider separator** — Actions sit directly on the right (desktop/tablet) or below content (mobile). No visual border between content and actions. Cleaner visual design.

3. **Orientation control with desktop/mobile independence** — orientation prop controls desktop/tablet stacking (horizontal/vertical, default horizontal), mobileOrientation prop controls mobile stacking independently. Allows different layouts per breakpoint without component branching.

4. **Responsive layout via parent ListItem flex-direction change** — On mobile (max-width 640px), parent ListItem switches to flex-direction: column, pushing actions below content. No wrapping or complicated CSS in ListItemActions itself. Cleaner parent-child responsibility separation.

5. **No context-based state** — List.Item.Actions is a presentational wrapper. State lives in parent components (ListItem, cards). Simpler, cleaner composition.

6. **CSS media queries for responsive, not component branching** — List works the same on mobile/tablet/desktop. CSS handles layout changes. Avoids component complexity.

7. **Design tokens exclusively** — No hardcoded spacing/colors. All values via CSS variables (gap-sm, gap-xs, border-subtle, etc.). Ensures consistency with design system.

8. **Keyboard navigation on List.Item, not List.Item.Actions** — ListItem handles role + tabIndex + Enter/Space. ListItemActions is a layout container. Cleaner separation of concerns.

### Search System

1. **Search.Bar as input container with optional filters slot** — Keeps input control separate from filter control. Search.Filter can live inside Search.Bar children or be used independently.

2. **Search.Filter as standalone chip-group** — No dependency on Search.Bar. Can be used with or without Search.Bar, or with other input types.

3. **No built-in state management** — Both Search.Bar and Search.Filter are controlled components. Parent manages state (search value, selected filters, handlers).

4. **Responsive layout: side-by-side on desktop, stacked on mobile** — CSS media queries handle layout change. No component branching.

5. **Design tokens exclusively** — Same approach as List system. All values via CSS variables.

6. **Composability over coupling** — List and Search are independent. They compose together on screens but have no hard dependency.

---

## Risks & Dependencies

**Risk: Breaking existing card layouts** — Mitigated by careful CSS refactoring: remove only action-specific styles, keep content layout unchanged. U6 validates pattern before U8.

**Risk: Missed edge cases in responsive behavior** — Mitigated by testing gap/padding on mobile/tablet/desktop. CSS media query verified in U10.

**Risk: aria-labels on action buttons** — Mitigated by not changing Button component. Existing aria-label patterns remain unchanged. No regression.

**Risk: Search.Bar/Search.Filter adoption across screens** — Mitigated by U7 validating pattern before U9. Single pattern replicated consistently.

**Dependency: Design tokens must be stable** — If design token values change (gap-sm, border-subtle), List and Search CSS auto-updates. No code changes needed.

**Dependency: Button component must remain stable** — List.Item.Actions and Search.Filter work with Button component. Changes to Button require testing.

---

## Acceptance Examples

### List System

1. **ScholarCard with actions** — Render List.Item wrapping card content + List.Item.Actions with Edit button. Verify no divider, gap-sm between buttons (horizontal, default), actions align right on desktop/tablet.

2. **Multiple actions** — Render List.Item.Actions with Edit + Delete buttons. Verify gap-sm between buttons (horizontal), both are clickable, both have aria-labels. Test orientation='vertical' to stack vertically with gap-xs.

3. **Responsive mobile** — Render card on mobile (max-width 640px). Verify actions appear below content (full width), default horizontal stacking or mobileOrientation='vertical' if set, touch target ≥44px.

4. **All 32 screens** — Verify each feature screen (admin, search, library, settings, live, explore) uses List.Item.Actions where actions appear. Consistent spacing and alignment across all (actions right-aligned desktop/tablet, below content mobile).

### Search System

1. **Search input only** — Render Search.Bar with search input, no filters. Verify input is focused and ready to type.

2. **Search + Filters** — Render Search.Bar with Search.Filter in children. Verify input on top (desktop) or stacked (mobile), filters below or beside, both functional.

3. **Filter chip selection** — Click a filter chip, verify it toggles selected state, onChipChange fires, visual feedback (active color).

4. **Responsive** — Render Search.Bar on mobile (max-width 640px). Verify input and filters stack vertically, both remain functional.

### Composition

1. **Screen with Search and List** — Render Search.Bar (with Search.Filter in children) above List with List.Item + List.Item.Actions. Verify both work independently, compose cleanly.

2. **Search.Filter only** — Render Search.Filter without Search.Bar. Verify it works standalone (chip selection, keyboard nav).

3. **List without Search** — Render List (with List.Item + List.Item.Actions) without Search.Bar. Verify it works standalone.

---

## Success Criteria

### List System

- ✅ List.Item.Actions component created and exported via compound API
- ✅ All existing item cards updated to use List.Item.Actions
- ✅ Action button spacing and alignment standardized across 32 screens
- ✅ Responsive behavior works (CSS media queries, no component branching)
- ✅ Accessibility maintained (keyboard navigation, focus-visible, aria-labels)

### Search System

- ✅ Search.Bar and Search.Filter components created and exported
- ✅ Search input and filter chip styling standardized across screens
- ✅ Search.Bar and Search.Filter work independently and compose together
- ✅ Responsive behavior works (side-by-side desktop, stacked mobile)
- ✅ Accessibility maintained (keyboard navigation, focus, aria-labels)

### Overall

- ✅ All tests pass (unit + integration + responsive + accessibility)
- ✅ Documentation complete (README, prop reference, composition examples)
- ✅ No breaking changes (existing Screen tests pass, no UI regressions)
- ✅ List and Search systems work independently and together
- ✅ All 32 feature screens adopt standardized List + Search composition where applicable

---

## Sources & Research

**Repository Patterns:**

- Existing ListContainer + ListItem components (working baseline)
- Dropdown compound component pattern (API model to follow)
- ScholarCard, AdminCard, SearchResultItem action layouts (current patterns to standardize)
- Search input and filter chip implementations across screens (current patterns to standardize)
- Design token usage across Button, theme (styling model)
- Accessibility patterns in ListItem keyboard navigation (reference implementation)

**File References:**

- `apps/web/src/shared/components/ListContainer/`
- `apps/web/src/shared/components/ListItem/`
- `apps/web/src/shared/components/Dropdown/`
- `apps/web/src/features/admin/components/ScholarCard/`
- `apps/web/src/features/search/components/SearchResultItem/`
- `apps/web/src/features/search/screens/SearchScreen/`
- `apps/web/src/app/theme-css.ts` (design tokens)
