import { describe, it, expect, vi, type Mock } from "bun:test";
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
    (useAdminPermissions as Mock<any>).mockReturnValue({
      data: { permissions: ["USERS_VIEW"] },
    });

    render(<AdminPermissionsScreen />);

    expect(screen.queryByPlaceholderText(/user id/i)).not.toBeInTheDocument();
  });

  it("shows the lookup form when user has USERS_GRANT_PERMISSIONS", () => {
    (useAdminPermissions as Mock<any>).mockReturnValue({
      data: { permissions: ["USERS_GRANT_PERMISSIONS"] },
    });

    render(<AdminPermissionsScreen />);

    expect(screen.getByPlaceholderText(/user id/i)).toBeInTheDocument();
  });
});
