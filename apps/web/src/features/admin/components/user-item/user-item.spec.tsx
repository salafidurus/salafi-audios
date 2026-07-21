import { describe, it, expect, vi, type Mock } from "bun:test";
import { render, screen } from "@testing-library/react";
import { UserItem } from "./user-item";
import { useAdminPermissions } from "@sd/domain-permissions";

vi.mock("@sd/domain-permissions", () => ({
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
    (useAdminPermissions as Mock<any>).mockReturnValue({
      data: { permissions: ["USERS_GRANT_PERMISSIONS"] },
    });

    render(<UserItem user={baseUser} onManagePermissions={vi.fn()} onManageRoles={vi.fn()} />);

    expect(screen.getByRole("button", { name: "Manage Permissions" })).toBeInTheDocument();
    expect(screen.queryByRole("button", { name: "Manage Roles" })).not.toBeInTheDocument();
  });

  it("shows Manage Roles button only when user has USERS_GRANT_ROLES", () => {
    (useAdminPermissions as Mock<any>).mockReturnValue({
      data: { permissions: ["USERS_GRANT_ROLES"] },
    });

    render(<UserItem user={baseUser} onManagePermissions={vi.fn()} onManageRoles={vi.fn()} />);

    expect(screen.queryByRole("button", { name: "Manage Permissions" })).not.toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Manage Roles" })).toBeInTheDocument();
  });

  it("hides both buttons when user has only USERS_VIEW", () => {
    (useAdminPermissions as Mock<any>).mockReturnValue({
      data: { permissions: ["USERS_VIEW"] },
    });

    render(<UserItem user={baseUser} onManagePermissions={vi.fn()} onManageRoles={vi.fn()} />);

    expect(screen.queryByRole("button", { name: "Manage Permissions" })).not.toBeInTheDocument();
    expect(screen.queryByRole("button", { name: "Manage Roles" })).not.toBeInTheDocument();
  });
});
