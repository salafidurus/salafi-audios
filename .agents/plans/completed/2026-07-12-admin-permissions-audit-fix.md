# Admin Permissions Audit Fix — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development
> (recommended) or superpowers:executing-plans to implement this plan task-by-task.
> Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Fix all 23 permission gate mismatches in the admin UI and add granular
`LIVE_START`/`LIVE_STOP` enforcement on the backend.

**Architecture:** Frontend gates use the existing `PermissionGate` component and
`useAdminPermissions()` hook — both already present. Backend enforcement replaces
the single `PATCH sessions/:id/status` endpoint (gated globally on `LIVE_EDIT`) with
three dedicated action endpoints so `@RequiresPermission` can be applied per action
without any manual permission checks inside a handler.

**Tech Stack:** Next.js 15 (web), NestJS (api), Vitest + React Testing Library (web
tests), Vitest + Supertest integration spec (api tests), `@sd/core-contracts`
`Permissions` constant and `AdminPermission` type.

## Global Constraints

- Permission checks are **hide** semantics (not disable) — missing permission →
  element not rendered, not greyed out.
- `PermissionGate` renders `null` by default when permission is absent — no
  `fallback` prop needed unless specified.
- `AdminPermission` type lives in `@sd/core-contracts` and includes `LIVE_START`,
  `LIVE_STOP` (already defined).
- `Permissions` constant (from `@sd/core-contracts`) is the authoritative enum for
  backend `@RequiresPermission` decorators.
- `useAdminPermissions()` returns `{ permissions: AdminPermission[] }` — a flat
  string array (not `AdminPermissionDto[]`).
- TDD: write a failing test first, confirm it fails, implement, confirm it passes,
  commit.
- Commit message format: Conventional Commits (`fix(scope): description`).
- Run commands from repo root unless noted.

---

## Stage 1: Fix Dashboard Card Permissions

**Files:**

- Modify: `apps/web/src/features/admin/screens/admin-dashboard/admin-dashboard.screen.tsx`
- Modify: `apps/web/src/features/admin/screens/admin-dashboard/admin-dashboard.screen.spec.tsx`

**Interfaces:**

- Consumes: `ADMIN_SECTIONS` array at module top; each item has `permission: AdminPermission`.
- Produces: no new exports — pure value-change to `ADMIN_SECTIONS`.

**Context:** The dashboard filters cards by `permissions.includes(s.permission)`.
The bug is that each card is gated on an _edit_ permission, so a read-only admin
sees no cards. Fix: change the four `permission` values to the corresponding view
permissions, and update the test mock data to match.

- [ ] **Step 1: Write the failing test**

  In `admin-dashboard.screen.spec.tsx`, add inside the existing `describe` block:

  ```typescript
  it("shows cards when user has only view-level permissions", () => {
    (useAdminPermissions as Mock).mockReturnValue({
      data: {
        permissions: ["SCHOLARS_VIEW", "LISTINGS_VIEW", "USERS_VIEW", "LIVE_VIEW"],
      },
      isFetching: false,
    });

    render(<AdminDashboardScreen />);

    expect(screen.getByRole("link", { name: /scholars/i })).toBeInTheDocument();
    expect(screen.getByRole("link", { name: /contents/i })).toBeInTheDocument();
    expect(screen.getByRole("link", { name: /users/i })).toBeInTheDocument();
    expect(screen.getByRole("link", { name: /livestreams/i })).toBeInTheDocument();
  });
  ```

- [ ] **Step 2: Run the test — confirm it fails**

  ```bash
  bun run --filter web test src/features/admin/screens/admin-dashboard/admin-dashboard.screen.spec.tsx
  ```

  Expected: FAIL — the view-only user sees no cards.

- [ ] **Step 3: Update `ADMIN_SECTIONS` in the screen**

  In `apps/web/src/features/admin/screens/admin-dashboard/admin-dashboard.screen.tsx`,
  replace the four `permission` values in the `ADMIN_SECTIONS` array:

  ```typescript
  const ADMIN_SECTIONS: AdminSection[] = [
    {
      title: "Scholars",
      description: "Manage scholars, their profiles and visibility",
      descriptionMobile: "Manage scholars",
      href: "/admin/scholars",
      permission: "SCHOLARS_VIEW" as const, // was SCHOLARS_EDIT
    },
    {
      title: "Contents",
      description: "Manage topics, lectures, and content hierarchy",
      descriptionMobile: "Manage content",
      href: "/admin/contents",
      permission: "LISTINGS_VIEW" as const, // was LISTINGS_EDIT
    },
    {
      title: "Users",
      description: "Manage admin users and permissions",
      descriptionMobile: "Manage users",
      href: "/admin/users",
      permission: "USERS_VIEW" as const, // was USERS_GRANT_PERMISSIONS
    },
    {
      title: "Livestreams",
      description: "Manage live sessions and channel status",
      descriptionMobile: "Manage livestreams",
      href: "/admin/live",
      permission: "LIVE_VIEW" as const, // was LIVE_EDIT
    },
  ];
  ```

- [ ] **Step 4: Update the existing test mock data**

  Update the existing "renders sections based on user permissions" test to use the
  correct view permissions:

  ```typescript
  it("renders sections based on user permissions", () => {
    (useAdminPermissions as Mock).mockReturnValue({
      data: {
        permissions: ["SCHOLARS_VIEW", "LISTINGS_VIEW", "USERS_VIEW", "LIVE_VIEW"],
      },
      isFetching: false,
    });
    // assertions unchanged
  ```

- [ ] **Step 5: Run all dashboard tests — confirm they pass**

  ```bash
  bun run --filter web test src/features/admin/screens/admin-dashboard/admin-dashboard.screen.spec.tsx
  ```

  Expected: PASS (both tests).

- [ ] **Step 6: Typecheck**

  ```bash
  bun run --filter web typecheck
  ```

  Expected: no errors.

- [ ] **Step 7: Commit**

  ```bash
  git add apps/web/src/features/admin/screens/admin-dashboard/admin-dashboard.screen.tsx \
          apps/web/src/features/admin/screens/admin-dashboard/admin-dashboard.screen.spec.tsx
  git commit -m "fix(web): correct admin dashboard card permission gates

  Change dashboard cards from edit/grant permissions to view permissions
  so users with SCHOLARS_VIEW (not SCHOLARS_EDIT) see the Scholars card, etc."
  ```

---

## Stage 2: Gate Sidebar Admin Nav Items Individually

**Files:**

- Modify: `apps/web/src/features/navigation/components/sidebar/nav-items.tsx`
- Modify: `apps/web/src/features/navigation/components/sidebar/sidebar.desktop.spec.tsx`

**Interfaces:**

- Consumes: `useAdminPermissions()` (already imported), `AdminPermission` type from
  `@sd/core-contracts`.
- Produces: no new exports. `AdminNavItem` type gains `requiredPermission?: AdminPermission`;
  a `visibleAdminNavItems` derived array replaces `adminNavItems` in the JSX render loop.

**Context:** Currently `hasAdminAccess = permissions.length > 0` gates the entire
admin section — if the user has _any_ admin permission, all 6 nav links appear.
Fix: add a `requiredPermission` field to each item and filter before rendering.
Home and Stats have no `requiredPermission` (visible to any admin).

- [ ] **Step 1: Write failing tests**

  Replace the last test ("renders ADMIN section with sub-routes only when user has
  admin permissions", line 134 in `sidebar.desktop.spec.tsx`) with two new tests:

  ```typescript
  it("shows only the nav items matching the user's specific admin permissions", () => {
    (useAuth as Mock).mockReturnValue({
      isAuthenticated: true,
      isLoading: false,
      user: { name: "Admin User", email: "admin@example.com" },
    });
    (useAdminPermissions as Mock).mockReturnValue({
      data: { permissions: ["SCHOLARS_VIEW"] },
    });

    render(<Sidebar />);

    expect(screen.getByText("ADMIN")).toBeInTheDocument();
    expect(screen.getByText("Home")).toBeInTheDocument();
    expect(screen.getByText("Stats")).toBeInTheDocument();
    expect(screen.getByText("Scholars")).toBeInTheDocument();
    expect(screen.queryByText("Users")).not.toBeInTheDocument();
    expect(screen.queryByText("Contents")).not.toBeInTheDocument();
    expect(screen.queryByText("Livestreams")).not.toBeInTheDocument();
  });

  it("shows all nav items when user has all required permissions", () => {
    (useAuth as Mock).mockReturnValue({
      isAuthenticated: true,
      isLoading: false,
      user: { name: "Super Admin", email: "super@example.com" },
    });
    (useAdminPermissions as Mock).mockReturnValue({
      data: {
        permissions: ["SCHOLARS_VIEW", "LISTINGS_VIEW", "USERS_VIEW", "LIVE_VIEW"],
      },
    });

    render(<Sidebar />);

    expect(screen.getByText("ADMIN")).toBeInTheDocument();
    expect(screen.getByText("Home")).toBeInTheDocument();
    expect(screen.getByText("Stats")).toBeInTheDocument();
    expect(screen.getByText("Scholars")).toBeInTheDocument();
    expect(screen.getByText("Contents")).toBeInTheDocument();
    expect(screen.getByText("Users")).toBeInTheDocument();
    expect(screen.getByText("Livestreams")).toBeInTheDocument();
  });
  ```

- [ ] **Step 2: Run tests — confirm first new test fails**

  ```bash
  bun run --filter web test src/features/navigation/components/sidebar/sidebar.desktop.spec.tsx
  ```

  Expected: FAIL — "Users", "Contents", "Livestreams" appear even with only `SCHOLARS_VIEW`.

- [ ] **Step 3: Update `AdminNavItem` type and populate `requiredPermission`**

  In `apps/web/src/features/navigation/components/sidebar/nav-items.tsx`:

  Add the import (alongside existing `@sd/core-contracts` imports):

  ```typescript
  import type { AdminPermission } from "@sd/core-contracts";
  ```

  Update the `AdminNavItem` type:

  ```typescript
  type AdminNavItem = {
    label: string;
    Icon: LucideIcon;
    href: string;
    activeMatch: string;
    requiredPermission?: AdminPermission; // undefined = visible to any admin
  };
  ```

  Update the `adminNavItems` array:

  ```typescript
  const adminNavItems: AdminNavItem[] = [
    {
      label: "Home",
      Icon: LayoutDashboard,
      href: routes.admin.index,
      activeMatch: routes.admin.index,
      // no requiredPermission
    },
    {
      label: "Stats",
      Icon: BarChart3,
      href: routes.admin.stats,
      activeMatch: routes.admin.stats,
      // no requiredPermission
    },
    {
      label: "Users",
      Icon: Users,
      href: routes.admin.users,
      activeMatch: routes.admin.users,
      requiredPermission: "USERS_VIEW",
    },
    {
      label: "Contents",
      Icon: FolderOpen,
      href: routes.admin.contents,
      activeMatch: routes.admin.contents,
      requiredPermission: "LISTINGS_VIEW",
    },
    {
      label: "Scholars",
      Icon: GraduationCap,
      href: routes.admin.scholars,
      activeMatch: routes.admin.scholars,
      requiredPermission: "SCHOLARS_VIEW",
    },
    {
      label: "Livestreams",
      Icon: Radio,
      href: routes.admin.live,
      activeMatch: routes.admin.live,
      requiredPermission: "LIVE_VIEW",
    },
  ];
  ```

- [ ] **Step 4: Filter items in `NavItems` and swap the render reference**

  In the `NavItems` function body, after
  `const { data: adminPermissionsData } = useAdminPermissions();`, add:

  ```typescript
  const adminPermissions: AdminPermission[] = adminPermissionsData?.permissions ?? [];

  const visibleAdminNavItems = adminNavItems.filter(
    (item) =>
      item.requiredPermission === undefined || adminPermissions.includes(item.requiredPermission),
  );
  ```

  In JSX, replace `{adminNavItems.map(...)}` with `{visibleAdminNavItems.map(...)}`.
  No other render changes.

- [ ] **Step 5: Run tests — confirm they all pass**

  ```bash
  bun run --filter web test src/features/navigation/components/sidebar/sidebar.desktop.spec.tsx
  ```

  Expected: PASS.

- [ ] **Step 6: Typecheck**

  ```bash
  bun run --filter web typecheck
  ```

  Expected: no errors.

- [ ] **Step 7: Commit**

  ```bash
  git add apps/web/src/features/navigation/components/sidebar/nav-items.tsx \
          apps/web/src/features/navigation/components/sidebar/sidebar.desktop.spec.tsx
  git commit -m "fix(web): gate sidebar admin nav items individually

  Instead of showing all 6 admin sidebar links when the user has any admin
  permission, show each link only when the user has the matching view permission.
  Home and Stats remain visible to all admins."
  ```

---

## Stage 3: Fix UserItem Permission Gates

**Files:**

- Modify: `apps/web/src/features/admin/components/user-item/user-item.tsx`
- Create: `apps/web/src/features/admin/components/user-item/user-item.spec.tsx`

**Interfaces:**

- Consumes: `PermissionGate` (already imported in source), `useAdminPermissions`
  (mocked in tests).
- Produces: no new exports.

**Context:** Both action buttons are wrapped in a single
`<PermissionGate requires="USERS_VIEW">`. Two bugs:
(1) `USERS_VIEW` is the wrong permission for mutation actions, and
(2) both buttons share one gate so they cannot be shown independently.
Fix: give each button its own `PermissionGate` with the correct permission and
remove the shared outer gate.

- [ ] **Step 1: Create `user-item.spec.tsx` with failing tests**

  ```typescript
  import { vi, type Mock } from "vitest";
  import { render, screen } from "@testing-library/react";
  import { UserItem } from "./user-item";
  import { useAdminPermissions } from "@/features/admin/hooks/use-admin-permissions";

  vi.mock("@/features/admin/hooks/use-admin-permissions", () => ({
    useAdminPermissions: vi.fn(),
  }));
  vi.mock("@/shared/hooks/use-responsive", () => ({
    useResponsive: () => ({ isTablet: false }),
  }));

  const baseUser = {
    id: "u1",
    name: "Alice",
    email: "alice@example.com",
    image: null,
    roles: [],
    createdAt: "2024-01-01T00:00:00.000Z",
    permissions: [] as import("@sd/core-contracts").AdminPermission[],
  };

  describe("UserItem", () => {
    it("shows Manage Permissions button only when user has USERS_GRANT_PERMISSIONS", () => {
      (useAdminPermissions as Mock).mockReturnValue({
        data: { permissions: ["USERS_GRANT_PERMISSIONS"] },
      });

      render(
        <UserItem
          user={baseUser}
          onManagePermissions={vi.fn()}
          onManageRoles={vi.fn()}
        />,
      );

      expect(screen.getByText("Manage Permissions")).toBeInTheDocument();
      expect(screen.queryByText("Manage Roles")).not.toBeInTheDocument();
    });

    it("shows Manage Roles button only when user has USERS_GRANT_ROLES", () => {
      (useAdminPermissions as Mock).mockReturnValue({
        data: { permissions: ["USERS_GRANT_ROLES"] },
      });

      render(
        <UserItem
          user={baseUser}
          onManagePermissions={vi.fn()}
          onManageRoles={vi.fn()}
        />,
      );

      expect(screen.queryByText("Manage Permissions")).not.toBeInTheDocument();
      expect(screen.getByText("Manage Roles")).toBeInTheDocument();
    });

    it("hides both buttons when user has only USERS_VIEW", () => {
      (useAdminPermissions as Mock).mockReturnValue({
        data: { permissions: ["USERS_VIEW"] },
      });

      render(
        <UserItem
          user={baseUser}
          onManagePermissions={vi.fn()}
          onManageRoles={vi.fn()}
        />,
      );

      expect(screen.queryByText("Manage Permissions")).not.toBeInTheDocument();
      expect(screen.queryByText("Manage Roles")).not.toBeInTheDocument();
    });
  });
  ```

- [ ] **Step 2: Run tests — confirm they fail**

  ```bash
  bun run --filter web test src/features/admin/components/user-item/user-item.spec.tsx
  ```

  Expected: FAIL — both buttons appear whenever `USERS_VIEW` is present.

- [ ] **Step 3: Fix `user-item.tsx`**

  Replace the `<List.Item.Actions widthPercentDesktop="30%">` block:

  ```typescript
  <List.Item.Actions widthPercentDesktop="30%">
    <div onClick={(e) => e.stopPropagation()}>
      <PermissionGate requires="USERS_GRANT_PERMISSIONS">
        <button type="button" className={styles.manageButton} onClick={onManagePermissions}>
          <Shield className={styles.manageIcon} />
          {isTablet ? "Permissions" : "Manage Permissions"}
        </button>
      </PermissionGate>
      <PermissionGate requires="USERS_GRANT_ROLES">
        <button type="button" className={styles.manageButton} onClick={onManageRoles}>
          <Users className={styles.manageIcon} />
          {isTablet ? "Roles" : "Manage Roles"}
        </button>
      </PermissionGate>
    </div>
  </List.Item.Actions>
  ```

- [ ] **Step 4: Run tests — confirm they pass**

  ```bash
  bun run --filter web test src/features/admin/components/user-item/user-item.spec.tsx
  ```

  Expected: PASS.

- [ ] **Step 5: Typecheck**

  ```bash
  bun run --filter web typecheck
  ```

  Expected: no errors.

- [ ] **Step 6: Commit**

  ```bash
  git add apps/web/src/features/admin/components/user-item/user-item.tsx \
          apps/web/src/features/admin/components/user-item/user-item.spec.tsx
  git commit -m "fix(web): gate user-item action buttons on correct permissions

  Manage Permissions requires USERS_GRANT_PERMISSIONS (not USERS_VIEW).
  Manage Roles requires USERS_GRANT_ROLES (not USERS_VIEW).
  Each button now has its own PermissionGate so they can be shown independently."
  ```

---

## Stage 4: Gate Admin Contents Screen Action Buttons

**Files:**

- Modify: `apps/web/src/features/admin/screens/admin-contents/admin-contents.screen.tsx`
- Create: `apps/web/src/features/admin/screens/admin-contents/admin-contents.screen.spec.tsx`

**Interfaces:**

- Consumes: `PermissionGate` (new import), `useAdminPermissions` (mocked in tests).
- Produces: no new exports.

**Context:** Two tabs — "topics" and "listings". Topics tab has Add Topic, Edit topic,
and Delete trash icon — all ungated. Listings tab has Add Listing and Edit listing button —
both ungated. All five need gates.

- [ ] **Step 1: Create `admin-contents.screen.spec.tsx` with failing tests**

  ```typescript
  import { vi, type Mock } from "vitest";
  import { render, screen } from "@testing-library/react";
  import { AdminContentsScreen } from "./admin-contents.screen";
  import { useAdminPermissions } from "@/features/admin/hooks/use-admin-permissions";
  import { useApiQuery } from "@sd/core-contracts";
  import { usePathname } from "next/navigation";

  vi.mock("@/features/admin/hooks/use-admin-permissions", () => ({
    useAdminPermissions: vi.fn(),
  }));
  vi.mock("@sd/core-contracts", async (importActual) => {
    const actual = await importActual<typeof import("@sd/core-contracts")>();
    return { ...actual, useApiQuery: vi.fn() };
  });
  vi.mock("next/navigation", () => ({ usePathname: vi.fn() }));
  vi.mock("@/shared/hooks/use-responsive", () => ({
    useResponsive: () => ({ isMobile: false }),
  }));

  describe("AdminContentsScreen — topics tab permission gates", () => {
    beforeEach(() => {
      (usePathname as Mock).mockReturnValue("/admin/contents");
      (useApiQuery as Mock).mockReturnValue({ data: [], refetch: vi.fn() });
    });

    it("hides Add Topic button when user lacks TOPICS_CREATE", () => {
      (useAdminPermissions as Mock).mockReturnValue({
        data: { permissions: ["LISTINGS_VIEW"] },
      });

      render(<AdminContentsScreen />);

      expect(screen.queryByText("Add Topic")).not.toBeInTheDocument();
    });

    it("shows Add Topic button when user has TOPICS_CREATE", () => {
      (useAdminPermissions as Mock).mockReturnValue({
        data: { permissions: ["TOPICS_CREATE"] },
      });

      render(<AdminContentsScreen />);

      expect(screen.getByText("Add Topic")).toBeInTheDocument();
    });
  });
  ```

- [ ] **Step 2: Run tests — confirm they fail**

  ```bash
  bun run --filter web test src/features/admin/screens/admin-contents/admin-contents.screen.spec.tsx
  ```

  Expected: FAIL — Add Topic appears regardless of permissions.

- [ ] **Step 3: Import `PermissionGate` and wrap buttons in `admin-contents.screen.tsx`**

  Add import at top of file:

  ```typescript
  import { PermissionGate } from "@/features/admin/components/permission-gate/permission-gate";
  ```

  Wrap the `<PageHeader actions>` button (topics tab):

  ```typescript
  actions={
    activeTab === "topics" ? (
      <PermissionGate requires="TOPICS_CREATE">
        <Button
          variant="primary"
          size={!isMobile ? "md" : "sm"}
          icon={<Plus size={!isMobile ? 18 : 16} />}
          onClick={handleOpenAddTopic}
        >
          {!isMobile ? "Add Topic" : "Topic"}
        </Button>
      </PermissionGate>
    ) : (
      <PermissionGate requires="LISTINGS_CREATE">
        <Button
          variant="primary"
          size={!isMobile ? "md" : "sm"}
          icon={<Plus size={!isMobile ? 18 : 16} />}
          onClick={handleOpenAddListing}
        >
          {!isMobile ? "Add Listing" : "Listing"}
        </Button>
      </PermissionGate>
    )
  }
  ```

  Wrap the Edit topic button (in `filteredTopics.map`):

  ```typescript
  <PermissionGate requires="TOPICS_EDIT">
    <Button variant="ghost" size="sm" onClick={() => handleOpenEditTopic(topic)}>
      Edit
    </Button>
  </PermissionGate>
  ```

  Wrap the Delete trash icon button (in `filteredTopics.map`):

  ```typescript
  <PermissionGate requires="TOPICS_DELETE">
    <Button
      variant="ghost"
      size="sm"
      icon={<Trash2 size={14} />}
      onClick={() => handleDeleteClick(topic.slug, topic.name)}
    />
  </PermissionGate>
  ```

  Wrap the Edit listing button (in `listings.map`):

  ```typescript
  <PermissionGate requires="LISTINGS_EDIT">
    <Button
      variant="ghost"
      size="sm"
      onClick={() => handleEditListing(listing.id)}
    >
      <Edit size={14} />
    </Button>
  </PermissionGate>
  ```

- [ ] **Step 4: Run tests — confirm they pass**

  ```bash
  bun run --filter web test src/features/admin/screens/admin-contents/admin-contents.screen.spec.tsx
  ```

  Expected: PASS.

- [ ] **Step 5: Typecheck and commit**

  ```bash
  bun run --filter web typecheck
  git add apps/web/src/features/admin/screens/admin-contents/admin-contents.screen.tsx \
          apps/web/src/features/admin/screens/admin-contents/admin-contents.screen.spec.tsx
  git commit -m "fix(web): gate admin contents action buttons by permission

  Hide Add/Edit/Delete topic buttons and Add/Edit listing buttons
  when the user lacks the corresponding CREATE/EDIT/DELETE permission."
  ```

---

## Stage 5: Gate Admin Scholars Screen — Add Scholar Button

**Files:**

- Modify: `apps/web/src/features/admin/screens/admin-scholars/admin-scholars.screen.tsx`
- Create: `apps/web/src/features/admin/screens/admin-scholars/admin-scholars.screen.spec.tsx`

**Interfaces:**

- Consumes: `PermissionGate` (new import), `useAdminPermissions` (mocked in tests).
- Produces: no new exports.

**Context:** The "Add Scholar" button is in `<PageHeader actions>` in the screen.
The per-row "Edit" button lives in the reusable `ScholarItem` component — handled
in Stage 5b. Gate only the Add Scholar button here.

- [ ] **Step 1: Create `admin-scholars.screen.spec.tsx` with failing test**

  ```typescript
  import { vi, type Mock } from "vitest";
  import { render, screen } from "@testing-library/react";
  import { AdminScholarsScreen } from "./admin-scholars.screen";
  import { useAdminPermissions } from "@/features/admin/hooks/use-admin-permissions";
  import { useApiQuery } from "@sd/core-contracts";

  vi.mock("@/features/admin/hooks/use-admin-permissions", () => ({
    useAdminPermissions: vi.fn(),
  }));
  vi.mock("@sd/core-contracts", async (importActual) => {
    const actual = await importActual<typeof import("@sd/core-contracts")>();
    return { ...actual, useApiQuery: vi.fn() };
  });
  vi.mock("@/shared/hooks/use-responsive", () => ({
    useResponsive: () => ({ isMobile: false }),
  }));

  describe("AdminScholarsScreen", () => {
    beforeEach(() => {
      (useApiQuery as Mock).mockReturnValue({
        data: { scholars: [] },
        isFetching: false,
        refetch: vi.fn(),
      });
    });

    it("hides Add Scholar button when user lacks SCHOLARS_CREATE", () => {
      (useAdminPermissions as Mock).mockReturnValue({
        data: { permissions: ["SCHOLARS_VIEW"] },
      });

      render(<AdminScholarsScreen />);

      expect(screen.queryByText("Add Scholar")).not.toBeInTheDocument();
      expect(screen.queryByText("Add")).not.toBeInTheDocument();
    });

    it("shows Add Scholar button when user has SCHOLARS_CREATE", () => {
      (useAdminPermissions as Mock).mockReturnValue({
        data: { permissions: ["SCHOLARS_CREATE"] },
      });

      render(<AdminScholarsScreen />);

      expect(screen.getByText("Add Scholar")).toBeInTheDocument();
    });
  });
  ```

- [ ] **Step 2: Run tests — confirm they fail**

  ```bash
  bun run --filter web test src/features/admin/screens/admin-scholars/admin-scholars.screen.spec.tsx
  ```

  Expected: FAIL — Add Scholar is always visible.

- [ ] **Step 3: Import and wrap in `admin-scholars.screen.tsx`**

  Add import:

  ```typescript
  import { PermissionGate } from "@/features/admin/components/permission-gate/permission-gate";
  ```

  Wrap `<PageHeader actions>` button:

  ```typescript
  actions={
    <PermissionGate requires="SCHOLARS_CREATE">
      <Button
        variant="primary"
        size={!isMobile ? "md" : "sm"}
        icon={<Plus size={!isMobile ? 18 : 16} />}
        onClick={handleOpenAdd}
      >
        {!isMobile ? "Add Scholar" : "Add"}
      </Button>
    </PermissionGate>
  }
  ```

- [ ] **Step 4: Run tests — confirm they pass**

  ```bash
  bun run --filter web test src/features/admin/screens/admin-scholars/admin-scholars.screen.spec.tsx
  ```

  Expected: PASS.

- [ ] **Step 5: Typecheck and commit**

  ```bash
  bun run --filter web typecheck
  git add apps/web/src/features/admin/screens/admin-scholars/admin-scholars.screen.tsx \
          apps/web/src/features/admin/screens/admin-scholars/admin-scholars.screen.spec.tsx
  git commit -m "fix(web): gate Add Scholar button behind SCHOLARS_CREATE"
  ```

---

## Stage 5b: Gate ScholarItem Edit Button

**Files:**

- Modify: `apps/web/src/features/admin/components/ScholarItem/ScholarItem.tsx`
- Create: `apps/web/src/features/admin/components/ScholarItem/scholar-item.spec.tsx`

**Interfaces:**

- Consumes: `PermissionGate` (new import), `useAdminPermissions` (mocked in tests).
- Produces: no change to `ScholarItemProps` — `onEdit` prop remains; it just won't
  be accessible without `SCHOLARS_EDIT`.

**Context:** `ScholarItem` renders a pencil icon edit button unconditionally inside
`<List.Item.Actions>`. Gate it with `<PermissionGate requires="SCHOLARS_EDIT">`.

- [ ] **Step 1: Create `scholar-item.spec.tsx` with failing test**

  ```typescript
  import { vi, type Mock } from "vitest";
  import { render, screen } from "@testing-library/react";
  import { ScholarItem } from "./ScholarItem";
  import { useAdminPermissions } from "@/features/admin/hooks/use-admin-permissions";

  vi.mock("@/features/admin/hooks/use-admin-permissions", () => ({
    useAdminPermissions: vi.fn(),
  }));

  const baseProps = {
    id: "s1",
    name: "Ibn Baz",
    slug: "ibn-baz",
    isKibar: true,
    lectureCount: 12,
    onEdit: vi.fn(),
  };

  describe("ScholarItem", () => {
    it("hides edit button when user lacks SCHOLARS_EDIT", () => {
      (useAdminPermissions as Mock).mockReturnValue({
        data: { permissions: ["SCHOLARS_VIEW"] },
      });

      render(<ScholarItem {...baseProps} />);

      expect(
        screen.queryByRole("button", { name: /edit ibn baz/i }),
      ).not.toBeInTheDocument();
    });

    it("shows edit button when user has SCHOLARS_EDIT", () => {
      (useAdminPermissions as Mock).mockReturnValue({
        data: { permissions: ["SCHOLARS_EDIT"] },
      });

      render(<ScholarItem {...baseProps} />);

      expect(
        screen.getByRole("button", { name: /edit ibn baz/i }),
      ).toBeInTheDocument();
    });
  });
  ```

- [ ] **Step 2: Run tests — confirm they fail**

  ```bash
  bun run --filter web test src/features/admin/components/ScholarItem/scholar-item.spec.tsx
  ```

  Expected: FAIL — edit button always visible.

- [ ] **Step 3: Wrap edit button in `ScholarItem.tsx`**

  Add import:

  ```typescript
  import { PermissionGate } from "@/features/admin/components/permission-gate/permission-gate";
  ```

  Replace `<List.Item.Actions>`:

  ```typescript
  <List.Item.Actions>
    <PermissionGate requires="SCHOLARS_EDIT">
      <Button
        variant="ghost"
        size="icon"
        onClick={onEdit}
        aria-label={`Edit ${name}`}
        icon={<Pencil size={16} />}
      />
    </PermissionGate>
  </List.Item.Actions>
  ```

- [ ] **Step 4: Run tests — confirm they pass**

  ```bash
  bun run --filter web test src/features/admin/components/ScholarItem/scholar-item.spec.tsx
  ```

  Expected: PASS.

- [ ] **Step 5: Typecheck and commit**

  ```bash
  bun run --filter web typecheck
  git add apps/web/src/features/admin/components/ScholarItem/ScholarItem.tsx \
          apps/web/src/features/admin/components/ScholarItem/scholar-item.spec.tsx
  git commit -m "fix(web): gate ScholarItem edit button behind SCHOLARS_EDIT"
  ```

---

## Stage 6: Gate Admin Lectures Screen Action Buttons

**Files:**

- Modify: `apps/web/src/features/admin/screens/admin-lectures/admin-lectures.screen.tsx`
- Create: `apps/web/src/features/admin/screens/admin-lectures/admin-lectures.screen.spec.tsx`

**Interfaces:**

- Consumes: `PermissionGate` (new import), `useAdminPermissions` (mocked in tests).
- Produces: no new exports.

**Context:** Two ungated action points: the "Upload Audio" toggle button in the page
header (requires `MEDIA_UPLOAD`) and per-row "Edit" buttons in both desktop table
and mobile card views (requires `LISTINGS_EDIT`).

- [ ] **Step 1: Create `admin-lectures.screen.spec.tsx` with failing tests**

  ```typescript
  import { vi, type Mock } from "vitest";
  import { render, screen } from "@testing-library/react";
  import { AdminLecturesScreen } from "./admin-lectures.screen";
  import { useAdminPermissions } from "@/features/admin/hooks/use-admin-permissions";
  import { useResponsive } from "@/shared/hooks/use-responsive";

  vi.mock("@/features/admin/hooks/use-admin-permissions", () => ({
    useAdminPermissions: vi.fn(),
  }));
  vi.mock("@/shared/hooks/use-responsive", () => ({
    useResponsive: () => ({ isMobile: false }),
  }));
  vi.mock("../../api/admin-lectures.api", () => ({
    fetchAdminLectures: vi.fn(),
    fetchAdminLectureDetail: vi.fn(),
  }));
  vi.mock("@sd/core-contracts", async (importActual) => {
    const actual = await importActual<typeof import("@sd/core-contracts")>();
    return { ...actual, useApiQuery: vi.fn() };
  });
  vi.mock("../../components/AudioUploader/AudioUploader", () => ({
    AudioUploader: () => null,
  }));
  vi.mock("../../components/LectureEditModal/LectureEditModal", () => ({
    LectureEditModal: () => null,
  }));

  describe("AdminLecturesScreen action button gates", () => {
    beforeEach(() => {
      (useApiQuery as Mock).mockReturnValue({
        data: { items: [], total: 0 },
        isFetching: false,
        refetch: vi.fn(),
      });
    });

    it("hides Upload Audio button when user lacks MEDIA_UPLOAD", () => {
      (useAdminPermissions as Mock).mockReturnValue({
        data: { permissions: ["LISTINGS_VIEW"] },
      });

      render(<AdminLecturesScreen />);

      expect(screen.queryByText("Upload Audio")).not.toBeInTheDocument();
    });

    it("shows Upload Audio button when user has MEDIA_UPLOAD", () => {
      (useAdminPermissions as Mock).mockReturnValue({
        data: { permissions: ["MEDIA_UPLOAD"] },
      });

      render(<AdminLecturesScreen />);

      expect(screen.getByText("Upload Audio")).toBeInTheDocument();
    });

    it("hides Edit buttons when user lacks LISTINGS_EDIT", () => {
      (useAdminPermissions as Mock).mockReturnValue({
        data: { permissions: ["LISTINGS_VIEW"] },
      });

      render(<AdminLecturesScreen />);

      expect(screen.queryAllByText("Edit")).toHaveLength(0);
    });
  });
  ```

- [ ] **Step 2: Run tests — confirm they fail**

  ```bash
  bun run --filter web test src/features/admin/screens/admin-lectures/admin-lectures.screen.spec.tsx
  ```

  Expected: FAIL — Upload Audio and Edit buttons appear regardless of permissions.

- [ ] **Step 3: Import `PermissionGate` and wrap buttons**

  Add import at top of file:

  ```typescript
  import { PermissionGate } from "@/features/admin/components/permission-gate/permission-gate";
  ```

  Wrap the Page Header "Upload Audio" button:

  ```typescript
  actions={
    <PermissionGate requires="MEDIA_UPLOAD">
      <Button
        variant="primary"
        icon={
          isUploaderOpen ? (
            <X size={!isMobile ? 16 : 20} />
          ) : (
            <Plus size={!isMobile ? 16 : 20} />
          )
        }
        onClick={() => dispatch({ isUploaderOpen: !isUploaderOpen })}
        aria-label="Upload Audio Toggle"
      >
        {!isMobile ? (isUploaderOpen ? "Close Uploader" : "Upload Audio") : undefined}
      </Button>
    </PermissionGate>
  }
  ```

  Wrap each Edit button in the desktop table (`<td>`):

  ```typescript
  <td>
    <div className={styles.actions}>
      <PermissionGate requires="LISTINGS_EDIT">
        <button
          type="button"
          className={styles.actionBtn}
          onClick={() => handleEditClick(lecture.id)}
          aria-label="Edit"
        >
          <Edit size={16} /> Edit
        </button>
      </PermissionGate>
    </div>
  </td>
  ```

  Wrap each Edit button in the mobile card (`cardActions`):

  ```typescript
  <div className={styles.cardActions}>
    <PermissionGate requires="LISTINGS_EDIT">
      <button
        type="button"
        className={styles.cardEditBtn}
        onClick={() => handleEditClick(lecture.id)}
        aria-label="Edit lecture"
      >
        <Edit size={14} /> Edit
      </button>
    </PermissionGate>
  </div>
  ```

- [ ] **Step 4: Run tests — confirm they pass**

  ```bash
  bun run --filter web test src/features/admin/screens/admin-lectures/admin-lectures.screen.spec.tsx
  ```

  Expected: PASS.

- [ ] **Step 5: Typecheck and commit**

  ```bash
  bun run --filter web typecheck
  git add apps/web/src/features/admin/screens/admin-lectures/admin-lectures.screen.tsx \
          apps/web/src/features/admin/screens/admin-lectures/admin-lectures.screen.spec.tsx
  git commit -m "fix(web): gate admin lectures action buttons by permission

  Hide Upload Audio behind MEDIA_UPLOAD and Edit behind LISTINGS_EDIT."
  ```

---

## Stage 7: Gate Admin Livestreams Screen Action Buttons

**Files:**

- Modify: `apps/web/src/features/admin/screens/admin-livestreams/admin-livestreams.screen.tsx`
- Create: `apps/web/src/features/admin/screens/admin-livestreams/admin-livestreams.screen.spec.tsx`

**Interfaces:**

- Consumes: `PermissionGate` (new import). Action buttons live inside `SessionRow`
  (desktop) and `SessionCard` (mobile) sub-components in the same file — gate them there.
- Produces: no new exports.

**Context:** Three action buttons:

- "Go Live" / "Live" (scheduled → live): gate on `LIVE_START`
- "End" (live → ended): gate on `LIVE_STOP`
- "Reschedule" (ended → scheduled, desktop `SessionRow` only): gate on `LIVE_EDIT`

- [ ] **Step 1: Create `admin-livestreams.screen.spec.tsx` with failing tests**

  ```typescript
  import { vi, type Mock } from "vitest";
  import { render, screen } from "@testing-library/react";
  import { AdminLivestreamsScreen } from "./admin-livestreams.screen";
  import { useAdminPermissions } from "@/features/admin/hooks/use-admin-permissions";
  import { useApiQuery } from "@sd/core-contracts";
  import { useResponsive } from "@/shared/hooks/use-responsive";

  vi.mock("@/features/admin/hooks/use-admin-permissions", () => ({
    useAdminPermissions: vi.fn(),
  }));
  vi.mock("@sd/core-contracts", async (importActual) => {
    const actual = await importActual<typeof import("@sd/core-contracts")>();
    return { ...actual, useApiQuery: vi.fn() };
  });
  vi.mock("@/shared/hooks/use-responsive", () => ({
    useResponsive: vi.fn(),
  }));
  vi.mock("@/features/admin/api/admin.api", () => ({
    updateLiveSessionStatus: vi.fn(),
  }));

  const scheduledSession = {
    id: "s1",
    status: "scheduled" as const,
    channelDisplayName: "Channel A",
    updatedAt: "2024-01-01T00:00:00.000Z",
    title: "Test Session",
  };

  describe("AdminLivestreamsScreen action button gates", () => {
    beforeEach(() => {
      (useResponsive as Mock).mockReturnValue({ isMobile: false });
      (useApiQuery as Mock).mockImplementation((key: unknown) => {
        const keyStr = JSON.stringify(key);
        if (keyStr.includes("scheduled")) {
          return {
            data: { sessions: [scheduledSession] },
            isFetching: false,
            refetch: vi.fn(),
          };
        }
        return { data: { sessions: [] }, isFetching: false, refetch: vi.fn() };
      });
    });

    it("hides Go Live button when user lacks LIVE_START", () => {
      (useAdminPermissions as Mock).mockReturnValue({
        data: { permissions: ["LIVE_VIEW"] },
      });

      render(<AdminLivestreamsScreen />);

      expect(screen.queryByText("Go Live")).not.toBeInTheDocument();
    });

    it("shows Go Live button when user has LIVE_START", () => {
      (useAdminPermissions as Mock).mockReturnValue({
        data: { permissions: ["LIVE_START"] },
      });

      render(<AdminLivestreamsScreen />);

      expect(screen.getByText("Go Live")).toBeInTheDocument();
    });
  });
  ```

- [ ] **Step 2: Run tests — confirm they fail**

  ```bash
  bun run --filter web test src/features/admin/screens/admin-livestreams/admin-livestreams.screen.spec.tsx
  ```

  Expected: FAIL — Go Live appears even without `LIVE_START`.

- [ ] **Step 3: Import `PermissionGate` and wrap buttons in both sub-components**

  Add import at top of file:

  ```typescript
  import { PermissionGate } from "@/features/admin/components/permission-gate/permission-gate";
  ```

  In `SessionRow` `<div className={styles.actionButtons}>`:

  ```typescript
  <div className={styles.actionButtons}>
    {session.status === "scheduled" && (
      <PermissionGate requires="LIVE_START">
        <Button variant="primary" onClick={() => onStatusChange(session.id, "live")}>
          Go Live
        </Button>
      </PermissionGate>
    )}
    {session.status === "live" && (
      <PermissionGate requires="LIVE_STOP">
        <Button variant="danger" onClick={() => onStatusChange(session.id, "ended")}>
          End
        </Button>
      </PermissionGate>
    )}
    {session.status === "ended" && (
      <PermissionGate requires="LIVE_EDIT">
        <Button variant="outline" onClick={() => onStatusChange(session.id, "scheduled")}>
          Reschedule
        </Button>
      </PermissionGate>
    )}
  </div>
  ```

  In `SessionCard` `<div className={styles.actionButtons}>`:

  ```typescript
  <div className={styles.actionButtons}>
    {session.status === "scheduled" && (
      <PermissionGate requires="LIVE_START">
        <Button variant="primary" onClick={() => onStatusChange(session.id, "live")}>
          Live
        </Button>
      </PermissionGate>
    )}
    {session.status === "live" && (
      <PermissionGate requires="LIVE_STOP">
        <Button variant="danger" onClick={() => onStatusChange(session.id, "ended")}>
          End
        </Button>
      </PermissionGate>
    )}
  </div>
  ```

- [ ] **Step 4: Run tests — confirm they pass**

  ```bash
  bun run --filter web test src/features/admin/screens/admin-livestreams/admin-livestreams.screen.spec.tsx
  ```

  Expected: PASS.

- [ ] **Step 5: Typecheck and commit**

  ```bash
  bun run --filter web typecheck
  git add apps/web/src/features/admin/screens/admin-livestreams/admin-livestreams.screen.tsx \
          apps/web/src/features/admin/screens/admin-livestreams/admin-livestreams.screen.spec.tsx
  git commit -m "fix(web): gate admin livestreams action buttons by permission

  Hide Go Live behind LIVE_START, End behind LIVE_STOP, Reschedule behind LIVE_EDIT."
  ```

---

## Stage 8: Gate Admin Permissions Screen Grant/Revoke Actions

**Files:**

- Modify: `apps/web/src/features/admin/screens/admin-permissions/admin-permissions.screen.tsx`
- Create: `apps/web/src/features/admin/screens/admin-permissions/admin-permissions.screen.spec.tsx`

**Interfaces:**

- Consumes: `PermissionGate` (new import).
- Produces: no new exports.

**Context:** `AdminPermissionsScreen` exposes a user-id lookup form and grant/revoke
buttons with no permission gate. Wrap the entire interactive body (everything below
`<PageHeader>`) in `<PermissionGate requires="USERS_GRANT_PERMISSIONS">`.

- [ ] **Step 1: Create failing test**

  ```typescript
  import { vi, type Mock } from "vitest";
  import { render, screen } from "@testing-library/react";
  import { AdminPermissionsScreen } from "./admin-permissions.screen";
  import { useAdminPermissions } from "@/features/admin/hooks/use-admin-permissions";

  vi.mock("@/features/admin/hooks/use-admin-permissions", () => ({
    useAdminPermissions: vi.fn(),
  }));
  vi.mock("@/shared/hooks/use-responsive", () => ({
    useResponsive: () => ({ isMobile: false }),
  }));
  vi.mock("@/features/admin/api/admin.api", () => ({
    fetchUserPermissions: vi.fn(),
    grantPermission: vi.fn(),
    revokePermission: vi.fn(),
  }));
  vi.mock("@/shared/components/RevokePermissionConfirmModal", () => ({
    RevokePermissionConfirmModal: () => null,
  }));

  describe("AdminPermissionsScreen", () => {
    it("hides the lookup form when user lacks USERS_GRANT_PERMISSIONS", () => {
      (useAdminPermissions as Mock).mockReturnValue({
        data: { permissions: ["USERS_VIEW"] },
      });

      render(<AdminPermissionsScreen />);

      expect(screen.queryByPlaceholderText(/user id/i)).not.toBeInTheDocument();
    });

    it("shows the lookup form when user has USERS_GRANT_PERMISSIONS", () => {
      (useAdminPermissions as Mock).mockReturnValue({
        data: { permissions: ["USERS_GRANT_PERMISSIONS"] },
      });

      render(<AdminPermissionsScreen />);

      expect(screen.getByPlaceholderText(/user id/i)).toBeInTheDocument();
    });
  });
  ```

- [ ] **Step 2: Run tests — confirm they fail**

  ```bash
  bun run --filter web test src/features/admin/screens/admin-permissions/admin-permissions.screen.spec.tsx
  ```

  Expected: FAIL — lookup form always visible.

- [ ] **Step 3: Add `PermissionGate` to `admin-permissions.screen.tsx`**

  Add import:

  ```typescript
  import { PermissionGate } from "@/features/admin/components/permission-gate/permission-gate";
  ```

  Wrap everything below `<PageHeader>` (user ID input, lookup button, permissions grid,
  grant/revoke buttons) with:

  ```typescript
  <PermissionGate requires="USERS_GRANT_PERMISSIONS">
    {/* user ID input, lookup button, permissions grid, grant/revoke buttons */}
  </PermissionGate>
  ```

  The `<PageHeader>` and `<RevokePermissionConfirmModal>` stay outside the gate.

- [ ] **Step 4: Run tests — confirm they pass**

  ```bash
  bun run --filter web test src/features/admin/screens/admin-permissions/admin-permissions.screen.spec.tsx
  ```

  Expected: PASS.

- [ ] **Step 5: Typecheck and commit**

  ```bash
  bun run --filter web typecheck
  git add apps/web/src/features/admin/screens/admin-permissions/admin-permissions.screen.tsx \
          apps/web/src/features/admin/screens/admin-permissions/admin-permissions.screen.spec.tsx
  git commit -m "fix(web): gate admin permissions screen behind USERS_GRANT_PERMISSIONS

  Hide the user lookup form and all grant/revoke buttons when the current admin
  user lacks USERS_GRANT_PERMISSIONS."
  ```

---

## Stage 9: Backend — Enforce LIVE_START and LIVE_STOP Granularly

**Files:**

- Modify: `apps/api/src/modules/live/admin-live.controller.ts`
- Create: `apps/api/src/modules/live/admin-live-status.integration.spec.ts`

**Interfaces:**

- Consumes: `Permissions` constant from `@sd/core-contracts`, `LiveService`
  (injected as before), `@RequiresPermission` decorator.
- Produces: three new route methods — `goLive`, `endSession`, `rescheduleSession`.
  The `updateSessionStatus` handler is removed.

**Context:** The current `PATCH sessions/:id/status` uses a single
`@RequiresPermission(Permissions.LIVE_EDIT)` for all transitions. The
`AdminPermissionGuard` reads metadata set by the decorator and has no access to the
request body — body-based permission switching is impossible without refactoring the
guard. The correct NestJS pattern is to split into three action-based routes, each
with its own decorator:

- `PATCH sessions/:id/go-live` → requires `LIVE_START`
- `PATCH sessions/:id/end` → requires `LIVE_STOP`
- `PATCH sessions/:id/reschedule` → requires `LIVE_EDIT`

No body is needed — the target status is implied by the route. The existing
`UpdateLiveSessionStatusDto` file stays intact but the controller no longer imports it.

The frontend `updateLiveSessionStatus(id, status)` call must be updated to map the
status string to the correct action URL before this stage is committed.

- [ ] **Step 1: Create `admin-live-status.integration.spec.ts` with failing tests**

  ```typescript
  import { vi } from "vitest";
  import { APP_GUARD } from "@nestjs/core";
  import { Test } from "@nestjs/testing";
  import { FastifyAdapter } from "@nestjs/platform-fastify";
  import type { NestFastifyApplication } from "@nestjs/platform-fastify";
  import request from "supertest";
  import { AuthGuard } from "../auth/auth.guard";
  import { AdminPermissionGuard } from "../../shared/guards/admin-permission.guard";
  import { AdminLiveController } from "./admin-live.controller";
  import { LiveService } from "./live.service";
  import { PrismaService } from "../../shared/db/prisma.service";

  const mockAuth = { api: { getSession: vi.fn() } };
  vi.mock("../auth/auth.instance", () => ({ getAuth: () => mockAuth }));

  const mockPrisma = {
    userRoleAssignment: { findMany: vi.fn().mockResolvedValue([]) },
    userPermission: { findUnique: vi.fn() },
  };

  const mockLiveService = {
    updateSessionStatus: vi.fn().mockResolvedValue({}),
  };

  const sessionUser = { id: "user-1", email: "admin@example.com" };

  describe("AdminLiveController — granular LIVE_START/LIVE_STOP enforcement", () => {
    let app: NestFastifyApplication;

    beforeAll(async () => {
      const module = await Test.createTestingModule({
        controllers: [AdminLiveController],
        providers: [
          { provide: APP_GUARD, useClass: AuthGuard },
          { provide: APP_GUARD, useClass: AdminPermissionGuard },
          { provide: LiveService, useValue: mockLiveService },
          { provide: PrismaService, useValue: mockPrisma },
        ],
      }).compile();

      app = module.createNestApplication<NestFastifyApplication>(new FastifyAdapter());
      await app.init();
      await app.getHttpAdapter().getInstance().ready();
    });

    beforeEach(() => {
      mockAuth.api.getSession.mockReset();
      mockPrisma.userPermission.findUnique.mockReset();
      mockLiveService.updateSessionStatus.mockClear();
    });

    afterAll(() => app.close());

    it("PATCH /go-live returns 403 when user has LIVE_EDIT but not LIVE_START", async () => {
      mockAuth.api.getSession.mockResolvedValue({ user: sessionUser });
      mockPrisma.userPermission.findUnique.mockImplementation(
        ({ where }: { where: { userId_permission: { permission: string } } }) =>
          where.userId_permission.permission === "LIVE_EDIT" ? { permission: "LIVE_EDIT" } : null,
      );

      await request(app.getHttpServer())
        .patch("/admin/live/sessions/session-1/go-live")
        .expect(403);
    });

    it("PATCH /go-live returns 200 and calls updateSessionStatus(id, live)", async () => {
      mockAuth.api.getSession.mockResolvedValue({ user: sessionUser });
      mockPrisma.userPermission.findUnique.mockResolvedValue({ permission: "LIVE_START" });

      await request(app.getHttpServer())
        .patch("/admin/live/sessions/session-1/go-live")
        .expect(200);

      expect(mockLiveService.updateSessionStatus).toHaveBeenCalledWith("session-1", "live");
    });

    it("PATCH /end returns 403 when user has LIVE_EDIT but not LIVE_STOP", async () => {
      mockAuth.api.getSession.mockResolvedValue({ user: sessionUser });
      mockPrisma.userPermission.findUnique.mockImplementation(
        ({ where }: { where: { userId_permission: { permission: string } } }) =>
          where.userId_permission.permission === "LIVE_EDIT" ? { permission: "LIVE_EDIT" } : null,
      );

      await request(app.getHttpServer()).patch("/admin/live/sessions/session-1/end").expect(403);
    });

    it("PATCH /end returns 200 and calls updateSessionStatus(id, ended)", async () => {
      mockAuth.api.getSession.mockResolvedValue({ user: sessionUser });
      mockPrisma.userPermission.findUnique.mockResolvedValue({ permission: "LIVE_STOP" });

      await request(app.getHttpServer()).patch("/admin/live/sessions/session-1/end").expect(200);

      expect(mockLiveService.updateSessionStatus).toHaveBeenCalledWith("session-1", "ended");
    });

    it("PATCH /reschedule returns 200 and calls updateSessionStatus(id, scheduled)", async () => {
      mockAuth.api.getSession.mockResolvedValue({ user: sessionUser });
      mockPrisma.userPermission.findUnique.mockResolvedValue({ permission: "LIVE_EDIT" });

      await request(app.getHttpServer())
        .patch("/admin/live/sessions/session-1/reschedule")
        .expect(200);

      expect(mockLiveService.updateSessionStatus).toHaveBeenCalledWith("session-1", "scheduled");
    });
  });
  ```

- [ ] **Step 2: Run tests — confirm they fail**

  ```bash
  bun run --filter api test -- src/modules/live/admin-live-status.integration.spec.ts
  ```

  Expected: FAIL — routes `go-live`, `end`, `reschedule` do not exist.

- [ ] **Step 3: Replace `updateSessionStatus` endpoint in `admin-live.controller.ts`**

  Remove:

  ```typescript
  @Patch('sessions/:id/status')
  @RequiresPermission(Permissions.LIVE_EDIT)
  @ApiOperation({ summary: 'Update a live session status' })
  updateSessionStatus(@Param('id') id: string, @Body() body: UpdateLiveSessionStatusDto) {
    return this.service.updateSessionStatus(id, body.status);
  }
  ```

  Add after the `updateSession` method:

  ```typescript
  @Patch('sessions/:id/go-live')
  @RequiresPermission(Permissions.LIVE_START)
  @ApiOperation({ summary: 'Go live — transition session to live status' })
  goLive(@Param('id') id: string): Promise<unknown> {
    return this.service.updateSessionStatus(id, 'live');
  }

  @Patch('sessions/:id/end')
  @RequiresPermission(Permissions.LIVE_STOP)
  @ApiOperation({ summary: 'End live session — transition to ended status' })
  endSession(@Param('id') id: string): Promise<unknown> {
    return this.service.updateSessionStatus(id, 'ended');
  }

  @Patch('sessions/:id/reschedule')
  @RequiresPermission(Permissions.LIVE_EDIT)
  @ApiOperation({ summary: 'Reschedule — transition session back to scheduled' })
  rescheduleSession(@Param('id') id: string): Promise<unknown> {
    return this.service.updateSessionStatus(id, 'scheduled');
  }
  ```

  Remove the `UpdateLiveSessionStatusDto` import from the controller import list
  (keep the DTO file intact).

- [ ] **Step 4: Update `updateLiveSessionStatus` in the frontend API module**

  Open `apps/web/src/features/admin/api/admin.api.ts`. Find and update
  `updateLiveSessionStatus` to map status → action URL:

  ```typescript
  export async function updateLiveSessionStatus(id: string, status: string): Promise<void> {
    const actionMap: Record<string, string> = {
      live: "go-live",
      ended: "end",
      scheduled: "reschedule",
    };
    const action = actionMap[status];
    if (!action) throw new Error(`Unknown live session status: ${status}`);
    await httpClient<void>({
      url: `${endpoints.admin.live.sessions}/${id}/${action}`,
      method: "PATCH",
    });
  }
  ```

  Check `@sd/core-contracts` for the actual value of `endpoints.admin.live.sessions`
  and adjust the URL string accordingly.

- [ ] **Step 5: Run new integration tests — confirm they pass**

  ```bash
  bun run --filter api test -- src/modules/live/admin-live-status.integration.spec.ts
  ```

  Expected: PASS.

- [ ] **Step 6: Run full API test suite — confirm no regressions**

  ```bash
  bun run --filter api test
  ```

  Expected: PASS.

- [ ] **Step 7: Typecheck both apps**

  ```bash
  bun run --filter api typecheck
  bun run --filter web typecheck
  ```

  Expected: no errors.

- [ ] **Step 8: Commit**

  ```bash
  git add apps/api/src/modules/live/admin-live.controller.ts \
          apps/api/src/modules/live/admin-live-status.integration.spec.ts \
          apps/web/src/features/admin/api/admin.api.ts
  git commit -m "fix(api): enforce LIVE_START/LIVE_STOP granularly in live status endpoint

  Replace PATCH sessions/:id/status (LIVE_EDIT for all transitions) with three
  action-based endpoints each gated on the correct permission:
    PATCH sessions/:id/go-live    → LIVE_START
    PATCH sessions/:id/end        → LIVE_STOP
    PATCH sessions/:id/reschedule → LIVE_EDIT
  Update frontend updateLiveSessionStatus() to call the correct action URL."
  ```

---

## Final Verification

Run from repo root after all stages are committed:

- [ ] `bun run typecheck` — passes for all workspaces.
- [ ] `bun run --filter web test` — all admin screen/component tests pass; no regressions.
- [ ] `bun run --filter api test` — all permission and live tests pass; new granular enforcement tests pass.
- [ ] `bun run lint` — no new violations.
- [ ] `bun run build` — all affected apps and packages build successfully.

## Plan Completion

- Every stage is committed with passing tests.
- Final verification commands all pass.
- Archival: move this file to `.agents/plans/completed/`.
