# List Component System

Standardized compound component system for rendering item lists with consistent action button layout and responsive behavior.

## Architecture

```text
List                    — Container wrapper (flex column)
├── List.Item           — Individual row item (flex row desktop, flex column mobile)
│   └── List.Item.Actions — Action button group (right-aligned desktop/tablet, below mobile)
└── List.Item           — (repeat for each item)
```

## Basic Usage

```tsx
import { List } from "@/shared/components/List";

export function MyList() {
  return (
    <List>
      <List.Item interactive onClick={() => handleItemClick(item.id)}>
        <div>Item Title</div>
        <List.Item.Actions>
          <Button>Edit</Button>
          <Button>Delete</Button>
        </List.Item.Actions>
      </List.Item>
    </List>
  );
}
```

## Props

### List (ListContainer)

- `children: ReactNode` — List.Item components or custom item content
- `className?: string` — Optional additional CSS class

### List.Item

- `children: ReactNode` — Item content + List.Item.Actions
- `onClick?: () => void` — Optional click handler (enables keyboard nav + hover states)
- `interactive?: boolean` — Show hover/active states even without onClick
- `className?: string` — Optional additional CSS class

### List.Item.Actions

- `children: ReactNode` — Action buttons
- `orientation?: 'horizontal' | 'vertical'` — Desktop/tablet action stacking (default: `'horizontal'`)
- `mobileOrientation?: 'horizontal' | 'vertical'` — Mobile action stacking (default: `'horizontal'`)
- `className?: string` — Optional additional CSS class

## Examples

### Simple List with Actions

```tsx
<List>
  <List.Item interactive onClick={() => navigate(`/edit/${id}`)}>
    <span>Scholar Name</span>
    <List.Item.Actions>
      <Button variant="secondary">Edit</Button>
      <Button variant="danger">Delete</Button>
    </List.Item.Actions>
  </List.Item>
</List>
```

### Vertical Action Stacking (Desktop)

```tsx
<List>
  <List.Item interactive>
    <span>Item content</span>
    <List.Item.Actions orientation="vertical">
      <Button>Option 1</Button>
      <Button>Option 2</Button>
      <Button>Option 3</Button>
    </List.Item.Actions>
  </List.Item>
</List>
```

### Mixed Orientations (Desktop Horizontal, Mobile Vertical)

```tsx
<List>
  <List.Item interactive>
    <span>Item content</span>
    <List.Item.Actions orientation="horizontal" mobileOrientation="vertical">
      <Button>Edit</Button>
      <Button>Delete</Button>
    </List.Item.Actions>
  </List.Item>
</List>
```

### Non-Interactive Item (No Click Handler)

```tsx
<List>
  <List.Item>
    <span>Item content without click handler</span>
  </List.Item>
</List>
```

## Styling & Layout

### Desktop/Tablet (> 640px)

- **List.Item**: Horizontal flex layout (`flex-direction: row`, `align-items: center`)
- **List.Item.Actions**: Positioned on the right (`margin-left: auto`), horizontal stacking by default
- **Spacing**: `gap: var(--space-component-gap-sm)` between action buttons

### Mobile (≤ 640px)

- **List.Item**: Vertical flex layout (`flex-direction: column`, `align-items: flex-start`)
- **List.Item.Actions**: Positioned below content (full width), horizontal stacking by default
- **Spacing**: `gap: var(--space-scale-xs)` between action buttons (tighter mobile spacing)

### Design Tokens

All spacing, colors, and borders use design token CSS variables:

- **Spacing**: `--space-component-gap-sm`, `--space-scale-xs`, `--space-scale-md`
- **Borders**: `--border-subtle` (divider between items)
- **Surfaces**: `--surface-default`, `--surface-hover`, `--surface-active`

## Accessibility

- **List.Item**: When interactive (with `onClick`), renders as `role="button"`, `tabIndex={0}`
- **Keyboard Navigation**: Enter and Space keys trigger the click handler
- **Focus Visible**: Focus ring applied on keyboard navigation
- **Action Buttons**: Must have proper `aria-label` on button components

Example:

```tsx
<List.Item.Actions>
  <Button aria-label="Edit scholar">Edit</Button>
  <Button aria-label="Delete scholar" variant="danger">
    Delete
  </Button>
</List.Item.Actions>
```

## Responsive Behavior

The List system uses CSS media queries (not component branching) for responsive layout:

```css
/* Desktop/tablet layout (base) */
.item {
  display: flex;
  flex-direction: row;
  align-items: center;
}

/* Mobile layout (≤ 640px) */
@media (max-width: 640px) {
  .item {
    flex-direction: column;
    align-items: flex-start;
  }
}
```

This ensures:

- Single implementation across all screen sizes
- No component duplication or branching
- CSS handles layout, component API stays consistent
- Works server-side and client-side

## Divider Behavior

- Dividers appear **between** List.Item elements (via `item + item` CSS selector)
- **No divider** between item content and List.Item.Actions
- Dividers use `--border-subtle` color

## Related Components

- **Button** — Use inside List.Item.Actions for action buttons
- **ListContainer** — Base container (internally used by List)
- **ListItem** — Individual item (internally used by List)
