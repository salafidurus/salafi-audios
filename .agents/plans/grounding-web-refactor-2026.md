# Feature Organization Refactoring Grounding Dossier (2026-07-06)

## Current Feature Structure

**Feature Folders Present:**

- `apps/web/src/features/admin/`: components (permission-badge, role-badge, user-avatar, user-card, user-row, user-search-bar, TranslationEditor) + hooks (use-admin-permissions) + screens (8 screens)
- `apps/web/src/features/admin-lectures/`: components (AudioUploader, LectureEditModal) + screens (admin-lectures) + api
- `apps/web/src/features/settings/`: screens only (account profile, account, settings-general, settings-legal, settings-profile)
- `apps/web/src/features/lecture/`: components (lecture-meta, lecture-play-button, lecture-save-button, series-context-bar, topic-chips) + screens (lecture-detail)
- `apps/web/src/features/{i18n,listing,library,progress,scholar}`: Additional feature folders referenced in refactoring plan

**Shared Components (`apps/web/src/shared/components/`):**

- AccentGradientFill, Activity, AppText, AuthRequiredState, Button, LocaleSwitcher, Responsive, ScreenInProgress, ScreenView, SegmentedControl, SettingsRow, SettingsSection, TextInput, UniversalList

**Admin Screens Pattern** (`apps/web/src/features/admin/screens/`):

```
admin-users/
  ├── admin-users.screen.desktop.module.css
  ├── admin-users.screen.desktop.tsx
  ├── admin-users.screen.mobile.module.css
  ├── admin-users.screen.mobile.tsx
  └── admin-users.screen.tsx
```

Mirrored across: admin-contents, admin-dashboard, admin-livestreams, admin-permissions, admin-scholar-detail, admin-scholars, admin-stats, admin-topics.

---

## Badge Component Implementations

**PermissionBadge** (`apps/web/src/features/admin/components/permission-badge/permission-badge.tsx:1-18`):

```tsx
export function PermissionBadge({ permission }: PermissionBadgeProps): ReactNode {
  return (
    <span className={styles.badge}>
      <Shield className={styles.icon} />
      {permission}
    </span>
  );
}
```

**Styles** (`apps/web/src/features/admin/components/permission-badge/permission-badge.module.css`):

```css
.badge {
  display: inline-flex;
  align-items: center;
  gap: 3px;
  padding: 2px var(--space-scale-xs);
  border-radius: var(--radius-scale-sm);
  font-size: var(--typo-xs-font-size);
  background: var(--surface-primary-subtle);
  color: var(--content-primary-strong);
}
```

**RoleBadge** (`apps/web/src/features/admin/components/role-badge/role-badge.tsx`):

```tsx
export function RoleBadge({ role }: RoleBadgeProps): ReactNode {
  const isAdmin = role === "admin";
  return <span className={`${styles.badge} ${isAdmin ? styles.admin : styles.user}`}>{role}</span>;
}
```

**Styles** (`apps/web/src/features/admin/components/role-badge/role-badge.module.css`):

```css
.admin {
  background: var(--surface-primary-subtle);
  color: var(--content-primary-strong);
}
.user {
  background: var(--surface-subtle);
  color: var(--content-muted);
}
```

---

## Design Token Usage Patterns

**Design System Tokens** (`apps/web/src/app/globals.css:1-30`):

```css
@theme inline {
  --surface-default: var(--surface-default);
  --action-primary: var(--action-primary);
  --border-default: var(--border-default);
  --spacing-page-x: var(--space-layout-page-x);
  --spacing-page-y: var(--space-layout-page-y);
  --spacing-section-y: var(--space-layout-section-y);
  --spacing-card-p: var(--space-component-card-padding);
  --radius-component-panel: var(--radius-component-panel);
  --radius-component-chip: var(--radius-component-chip);
  --shadow-lg: var(--shadow-lg);
  --text-h1: var(--typo-display-lg-font-size);
  --text-h2: var(--typo-title-lg-font-size);
  --text-caption: var(--typo-caption-font-size);
  --font-sans: var(--typo-body-md-font-family);
  --typo-display-lg-font-family: var(--typo-display-lg-font-family);
}
```

**CommonPatterns in CSS Modules**: Badge components, table rows, and cards consistently use design tokens (`--space-scale-xs`, `--radius-scale-sm`, `--typo-xs-font-size`, `--surface-subtle`, `--content-muted`).

---

## Admin Screen Patterns

**UserCard** (`apps/web/src/features/admin/components/user-card/user-card.tsx:10-30`):
Composes UserAvatar + PermissionBadge + RoleBadge in a card layout with `topRow`, `nameSection`, `permissions`, `joined` sub-elements.

**UserRow** (`apps/web/src/features/admin/components/user-row/user-row.tsx:13-35`):
Table row variant with identical child components but `<tr>/<td>` markup, reusing badge components and avatar across card/row presentations.

**Admin Screen Template** (`apps/web/src/features/admin/screens/admin-users/admin-users.screen.*`):
Responsive layout files (desktop, mobile, unified) mirror admin-dashboard, admin-scholars, etc. patterns.

---

## Shared Layout Components

**SettingsRow** (`apps/web/src/shared/components/SettingsRow/SettingsRow.tsx:8-28`):

```tsx
export function SettingsRow({ label, sublabel, children, fullWidth = false }: SettingsRowProps) {
  if (fullWidth) {
    return <div className={styles.rowFull}>{children}</div>;
  }
  return (
    <div className={styles.row}>
      <div className={styles.labelGroup}>
        <span className={styles.label}>{label}</span>
        {sublabel && <span className={styles.sublabel}>{sublabel}</span>}
      </div>
      {children && <div className={styles.control}>{children}</div>}
    </div>
  );
}
```

**Route Structure** (`apps/web/src/app/(main)/`):
Groups routes by layout context: `(admin)`, `(auth)`, `(feed)`, `(legal)`, `(library)`, `(live)`, `(search)`, `(settings)`, `(support)`. Admin routes nested under `admin/` subdirectories per feature (contents, livestreams, scholars, stats, users).

---

## Large Refactoring Precedent

**Listing Unification Plan** (`.agents/plans/completed/2026-07-04-arch-plans.md`):
Multi-stage refactoring across three git branches (chore/arch-db-hygiene, chore/nestjs-zod-integration, refactor/listings-unified-cutover) consolidating Collection/Series/Lecture into unified Listing model. Stages 7-8 involve web and mobile feature folder migrations.

**Stage 7: Web Frontend** (`.agents/plans/completed/2026-07-04-arch-plans.md:1100+`):
Rename routes from `/lectures/[id]` → `/listings/[slug]`, delete legacy lecture/series/collection app directories, integrate Zod schemas in form controllers, update admin curation lists to reference `AdminListingListItemDto`, implement format-discriminator detail screens.

**Stage 6: Backend Services** (`.agents/plans/completed/2026-07-04-arch-plans.md:900+`):
Create `apps/api/src/modules/listings/` (repo, service, controllers), delete deprecated `admin-collections.controller.ts`, `admin-series.controller.ts`, `lectures/` directory. Update permissions routing under `/admin/users/:userId/permissions`.

---

## Import Patterns & Dependencies

**Admin-Lectures Modal** (`apps/web/src/features/admin-lectures/components/LectureEditModal/LectureEditModal.tsx:3-10`):

```tsx
import { useApiQuery, queryKeys, httpClient, endpoints } from "@sd/core-contracts";
import type {
  ScholarListItemDto,
  TopicRefDto,
  AdminListingListItemDto,
  AdminListingDetailDto,
} from "@sd/core-contracts";
import { createLecture, updateLecture } from "../../api/admin-lectures.api";
```

Demonstrates cross-feature imports and use of DTO contracts from shared packages.

---

## Adjacent Feature Organization

**Lecture Feature** (`apps/web/src/features/lecture/`):
Minimal components (lecture-meta, play-button, save-button, series-context-bar, topic-chips) + detail screen. Contrasts with admin-heavy admin/ folder (8 badge/avatar components + 8 screen variants).

**Settings Feature** (`apps/web/src/features/settings/screens/`):
No components folder; all screens in `screens/` directly. Uses shared SettingsRow component from `apps/web/src/shared/components/`.

---

## Key Dependencies & Interconnections

- Badge components (permission-badge, role-badge) are **coupled** to admin user management; reused across admin-users screen (card + row presentations).
- SettingsRow is a **primary shared abstraction** for form layouts; used across settings screens and potentially admin forms.
- Admin screens follow **desktop/mobile/unified.tsx pattern**; lecture detail follows same pattern.
- Core-contracts DTO types (`AdminListingListItemDto`, `AdminListingDetailDto`, etc.) are the **contract boundary** for admin-lectures and admin features.
- Upcoming Listing unification (Stage 7) will rename admin lecture editor to admin listing editor and refactor routes from lecture to listing context.
