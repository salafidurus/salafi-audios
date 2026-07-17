import { vi, type Mock } from "bun:test";
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

    render(<UserItem user={baseUser} onManagePermissions={vi.fn()} onManageRoles={vi.fn()} />);

    expect(screen.getByText("Manage Permissions")).toBeInTheDocument();
    expect(screen.queryByText("Manage Roles")).not.toBeInTheDocument();
  });

  it("shows Manage Roles button only when user has USERS_GRANT_ROLES", () => {
    (useAdminPermissions as Mock).mockReturnValue({
      data: { permissions: ["USERS_GRANT_ROLES"] },
    });

    render(<UserItem user={baseUser} onManagePermissions={vi.fn()} onManageRoles={vi.fn()} />);

    expect(screen.queryByText("Manage Permissions")).not.toBeInTheDocument();
    expect(screen.getByText("Manage Roles")).toBeInTheDocument();
  });

  it("hides both buttons when user has only USERS_VIEW", () => {
    (useAdminPermissions as Mock).mockReturnValue({
      data: { permissions: ["USERS_VIEW"] },
    });

    render(<UserItem user={baseUser} onManagePermissions={vi.fn()} onManageRoles={vi.fn()} />);

    expect(screen.queryByText("Manage Permissions")).not.toBeInTheDocument();
    expect(screen.queryByText("Manage Roles")).not.toBeInTheDocument();
  });
});
