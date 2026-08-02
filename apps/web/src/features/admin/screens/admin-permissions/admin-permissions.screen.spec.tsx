import { createMongoAbility } from "@casl/ability";
import { useAbility } from "@sd/domain-account";
import { render, screen } from "@testing-library/react";
import { describe, it, expect, vi, type Mock } from "bun:test";

import { AdminPermissionsScreen } from "./admin-permissions.screen";

vi.mock("@sd/domain-account", () => ({
  useAbility: vi.fn(),
}));
vi.mock("@/shared/hooks/use-responsive", () => ({
  useResponsive: () => ({ isMobile: false }),
}));
vi.mock("@/features/admin/api/admin.api", () => ({
  fetchUserPermissions: vi.fn(),
  grantPermission: vi.fn(),
  revokePermission: vi.fn(),
}));
vi.mock("@/features/admin/components/RevokePermissionConfirmModal", () => ({
  RevokePermissionConfirmModal: () => null,
}));

describe("AdminPermissionsScreen", () => {
  it("hides the lookup form when the user cannot grant permissions", () => {
    (useAbility as Mock<any>).mockReturnValue({
      ability: createMongoAbility([{ action: "read", subject: "User" }]),
    });

    render(<AdminPermissionsScreen />);

    expect(screen.queryByPlaceholderText(/user id/i)).not.toBeInTheDocument();
  });

  it("shows the lookup form when the user can grant permissions", () => {
    (useAbility as Mock<any>).mockReturnValue({
      ability: createMongoAbility([{ action: "grant", subject: "UserPermission" }]),
    });

    render(<AdminPermissionsScreen />);

    expect(screen.getByPlaceholderText(/user id/i)).toBeInTheDocument();
  });
});
