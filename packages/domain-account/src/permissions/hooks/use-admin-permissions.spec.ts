import { describe, it, expect, vi, beforeEach } from "bun:test";

import { useAccountProfile } from "../../account.api";
import { useAdminPermissions } from "./use-admin-permissions";

vi.mock("../../account.api", () => ({
  useAccountProfile: vi.fn(),
}));

describe("useAdminPermissions", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("disables profile query when isAuthenticated is false", () => {
    (useAccountProfile as any).mockReturnValue({
      data: undefined,
      isLoading: false,
      error: null,
    });

    const result = useAdminPermissions({ isAuthenticated: false });

    expect(useAccountProfile).toHaveBeenCalledWith({ enabled: false });
    expect(result.data).toBeUndefined();
    expect(result.isLoading).toBe(false);
  });

  it("enables profile query when isAuthenticated is true", () => {
    (useAccountProfile as any).mockReturnValue({
      data: { permissions: ["SCHOLARS_VIEW"], roles: ["admin"] },
      isLoading: false,
      error: null,
    });

    const result = useAdminPermissions({ isAuthenticated: true });

    expect(useAccountProfile).toHaveBeenCalledWith({ enabled: true });
    expect(result.data).toEqual({
      permissions: ["SCHOLARS_VIEW"],
      roles: ["admin"],
    });
  });
});
