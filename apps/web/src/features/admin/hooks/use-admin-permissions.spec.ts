import { vi } from "bun:test";
import { useAdminPermissions } from "./use-admin-permissions";
import { useApiQuery } from "@sd/core-contracts";
import { useAuth } from "@/core/auth";

vi.mock("@sd/core-contracts", () => ({
  useApiQuery: vi.fn<any>(),
  queryKeys: {
    admin: {
      permissions: {
        me: () => ["admin", "permissions", "me"],
      },
    },
  },
  httpClient: vi.fn<any>(),
  endpoints: {
    admin: {
      permissions: {
        me: "/api/admin/permissions/me",
      },
    },
  },
}));

vi.mock("@/core/auth", () => ({
  useAuth: vi.fn<() => { isAuthenticated: boolean }>(() => ({ isAuthenticated: true })),
}));

describe("useAdminPermissions", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("calls useApiQuery with enabled: true when authenticated by default", () => {
    (useAuth as any).mockReturnValue({ isAuthenticated: true } as any);
    useAdminPermissions();
    expect(useApiQuery).toHaveBeenCalledWith(["admin", "permissions", "me"], expect.any(Function), {
      enabled: true,
    });
  });

  it("calls useApiQuery with enabled: false when unauthenticated", () => {
    (useAuth as any).mockReturnValue({ isAuthenticated: false } as any);
    useAdminPermissions();
    expect(useApiQuery).toHaveBeenCalledWith(["admin", "permissions", "me"], expect.any(Function), {
      enabled: false,
    });
  });

  it("respects caller-provided options while merging enabled flag", () => {
    (useAuth as any).mockReturnValue({ isAuthenticated: true } as any);
    const options = { staleTime: 5000 };
    useAdminPermissions(options as any);
    expect(useApiQuery).toHaveBeenCalledWith(["admin", "permissions", "me"], expect.any(Function), {
      enabled: true,
      staleTime: 5000,
    });
  });

  it("retains enabled: false if caller explicitly disables it even when authenticated", () => {
    (useAuth as any).mockReturnValue({ isAuthenticated: true } as any);
    const options = { enabled: false };
    useAdminPermissions(options as any);
    expect(useApiQuery).toHaveBeenCalledWith(["admin", "permissions", "me"], expect.any(Function), {
      enabled: false,
    });
  });
});
