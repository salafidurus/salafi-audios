import { vi } from "vitest";
import { useAdminPermissions } from "./use-admin-permissions";
import { useApiQuery } from "@sd/core-contracts";
import { useAuth } from "@/core/auth";

vi.mock("@sd/core-contracts", () => ({
  useApiQuery: vi.fn(),
  queryKeys: {
    admin: {
      permissions: {
        me: () => ["admin", "permissions", "me"],
      },
    },
  },
  httpClient: vi.fn(),
  endpoints: {
    admin: {
      permissions: {
        me: "/api/admin/permissions/me",
      },
    },
  },
}));

vi.mock("@/core/auth", () => ({
  useAuth: vi.fn(() => ({ isAuthenticated: true })),
}));

describe("useAdminPermissions", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("calls useApiQuery with enabled: true when authenticated by default", () => {
    vi.mocked(useAuth).mockReturnValue({ isAuthenticated: true } as any);
    useAdminPermissions();
    expect(useApiQuery).toHaveBeenCalledWith(
      ["admin", "permissions", "me"],
      expect.any(Function),
      { enabled: true }
    );
  });

  it("calls useApiQuery with enabled: false when unauthenticated", () => {
    vi.mocked(useAuth).mockReturnValue({ isAuthenticated: false } as any);
    useAdminPermissions();
    expect(useApiQuery).toHaveBeenCalledWith(
      ["admin", "permissions", "me"],
      expect.any(Function),
      { enabled: false }
    );
  });

  it("respects caller-provided options while merging enabled flag", () => {
    vi.mocked(useAuth).mockReturnValue({ isAuthenticated: true } as any);
    const options = { staleTime: 5000 };
    useAdminPermissions(options as any);
    expect(useApiQuery).toHaveBeenCalledWith(
      ["admin", "permissions", "me"],
      expect.any(Function),
      { enabled: true, staleTime: 5000 }
    );
  });

  it("retains enabled: false if caller explicitly disables it even when authenticated", () => {
    vi.mocked(useAuth).mockReturnValue({ isAuthenticated: true } as any);
    const options = { enabled: false };
    useAdminPermissions(options as any);
    expect(useApiQuery).toHaveBeenCalledWith(
      ["admin", "permissions", "me"],
      expect.any(Function),
      { enabled: false }
    );
  });
});
