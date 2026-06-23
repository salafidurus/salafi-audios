# AGENT.md - packages/design-tokens

This package defines design tokens (colors, spacing, radius, typography) for web and mobile.

## Rules

- Single source of truth for all visual tokens. Never hardcode colors, spacing, or radius in apps.
- Prefer semantic naming. If a token is missing, add it here — don't hardcode in apps.
- Changes affect multiple apps; keep updates minimal and well-scoped.

## Path aliases

- Use `@/` for package-local imports (maps to `src/*`).

---

## Web Usage (CSS Variables)

Injected via `apps/web/src/app/theme-css.ts`, applied in `apps/web/src/app/layout.tsx`.

```css
/* Colors — surfaces */
--surface-canvas, --surface-default, --surface-subtle, --surface-elevated,
--surface-hover, --surface-inverse, --surface-primary-subtle, --surface-secondary-subtle,
--surface-selected, --surface-disabled

/* Colors — borders */
--border-default, --border-subtle, --border-strong, --border-muted,
--border-hover, --border-focus, --border-primary, --border-primary-strong,
--border-secondary, --border-secondary-strong, --border-disabled

/* Colors — content (text/icons) */
--content-default, --content-muted, --content-subtle, --content-strong,
--content-inverse, --content-primary, --content-primary-strong,
--content-secondary, --content-secondary-strong,
--content-on-primary, --content-on-secondary, --content-on-danger, --content-on-success,
--content-disabled

/* Colors — actions */
--action-primary, --action-secondary, --action-danger, --action-success, --action-warning, --action-info

/* Spacing — layout */
--space-layout-page-x, --space-layout-page-y, --space-layout-section-y, --space-layout-content-max

/* Spacing — component */
--space-component-card-padding, --space-component-panel-padding,
--space-component-chip-x, --space-component-chip-y,
--space-component-gap-sm, --space-component-gap-md, --space-component-gap-lg, --space-component-gap-xl

/* Spacing — scale */
--space-xs, --space-sm, --space-md, --space-lg, --space-xl, --space-2xl, --space-3xl, --space-4xl

/* Radius */
--radius-component-chip, --radius-component-card, --radius-component-panel-sm, --radius-component-panel,
--radius-xs, --radius-sm, --radius-md, --radius-lg, --radius-xl, --radius-full

/* Typography */
--typo-display-lg, --typo-display-md, --typo-title-lg, --typo-title-md,
--typo-body-lg, --typo-body-md, --typo-body-sm, --typo-label-md, --typo-caption, --typo-xs
```

**In CSS Modules:** `background-color: var(--surface-canvas);`
**In JSX inline:** `style={{ color: 'var(--content-default)' }}`

---

## Mobile Usage (Unistyles Theme)

```typescript
import { StyleSheet } from "react-native-unistyles";

const styles = StyleSheet.create((theme) => ({
  container: {
    backgroundColor: theme.colors.surface.canvas,
    padding: theme.spacing.layout.pageX,
    borderRadius: theme.radius.component.card,
  },
  title: {
    ...theme.typography.titleMd,
    color: theme.colors.content.strong,
  },
}));
```

Token paths:

- `theme.colors.{surface,border,content,action}.*`
- `theme.spacing.{layout,component,scale}.*`
- `theme.radius.{component,scale}.*`
- `theme.typography.*` (each variant spreads font-family, size, weight, line-height)
- `theme.shadows.*`

---

## Token Semantics

| Group       | Role                                        |
| ----------- | ------------------------------------------- |
| `surface.*` | Backgrounds and fills                       |
| `border.*`  | Outlines, dividers, separators, focus rings |
| `content.*` | Text, icons, foreground elements            |
| `action.*`  | Interactive fill colors (buttons)           |

**Never** use content tokens as backgrounds, surface tokens for text, or border tokens as primary text color.

### Pairings

| Pattern                  | Tokens                                                               |
| ------------------------ | -------------------------------------------------------------------- |
| Default container        | `surface.default` + `border.default` + `content.default`             |
| Subtle container         | `surface.subtle` + `border.subtle` + `content.default`               |
| Elevated (modal/popover) | `surface.elevated` + `content.default`                               |
| Selected item            | `surface.selected` + `border.primary` + `content.strong`             |
| Primary-tinted           | `surface.primarySubtle` + `border.primary` + `content.primaryStrong` |
| Inverse block            | `surface.inverse` + `content.inverse`                                |
| Disabled                 | `surface.disabled` + `border.disabled` + `content.disabled`          |
| Primary button           | `action.primary` + `content.onPrimary`                               |
| Secondary button         | `action.secondary` + `content.onSecondary`                           |

### Spacing by role

| Use                   | Token                                 |
| --------------------- | ------------------------------------- |
| Page padding X / Y    | `layout.pageX` / `layout.pageY`       |
| Section gap           | `layout.sectionY`                     |
| Card padding          | `component.cardPadding`               |
| Panel / modal padding | `component.panelPadding`              |
| Chip padding          | `component.chipX` + `component.chipY` |
| Standard gap          | `component.gapMd`                     |
| Fine-grained          | `scale.*` (xs → 4xl)                  |

### Radius by component

| Component           | Token               |
| ------------------- | ------------------- |
| Card                | `component.card`    |
| Chip / badge / pill | `component.chip`    |
| Modal / drawer      | `component.panel`   |
| Small popover       | `component.panelSm` |
| Fully rounded       | `scale.full`        |

### Typography by role

| Role                   | Token                          |
| ---------------------- | ------------------------------ |
| Hero headline          | `displayLg` / `displayMd`      |
| Section / card title   | `titleLg` / `titleMd`          |
| Body text              | `bodyLg` / `bodyMd` / `bodySm` |
| Button / tab / label   | `labelMd`                      |
| Metadata / helper text | `caption`                      |
| Tiny metadata only     | `xs`                           |
