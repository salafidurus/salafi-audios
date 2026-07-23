import { describe, it, expect, beforeEach, vi } from "bun:test";
import { useAdminPermissions } from "./use-admin-permissions";
import { useAccountProfile } from "@sd/domain-account";

vi.mock("@sd/domain-account", () => {
  const actual = vi.importActual("@sd/domain-account");
  return {
    ...actual,
    useAccountProfile: vi.fn<any>(),
  };
});

describe("useAdminPermissions", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("returns permissions when authenticated", () => {
    (useAccountProfile as any).mockReturnValue({
      data: { permissions: ["USERS_VIEW"], roles: ["admin"] },
      isLoading: false,
    });

    const result = useAdminPermissions({ isAuthenticated: true });
    expect(result.data?.permissions).toEqual(["USERS_VIEW"]);
  });

  it("returns undefined data when unauthenticated", () => {
    (useAccountProfile as any).mockReturnValue({
      data: { permissions: ["USERS_VIEW"], roles: ["admin"] },
      isLoading: false,
    });

    const result = useAdminPermissions({ isAuthenticated: false });
    expect(result.data).toBeUndefined();
  });
});
