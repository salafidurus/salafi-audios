# Explore shadcn Standardization Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Standardize the Explore feed/catalog filter experience around the repository’s configured shadcn primitives while preserving the approved filters, persistence isolation, responsive behavior, RTL support, and existing API contracts for ticket #560.

**Architecture:** Keep `useExploreFilters` and `explore-filters.ts` as the state and persistence boundary. Replace the current mixed searchable-`Select` implementation with a feature-owned filter field that composes shadcn `Field`, `Select`, and `Combobox`; keep desktop and mobile presentation in the unified toolbar using CSS for layout and a single conditional render branch for the mobile `Sheet`. Standardize active summaries, empty states, and loading placeholders with shadcn primitives while leaving catalog-specific composition inside `features/explore`.

**Tech Stack:** Next.js client components, React, TypeScript, Bun, Testing Library, Playwright, shadcn CLI with the repository’s `radix-nova`/RTL configuration, Radix UI primitives, CSS Modules, semantic design-token CSS variables.

**Spec:** GitHub issue #560, the Explore requirements in issue #554, and `docs/adr/0001-web-workspace-navigation.md`.

## Global Constraints

- Explore must support Topic, Scholar, content type, language, and sort filters.
- Filter state persists until explicitly cleared and is scoped by the Explore surface, locale, and User identity where relevant.
- Clear all must be visibly available and restore default filter state.
- The API remains authoritative; do not move authorization or business rules into the web client.
- Preserve the existing search and Explore API contracts; language continues through the existing domain-search hook.
- Keep the unified web responsive pattern: one JSX branch per responsive structure, CSS media queries for layout, and `useIsDesktop()` only when the rendered structure or control size differs.
- Use `src/shared/components/ui` only for generic shadcn primitives; keep catalog-specific filter composition under `apps/web/src/features/explore`.
- Use configured shadcn generation (`bunx shadcn add`) instead of hand-copying standard primitives.
- Use semantic design tokens and the configured RTL support; do not add hardcoded colors, spacing, or directional assumptions.
- Follow strict TDD: red test, confirm failure, minimal implementation, focused green test, then broader checks.
- Never use `--no-verify`; preserve the existing worktree and do not modify `apps/native`.

## File Map

### Existing files to modify

- `apps/web/src/features/explore/components/filter-select/filter-select.tsx` — compatibility wrapper or replacement over the standardized field.
- `apps/web/src/features/explore/components/filter-select/filter-select.module.css` — only feature-specific sizing that cannot be expressed by primitives.
- `apps/web/src/features/explore/components/filter-select/filter-select.spec.tsx` — Select/Combobox and label behavior.
- `apps/web/src/features/explore/components/explore-filter-toolbar/explore-filter-toolbar.tsx` — desktop/mobile shadcn composition.
- `apps/web/src/features/explore/components/explore-filter-toolbar/explore-filter-toolbar.module.css` — token-backed responsive layout.
- `apps/web/src/features/explore/components/explore-filter-toolbar/explore-filter-toolbar.spec.tsx` — toolbar interaction and accessibility.
- `apps/web/src/features/explore/screens/explore-recent.screen.tsx` — pass standardized controls without moving state/API logic.
- `apps/web/src/features/explore/screens/explore-recent.screen.spec.tsx` — screen-level behavior coverage.
- `apps/web/src/features/explore/components/feed-skeleton/feed-skeleton.tsx` — compose shared Skeleton primitives.
- `apps/web/src/features/explore/components/feed-skeleton/feed-skeleton.module.css` — retain grid/card layout only.
- `apps/web/src/features/explore/components/feed-skeleton/feed-skeleton.spec.tsx` — count and accessibility assertions.

### New feature-owned files

- `apps/web/src/features/explore/components/explore-filter-field/explore-filter-field.tsx` — generic labeled Select/Combobox field.
- `apps/web/src/features/explore/components/explore-filter-field/explore-filter-field.module.css` — feature-specific compact sizing.
- `apps/web/src/features/explore/components/explore-filter-field/explore-filter-field.spec.tsx` — selection, clearing, searching, no-results, and RTL-safe IDs.
- `apps/web/src/features/explore/components/explore-empty-state/explore-empty-state.tsx` — catalog composition around shadcn Empty.
- `apps/web/src/features/explore/components/explore-empty-state/explore-empty-state.spec.tsx` — empty state and clear action.

### Generated shared primitives

- `apps/web/src/shared/components/ui/combobox.tsx` — generated with the configured shadcn CLI.
- `apps/web/src/shared/components/ui/input-group.tsx` — generated support primitive required by the current Combobox registry entry.
- `apps/web/src/shared/components/ui/textarea.tsx` — generated support primitive required by InputGroup.
- `apps/web/src/shared/components/ui/badge.tsx` — generated with the configured shadcn CLI.
- `apps/web/src/shared/components/ui/empty.tsx` — generated with the configured shadcn CLI.
- `apps/web/package.json` and `bun.lock` — only if the generator adds a required dependency.

### Browser coverage

- `apps/web/e2e/explore-filters.e2e.ts` — desktop, mobile, Arabic/RTL, theme, persistence, and clear-all smoke tests.

## Implementation Tasks

### Task 1: Establish the generated primitive baseline

**Files:**

- Create: `apps/web/src/shared/components/ui/combobox.tsx`
- Create: `apps/web/src/shared/components/ui/input-group.tsx`
- Create: `apps/web/src/shared/components/ui/textarea.tsx`
- Create: `apps/web/src/shared/components/ui/badge.tsx`
- Create: `apps/web/src/shared/components/ui/empty.tsx`
- Modify: `apps/web/package.json`, `bun.lock` only if dependency resolution requires it

**Interfaces:**

- `Combobox` must expose the generated project-compatible input/content/list/item composition. The current official registry implementation is Base UI-backed and therefore adds `@base-ui/react`; this is isolated to the new Combobox while existing Radix primitives remain unchanged.
- `Badge` must support semantic `outline` and `secondary` variants.
- `Empty` must expose `Empty`, `EmptyHeader`, `EmptyMedia`, `EmptyTitle`, `EmptyDescription`, and `EmptyContent`.

- [ ] **Step 1: Verify the generator configuration**

Run from `apps/web`:

```bash
bunx shadcn info
```

Confirm `components.json` selects `radix-nova`, `src/shared/components/ui`, semantic CSS variables, Lucide icons, and RTL. Do not manually edit `components.json`.

- [ ] **Step 2: Generate the missing primitives**

```bash
bunx shadcn add combobox badge empty
```

Review generated imports against the existing `select.tsx`, `field.tsx`, `sheet.tsx`, and `skeleton.tsx`. If the generator proposes an incompatible primitive family, reconcile that output before feature code is written; do not maintain two incompatible conventions.

- [ ] **Step 3: Decide whether InputGroup is needed**

Keep `Search.Bar` unchanged unless the standardized toolbar needs the new input-group affordances. If needed, run:

```bash
bunx shadcn add input-group
```

Adapt `Search.Bar` through its existing shared boundary instead of importing `InputGroup` directly into the Explore screen.

- [ ] **Step 4: Validate the baseline**

```bash
bunx oxfmt --check apps/web/src/shared/components/ui/combobox.tsx apps/web/src/shared/components/ui/badge.tsx apps/web/src/shared/components/ui/empty.tsx
bunx oxlint apps/web/src/shared/components/ui/combobox.tsx apps/web/src/shared/components/ui/badge.tsx apps/web/src/shared/components/ui/empty.tsx
bun run --filter web typecheck
```

Expected: all checks pass before feature code consumes the primitives.

- [ ] **Step 5: Commit the baseline**

```bash
git add apps/web/src/shared/components/ui apps/web/package.json bun.lock
git commit -m "chore(web): add Explore shadcn primitives"
```

### Task 2: Build the standardized Explore filter field

**Files:**

- Create: `apps/web/src/features/explore/components/explore-filter-field/explore-filter-field.tsx`
- Create: `apps/web/src/features/explore/components/explore-filter-field/explore-filter-field.module.css`
- Create: `apps/web/src/features/explore/components/explore-filter-field/explore-filter-field.spec.tsx`
- Modify: `apps/web/src/features/explore/components/filter-select/filter-select.tsx`
- Modify: `apps/web/src/features/explore/components/filter-select/filter-select.module.css`
- Modify: `apps/web/src/features/explore/components/filter-select/filter-select.spec.tsx`

**Interfaces:**

```ts
export type ExploreFilterFieldMode = "select" | "combobox";

export type ExploreFilterFieldProps = {
  id: string;
  label: string;
  options: readonly FilterOption[];
  value: string;
  mode?: ExploreFilterFieldMode;
  allLabel: string;
  searchLabel?: string;
  searchPlaceholder?: string;
  emptyLabel?: string;
  onChange: (value: string) => void;
};
```

The component consumes `FilterOption` and generated primitives, and produces a labeled control with a stable ID. `select` is used for content type, language, and sort; `combobox` is used for Scholar and Topic. Selecting All emits `""`; the existing caller keeps the `isExploreSort` guard.

- [ ] **Step 1: Write failing behavior tests**

Cover label association, Combobox selection, no-results copy, and clearing:

```tsx
it("associates the visible label with the filter control", () => {
  render(<ExploreFilterField id="explore-topic" label="Topic" mode="select" {...props} />);
  expect(screen.getByLabelText("Topic")).toBeInTheDocument();
});

it("emits the selected Scholar id from the searchable control", () => {
  const onChange = vi.fn();
  render(
    <ExploreFilterField
      id="explore-scholar"
      label="Scholar"
      mode="combobox"
      {...props}
      onChange={onChange}
    />,
  );
  fireEvent.click(screen.getByRole("combobox", { name: "Scholar" }));
  fireEvent.click(screen.getByRole("option", { name: "Ibn Baz" }));
  expect(onChange).toHaveBeenCalledWith("ibn-baz");
});

it("shows localized no-results copy and clears through All", () => {
  const onChange = vi.fn();
  render(
    <ExploreFilterField value="series" emptyLabel="No results" {...props} onChange={onChange} />,
  );
  fireEvent.click(screen.getByRole("combobox"));
  fireEvent.click(screen.getByRole("option", { name: "All" }));
  expect(onChange).toHaveBeenCalledWith("");
});
```

Use the repository’s existing Testing Library setup; do not add a new test dependency.

- [ ] **Step 2: Confirm the test is red**

```bash
bun run --filter web test -- src/features/explore/components/explore-filter-field/explore-filter-field.spec.tsx
```

Expected: failure because the new field does not exist.

- [ ] **Step 3: Implement the field composition**

Use `Field` and `FieldLabel` for the label/control relationship. Use generated Select for simple fields and generated Combobox for searchable fields. Keep option IDs as values and labels as presentation text. Do not put a raw input inside `SelectContent`.

Use stable IDs such as `explore-topic`, not IDs derived from translated labels.

- [ ] **Step 4: Preserve the old FilterSelect contract**

Make `FilterSelect` a compatibility wrapper over `ExploreFilterField` or replace its internals while preserving its existing props. Remove the duplicate searchable implementation and its obsolete CSS.

- [ ] **Step 5: Verify focused behavior and commit**

```bash
bun run --filter web test -- src/features/explore/components/explore-filter-field/explore-filter-field.spec.tsx src/features/explore/components/filter-select/filter-select.spec.tsx
git add apps/web/src/features/explore/components/explore-filter-field apps/web/src/features/explore/components/filter-select
git commit -m "refactor(web): standardize Explore filter fields"
```

### Task 3: Standardize the toolbar and mobile filter presentation

**Files:**

- Modify: `apps/web/src/features/explore/components/explore-filter-toolbar/explore-filter-toolbar.tsx`
- Modify: `apps/web/src/features/explore/components/explore-filter-toolbar/explore-filter-toolbar.module.css`
- Create: `apps/web/src/features/explore/components/explore-filter-toolbar/explore-filter-toolbar.spec.tsx`
- Modify: `apps/web/src/features/explore/screens/explore-recent.screen.tsx`
- Modify: `apps/web/src/features/explore/screens/explore-recent.screen.spec.tsx`

**Interfaces:**

```ts
type ExploreFilterToolbarProps = {
  query: string;
  onQueryChange: (value: string) => void;
  filters: ExploreFilters;
  scholarOptions: readonly FilterOption[];
  topicOptions: readonly FilterOption[];
  formatOptions: readonly FilterOption[];
  languageOptions: readonly FilterOption[];
  sortOptions: readonly FilterOption[];
  summaries: readonly ExploreFilterSummary[];
  labels: ExploreFilterLabels;
  allLabel: string;
  activeFiltersLabel: string;
  clearAllLabel: string;
  mobileFiltersLabel: string;
  mobileFiltersDescription: string;
  filterSearchLabel: string;
  noOptionsLabel: string;
  onFilterChange: <K extends keyof ExploreFilters>(key: K, value: ExploreFilters[K]) => void;
  onClearFilter: (key: keyof ExploreFilters) => void;
  onClearAll: () => void;
};
```

The toolbar consumes existing hook output and option arrays. It produces one desktop filter grid or one mobile Sheet branch, never two hidden responsive trees. Mobile selection is immediate and remains persisted by the existing hook; closing the Sheet does not introduce draft state.

- [ ] **Step 1: Write failing toolbar tests**

Cover the visible contract:

```tsx
it("renders all five approved filter fields on desktop", () => {
  render(<ExploreFilterToolbar {...props} />);
  expect(screen.getByLabelText("Scholar")).toBeInTheDocument();
  expect(screen.getByLabelText("Topic")).toBeInTheDocument();
  expect(screen.getByLabelText("Content type")).toBeInTheDocument();
  expect(screen.getByLabelText("Language")).toBeInTheDocument();
  expect(screen.getByLabelText("Sort")).toBeInTheDocument();
});

it("removes an active filter through its accessible chip action", () => {
  render(
    <ExploreFilterToolbar {...props} summaries={[{ key: "topic", label: "Topic: Aqeedah" }]} />,
  );
  fireEvent.click(screen.getByRole("button", { name: "Remove Topic: Aqeedah" }));
  expect(props.onClearFilter).toHaveBeenCalledWith("topic");
});

it("keeps Clear all as a first-class action", () => {
  render(
    <ExploreFilterToolbar
      {...props}
      summaries={[{ key: "language", label: "Language: Arabic" }]}
    />,
  );
  fireEvent.click(screen.getByRole("button", { name: "Clear all" }));
  expect(props.onClearAll).toHaveBeenCalledTimes(1);
});
```

Mock `useIsDesktop()` for the mobile branch and assert the filter trigger, Sheet title, five fields, Clear all, and close action by role/name rather than CSS class.

- [ ] **Step 2: Confirm the test is red**

```bash
bun run --filter web test -- src/features/explore/components/explore-filter-toolbar/explore-filter-toolbar.spec.tsx
```

Expected: failure for the new Field/Sheet/chip contract.

- [ ] **Step 3: Implement the desktop toolbar**

Replace direct `FilterSelect` usage with `ExploreFilterField`. Render active filters as `Badge variant="outline"` with a small ghost/icon Button for removal; do not nest interactive buttons. Keep Clear all as the existing shadcn Button. Preserve the native `<search>` landmark and `aria-live="polite"` summary.

- [ ] **Step 4: Implement the mobile Sheet branch**

Use `useIsDesktop()`. Render the desktop fields when true; otherwise render the compact search and a mobile Filters trigger with active count. The Sheet should contain `SheetHeader`, `SheetTitle`, `SheetDescription`, the five fields, and a footer with Clear all and close:

```tsx
<Sheet>
  <SheetTrigger asChild>
    <Button variant="outline">
      {mobileFiltersLabel} ({activeCount})
    </Button>
  </SheetTrigger>
  <SheetContent side="bottom">
    <SheetHeader>
      <SheetTitle>{mobileFiltersLabel}</SheetTitle>
      <SheetDescription>{mobileFiltersDescription}</SheetDescription>
    </SheetHeader>
    <FieldGroup>{/* five ExploreFilterField controls */}</FieldGroup>
    <SheetFooter>
      <Button variant="outline" onClick={onClearAll}>
        {clearAllLabel}
      </Button>
      <SheetClose asChild>
        <Button>{closeLabel}</Button>
      </SheetClose>
    </SheetFooter>
  </SheetContent>
</Sheet>
```

Use logical `start`/`end` positioning and the repository token classes. The close action is presentation-only; the filter hook remains the state boundary.

- [ ] **Step 5: Add responsive CSS and screen wiring**

Keep desktop as the base. At `max-width: 640px`, make search full width, expose only the mobile trigger, and allow summary chips to wrap. Pass all new localized strings from `FeedRecentScreen`; do not move storage, search, sorting, or API logic into the toolbar.

- [ ] **Step 6: Verify and commit**

```bash
bun run --filter web test -- src/features/explore/components/explore-filter-toolbar/explore-filter-toolbar.spec.tsx src/features/explore/screens/explore-recent.screen.spec.tsx
git add apps/web/src/features/explore/components/explore-filter-toolbar apps/web/src/features/explore/screens/explore-recent.screen.tsx apps/web/src/features/explore/screens/explore-recent.screen.spec.tsx
git commit -m "feat(web): standardize responsive Explore filters"
```

### Task 4: Standardize loading, empty, and active-summary presentation

**Files:**

- Create: `apps/web/src/features/explore/components/explore-empty-state/explore-empty-state.tsx`
- Create: `apps/web/src/features/explore/components/explore-empty-state/explore-empty-state.spec.tsx`
- Modify: `apps/web/src/features/explore/components/feed-skeleton/feed-skeleton.tsx`
- Modify: `apps/web/src/features/explore/components/feed-skeleton/feed-skeleton.module.css`
- Modify: `apps/web/src/features/explore/components/feed-skeleton/feed-skeleton.spec.tsx`
- Modify: `apps/web/src/features/explore/screens/explore-recent.screen.tsx`
- Modify: `apps/web/src/features/explore/screens/explore-recent.screen.spec.tsx`

**Interfaces:**

```ts
type ExploreEmptyStateProps = {
  title: string;
  description: string;
  clearLabel?: string;
  onClear?: () => void;
};

type FeedSkeletonProps = { count?: number };
```

`ExploreEmptyState` is a catalog-specific composition around shadcn `Empty`. `FeedSkeleton` keeps its existing count contract and renders shared `Skeleton` primitives with `aria-hidden="true"`.

- [ ] **Step 1: Write failing empty/skeleton tests**

Assert the empty state exposes a title, description, and optional Clear all button. Assert the skeleton renders exactly `count` card placeholders and remains hidden from screen readers.

- [ ] **Step 2: Confirm the test is red**

```bash
bun run --filter web test -- src/features/explore/components/explore-empty-state/explore-empty-state.spec.tsx src/features/explore/components/feed-skeleton/feed-skeleton.spec.tsx
```

- [ ] **Step 3: Implement Empty composition**

Use `EmptyHeader`, `EmptyMedia`, `EmptyTitle`, `EmptyDescription`, and `EmptyContent`. Use a neutral Lucide search/content icon. Render Clear all only when both `onClear` and `clearLabel` are supplied.

- [ ] **Step 4: Replace custom skeleton visual rules**

Use `Skeleton` for title/meta/subtitle bars, preserving the existing grid/card layout and removing only CSS that duplicates Skeleton treatment.

- [ ] **Step 5: Wire filtered and default empty states**

Use the new component for both “No listings found matching your filters” and “No content yet”. Pass `clearAll` for filtered results. Keep network errors as retryable alert states, not empty states.

- [ ] **Step 6: Verify and commit**

```bash
bun run --filter web test -- src/features/explore/components/explore-empty-state/explore-empty-state.spec.tsx src/features/explore/components/feed-skeleton/feed-skeleton.spec.tsx src/features/explore/utils/explore-filters.spec.ts src/features/explore/screens/explore-recent.screen.spec.tsx
git add apps/web/src/features/explore/components/explore-empty-state apps/web/src/features/explore/components/feed-skeleton apps/web/src/features/explore/screens/explore-recent.screen.tsx apps/web/src/features/explore/screens/explore-recent.screen.spec.tsx
git commit -m "refactor(web): standardize Explore loading and empty states"
```

### Task 5: Add browser-level responsive, RTL, theme, and persistence coverage

**Files:**

- Create: `apps/web/e2e/explore-filters.e2e.ts`
- Modify: `apps/web/e2e/test-base.ts` only if a reusable locale/theme fixture is required; prefer keeping setup local.

**Interfaces:**

- Use the existing `test` and `expect` exports from `./test-base`.
- Use the existing `locale` cookie and `data-theme`/`data-accent-theme` attributes; do not invent another locale or theme mechanism.

- [ ] **Step 1: Add desktop filter coverage**

At `1280x800`, navigate to `/explore`, wait for the Explore heading and toolbar, and assert the five approved filter labels, active summary, and Clear all action are visible.

- [ ] **Step 2: Add mobile Sheet coverage**

At `375x812`, navigate to `/explore`, assert the compact Filters trigger, open it, and assert the Sheet title, five fields, Clear all, and close action. Target roles and labels; never derive coordinates from screenshots.

- [ ] **Step 3: Add Arabic/RTL coverage**

Before navigation, set the existing locale cookie with `page.context().addCookies([{ name: "locale", value: "ar", url: "http://localhost:3008" }])`. Assert `document.documentElement.dir` is `rtl`, the filter surface remains operable, and translated labels do not break control associations.

- [ ] **Step 4: Add theme smoke coverage**

Use existing theme controls or `ThemeSync` document attributes. Verify toolbar, Sheet, Combobox popover, Badge, Empty, and Skeleton remain visible without page errors under light, dark, and one accent theme. Assert semantics/state rather than pixel colors.

- [ ] **Step 5: Add persistence and clear-all coverage**

Seed one Explore storage key before navigation, assert its active summary, click Clear all, reload, and assert the summary returns to All. Seed separate English/Arabic keys and assert only the current locale values render. Keep user-identity isolation covered by `exploreFiltersStorageKey` unit tests rather than requiring an authenticated E2E fixture.

- [ ] **Step 6: Run and commit the browser suite**

Run `PW_SKIP_WEB_BUILD=1 bun run --filter web test:e2e -- e2e/explore-filters.e2e.ts` when a production server already exists; otherwise run `bun run --filter web test:e2e -- e2e/explore-filters.e2e.ts` so Playwright performs its configured build. Then commit with:

```bash
git add apps/web/e2e/explore-filters.e2e.ts
git commit -m "test(web): cover Explore filter presentation states"
```

### Task 6: Run the complete quality gate and review the ticket diff

**Files:**

- No intentional source changes; fix only findings in the files listed above.

- [ ] **Step 1: Run formatting and lint**

Run `bunx oxfmt --check apps/web/src/features/explore apps/web/src/shared/components/ui/combobox.tsx apps/web/src/shared/components/ui/badge.tsx apps/web/src/shared/components/ui/empty.tsx apps/web/e2e/explore-filters.e2e.ts`, then run `bunx oxlint apps/web/src/features/explore apps/web/e2e/explore-filters.e2e.ts`.

- [ ] **Step 2: Run typecheck and the full web unit suite**

Run `bun run --filter web typecheck` and `bun run --filter web test:prepush`. Expected: typecheck passes and all web tests remain green.

- [ ] **Step 3: Run scoped React Doctor**

Run `bun run react-doctor --verbose --scope changed --base origin/main`. Expected: no local diagnostics. If the external score endpoint is unavailable, record that limitation without treating it as a source failure.

- [ ] **Step 4: Inspect the complete diff**

Run `git diff --check origin/main...HEAD`, `git diff --stat origin/main...HEAD`, and `git diff origin/main...HEAD -- apps/web/src/features/explore apps/web/src/shared/components/ui apps/web/e2e/explore-filters.e2e.ts`. Confirm there are no API/schema changes, duplicated hidden responsive trees, hardcoded design values, storage leakage, or unrelated changes.

- [ ] **Step 5: Run the standards/spec code review**

Review both axes. Verify primitives remain under `src/shared/components/ui`, Explore behavior remains under `features/explore`, IDs are stable in Arabic, Combobox/Sheet focus is keyboard-safe, active chips do not nest interactive controls, the backend remains authoritative, and every #560 acceptance criterion has a test or browser verification.

- [ ] **Step 6: Verify clean state**

Run `git status --short`, `git diff --check`, and `git log --oneline -8`. The worktree must contain only intended commits and no generated `.next` lock or unrelated artifacts.

## Self-Review Checklist

- [ ] Topic, Scholar, content type, language, and sort each have a visible standardized control.
- [ ] Searchable Scholar and Topic controls use Combobox semantics rather than an input nested inside Select content.
- [ ] Clear all is visible on desktop and inside the mobile Sheet, and restores defaults.
- [ ] Persistence remains scoped by Explore surface, locale, and User identity.
- [ ] Filter labels and DOM IDs remain stable under Arabic/RTL.
- [ ] Desktop and mobile render one responsive control branch each.
- [ ] Loading uses Skeleton, filtered/default empty states use Empty, and network errors remain retryable alerts.
- [ ] Light, dark, and accent themes use semantic tokens without new hardcoded colors.
- [ ] Existing API contracts and authorization boundaries are unchanged.
- [ ] Focused, full unit, E2E, typecheck, formatting, lint, and React Doctor checks are recorded.
