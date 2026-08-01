import { useAdminPermissions as useSharedAdminPermissions } from "@sd/domain-account";

import { useAdminPermissions } from "./use-admin-permissions";

jest.mock("@sd/domain-account", () => ({
  useAdminPermissions: jest.fn(),
}));

const mockUseSharedAdminPermissions = useSharedAdminPermissions as jest.Mock;

describe("useAdminPermissions", () => {
  it("returns hasAnyPermission=false when permissions and roles are empty", () => {
    mockUseSharedAdminPermissions.mockReturnValue({
      data: { permissions: [], roles: [] },
      isLoading: false,
    });

    const result = useAdminPermissions();
    expect(result.hasAnyPermission).toBe(false);
  });

  it("returns hasAnyPermission=true when user has at least one permission", () => {
    mockUseSharedAdminPermissions.mockReturnValue({
      data: { permissions: ["manage:content"], roles: [] },
      isLoading: false,
    });

    const result = useAdminPermissions();
    expect(result.hasAnyPermission).toBe(true);
    expect(result.hasPermission("manage:content")).toBe(true);
    expect(result.hasPermission("manage:admin")).toBe(false);
  });

  it("returns hasAnyPermission=true when user has an admin role but no explicit permissions", () => {
    mockUseSharedAdminPermissions.mockReturnValue({
      data: { permissions: [], roles: ["admin"] },
      isLoading: false,
    });

    const result = useAdminPermissions();
    expect(result.hasAnyPermission).toBe(true);
    expect(result.hasPermission("manage:content")).toBe(true);
  });

  it("returns hasAnyPermission=true when user has a superadmin role but no explicit permissions", () => {
    mockUseSharedAdminPermissions.mockReturnValue({
      data: { permissions: [], roles: ["superadmin"] },
      isLoading: false,
    });

    const result = useAdminPermissions();
    expect(result.hasAnyPermission).toBe(true);
  });

  it("returns hasAnyPermission=false for a non-admin role", () => {
    mockUseSharedAdminPermissions.mockReturnValue({
      data: { permissions: [], roles: ["listener"] },
      isLoading: false,
    });

    const result = useAdminPermissions();
    expect(result.hasAnyPermission).toBe(false);
    expect(result.hasPermission("manage:content")).toBe(false);
  });

  it("returns hasAnyPermission=false and isLoading=true while loading with no data", () => {
    mockUseSharedAdminPermissions.mockReturnValue({
      data: undefined,
      isLoading: true,
    });

    const result = useAdminPermissions();
    expect(result.hasAnyPermission).toBe(false);
    expect(result.isLoading).toBe(true);
  });
});
