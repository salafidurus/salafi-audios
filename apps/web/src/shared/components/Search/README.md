# Search Component System

Standardized compound component system for search input and filtering with consistent behavior and responsive design.

## Architecture

```text
Search                  — Namespace object for compound components
├── Search.Bar          — Search input with icon and clear button
└── Search.Filter       — Filter chip group with toggle selection
```

## Basic Usage

### Single-Select Mode (Default)

```tsx
import { Search } from "@/shared/components/Search";
import { useState } from "react";

export function SearchScreen() {
  const [searchValue, setSearchValue] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string>("");

  return (
    <div>
      <Search.Bar value={searchValue} onChange={setSearchValue} placeholder="Search scholars..." />
      <Search.Filter
        chips={[
          { id: "lecture", label: "Lectures" },
          { id: "article", label: "Articles" },
          { id: "series", label: "Series" },
        ]}
        selected={selectedCategory ? [selectedCategory] : []}
        onChipChange={(id) => {
          setSelectedCategory((prev) => (prev === id ? "" : id));
        }}
      />
    </div>
  );
}
```

### Multi-Select Mode

```tsx
const [selectedFilters, setSelectedFilters] = useState<string[]>([]);

<Search.Filter
  chips={[...]}
  selected={selectedFilters}
  onChipChange={(id) => {
    setSelectedFilters((prev) =>
      prev.includes(id) ? prev.filter((f) => f !== id) : [...prev, id],
    );
  }}
  multiple
/>
```

## Props

### Search.Bar

- `value: string` — Controlled input value
- `onChange: (value: string) => void` — Called when input value changes
- `onClear?: () => void` — Optional callback when clear button is clicked (beyond onChange)
- `placeholder?: string` — Input placeholder text (default: `"Search..."`)
- `disabled?: boolean` — Disable input and clear button
- `className?: string` — Optional additional CSS class

### Search.Filter

- `chips: FilterChip[]` — Array of filter options (`{ id: string; label: string }`)
- `selected: string[]` — Array of selected filter IDs
- `onChipChange: (id: string) => void` — Called when a chip is clicked (toggles selection)
- `onChipRemove?: (id: string) => void` — Optional callback when close button is clicked
- `showCloseButton?: boolean` — Show close button on selected chips (default: `true`)
- `multiple?: boolean` — Allow multiple selections; enables checkbox-like multi-select behavior (default: `false` for single-select/radio)
- `includeAllOption?: boolean` — Show an "All" chip that clears all filters when clicked (default: `true`)
- `className?: string` — Optional additional CSS class

## Selection Modes

### Single-Select Mode (Default)

By default, `Search.Filter` operates in single-select (radio button) mode where only one chip can be selected at a time. When the user clicks a selected chip, it becomes deselected. This is ideal for content type filtering, category selection, or any mutually-exclusive choice.

**Characteristics:**

- Only one chip selected at a time
- Clicking a selected chip deselects it
- Use a single string state variable for the selected value
- Convert to array format: `selected={selectedValue ? [selectedValue] : []}`

### Multi-Select Mode

Set `multiple={true}` to enable multi-select (checkbox) mode where users can select multiple chips simultaneously. This is useful for filtering by multiple criteria that are not mutually exclusive.

**Characteristics:**

- Multiple chips can be selected
- Clicking a chip toggles its selection
- Use an array state variable for selected values
- Pass selected values directly: `selected={selectedValues}`

## "All" Option

By default, `Search.Filter` includes an "All" chip that clears all filters. The "All" chip:

- Appears as the first chip in the filter group
- Is selected when no other chips are selected (i.e., showing all content)
- When clicked while other filters are active, clears all selections
- When other filter chips are clicked, "All" is automatically deselected

To disable the "All" chip, set `includeAllOption={false}`.

**Characteristics:**

- "All" is automatically selected when `selected.length === 0`
- Clicking "All" when filters are active clears all selections by calling `onChipChange()` for each selected filter
- "All" cannot be manually removed (no close button)
- Works in both single-select and multi-select modes

## Examples

### Single-Select Filter with "All" Option (Default)

```tsx
const [selectedCategory, setSelectedCategory] = useState<string>("");

<Search.Filter
  chips={[
    { id: "lecture", label: "Lectures" },
    { id: "article", label: "Articles" },
    { id: "series", label: "Series" },
  ]}
  selected={selectedCategory ? [selectedCategory] : []}
  onChipChange={(id) => {
    setSelectedCategory((prev) => (prev === id ? "" : id));
  }}
  includeAllOption={true}
/>;
```

### Multi-Select Filter (Tags)

```tsx
const [selectedTags, setSelectedTags] = useState<string[]>([]);

<Search.Filter
  chips={[
    { id: "fiqh", label: "Fiqh" },
    { id: "aqeedah", label: "Aqeedah" },
    { id: "adab", label: "Adab" },
  ]}
  selected={selectedTags}
  onChipChange={(id) => {
    setSelectedTags((prev) => (prev.includes(id) ? prev.filter((f) => f !== id) : [...prev, id]));
  }}
  multiple
/>;
```

### Search Bar with Clear Callback

```tsx
<Search.Bar
  value={searchValue}
  onChange={setSearchValue}
  onClear={() => {
    console.log("Search cleared");
    resetFilters();
  }}
  placeholder="Find content..."
/>
```

### Filter with Remove Handler

```tsx
<Search.Filter
  chips={filterOptions}
  selected={selectedCategory ? [selectedCategory] : []}
  onChipChange={(id) => {
    setSelectedCategory((prev) => (prev === id ? "" : id));
  }}
  onChipRemove={(id) => {
    setSelectedCategory("");
  }}
/>
```

### Without Close Buttons

```tsx
<Search.Filter
  chips={filterOptions}
  selected={selectedCategory ? [selectedCategory] : []}
  onChipChange={(id) => {
    setSelectedCategory((prev) => (prev === id ? "" : id));
  }}
  showCloseButton={false}
/>
```

## Styling & Layout

### Search.Bar

- **Layout**: Horizontal flex container with search icon on the left
- **Search Icon**: 20x20px, left-aligned inside input wrapper
- **Input**: Fills remaining width, no border (underline style via border-bottom)
- **Clear Button**: Appears only when `value.length > 0`, right-aligned
- **Spacing**: `--space-component-gap-sm` between icon and input

### Search.Filter

- **Layout**: Horizontal flex row, wrappable on mobile
- **Chips**: Toggle buttons with `aria-pressed` state
- **Selected Chips**: Background color from `--surface-active`
- **Close Buttons**: Appear only on selected chips (when `showCloseButton={true}`)
- **Spacing**: `--space-component-gap-sm` between chips
- **Mobile**: Tighter wrapping with `--space-scale-xs` gap

### Design Tokens

All spacing, colors, and borders use design token CSS variables:

- **Spacing**: `--space-component-gap-sm`, `--space-scale-xs`, `--space-scale-md`
- **Borders**: `--border-default` (underline), `--border-hover`
- **Surfaces**: `--surface-default`, `--surface-hover`, `--surface-active`
- **Content**: `--content-primary`, `--content-secondary`

## Accessibility

### Search.Bar

- **Input**: Has `aria-label="Search input"` for screen readers
- **Clear Button**: Has `aria-label="Clear search"` when visible
- **Icon**: Has `aria-hidden="true"` (decorative)
- **Focus**: Standard input focus ring behavior

### Search.Filter

- **Chips**: Each chip is a `<button>` with `aria-pressed={selected}` state
- **Chip Label**: `aria-label="Filter by {label}"` on the toggle button
- **Close Button**: `aria-label="Remove {label} filter"` on the close action
- **Focus**: All buttons are keyboard-navigable

## Responsive Behavior

Both components use CSS media queries for responsive design:

- **Desktop (> 640px)**: Full horizontal layout
- **Mobile (≤ 640px)**: Compressed spacing, wrappable chip layout

Single implementation handles both sizes; no component duplication or branching.

## Related Components

- **Button** — General-purpose button for custom actions
- **Dropdown** — For more complex filtering with nested options
- **List** — For rendering filtered/searched results

## Data Flow Example

```tsx
export function ContentSearch() {
  const [search, setSearch] = useState("");
  const [filters, setFilters] = useState<string[]>([]);

  // Filter logic
  const results = content
    .filter((item) => item.title.toLowerCase().includes(search.toLowerCase()))
    .filter((item) => filters.length === 0 || filters.includes(item.type));

  return (
    <>
      <Search.Bar value={search} onChange={setSearch} placeholder="Search by title..." />
      <Search.Filter
        chips={[
          { id: "lecture", label: "Lectures" },
          { id: "article", label: "Articles" },
        ]}
        selected={filters}
        onChipChange={(id) => {
          setFilters((prev) => (prev.includes(id) ? prev.filter((f) => f !== id) : [...prev, id]));
        }}
        onChipRemove={(id) => {
          setFilters((prev) => prev.filter((f) => f !== id));
        }}
      />
      <ContentList items={results} />
    </>
  );
}
```
