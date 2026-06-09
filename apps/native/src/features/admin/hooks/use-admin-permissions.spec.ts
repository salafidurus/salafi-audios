import { useAdminPermissions } from "./use-admin-permissions";
import { useApiQuery } from "@sd/core-contracts";

jest.mock("@sd/core-contracts", () => ({
  useApiQuery: jest.fn(),
  httpClient: jest.fn(),
  endpoints: {
    admin: { permissions: { me: "/admin/permissions/me" } },
  },
}));

const mockUseApiQuery = useApiQuery as jest.Mock;

describe("useAdminPermissions", () => {
  it("returns hasAnyPermission=false when permissions list is empty", () => {
    mockUseApiQuery.mockReturnValue({
      data: { permissions: [] },
      isLoading: false,
    });

    const result = useAdminPermissions();
    expect(result.hasAnyPermission).toBe(false);
  });

  it("returns hasAnyPermission=true when user has at least one permission", () => {
    mockUseApiQuery.mockReturnValue({
      data: {
        permissions: [{ permission: "manage:content", grantedAt: "2026-01-01" }],
      },
      isLoading: false,
    });

    const result = useAdminPermissions();
    expect(result.hasAnyPermission).toBe(true);
    expect(result.hasPermission("manage:content")).toBe(true);
    expect(result.hasPermission("manage:admin")).toBe(false);
  });
});
