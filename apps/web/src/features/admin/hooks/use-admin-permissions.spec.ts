import { vi } from "vitest";
import { useAdminPermissions } from "./use-admin-permissions";
import { useApiQuery } from "@sd/core-contracts";

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

describe("useAdminPermissions", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("calls useApiQuery without options by default", () => {
    useAdminPermissions();
    expect(useApiQuery).toHaveBeenCalledWith(
      ["admin", "permissions", "me"],
      expect.any(Function),
      undefined
    );
  });

  it("passes options to useApiQuery", () => {
    const options = { enabled: false, staleTime: 5000 };
    useAdminPermissions(options as any);
    expect(useApiQuery).toHaveBeenCalledWith(
      ["admin", "permissions", "me"],
      expect.any(Function),
      options
    );
  });
});
