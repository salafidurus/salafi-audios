import { useAdminPermissions } from "./use-admin-permissions";
import { useAccountProfile } from "@sd/domain-account";

jest.mock("@sd/domain-account", () => ({
  useAccountProfile: jest.fn(),
}));

const mockUseAccountProfile = useAccountProfile as jest.Mock;

describe("useAdminPermissions", () => {
  it("returns hasAnyPermission=false when permissions list is empty", () => {
    mockUseAccountProfile.mockReturnValue({
      data: { permissions: [] },
      isLoading: false,
    });

    const result = useAdminPermissions();
    expect(result.hasAnyPermission).toBe(false);
  });

  it("returns hasAnyPermission=true when user has at least one permission", () => {
    mockUseAccountProfile.mockReturnValue({
      data: {
        permissions: ["manage:content"],
      },
      isLoading: false,
    });

    const result = useAdminPermissions();
    expect(result.hasAnyPermission).toBe(true);
    expect(result.hasPermission("manage:content")).toBe(true);
    expect(result.hasPermission("manage:admin")).toBe(false);
  });
});
