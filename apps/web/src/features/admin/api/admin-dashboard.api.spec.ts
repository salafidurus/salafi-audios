import { httpClient } from "@sd/core-contracts";
import { describe, expect, it, vi } from "bun:test";

import { fetchAdminDashboard } from "./admin-dashboard.api";

const mockHttpClient = vi.fn();

vi.mock("@sd/core-contracts", () => ({
  endpoints: { admin: { dashboard: "/v1/admin/dashboard" } },
  httpClient: mockHttpClient,
}));

describe("fetchAdminDashboard", () => {
  it("uses the shared capability-filtered dashboard endpoint", async () => {
    mockHttpClient.mockResolvedValue({
      metrics: { listings: 1 },
      activity: [],
      pendingWork: [],
    });

    await fetchAdminDashboard();

    expect(httpClient).toHaveBeenCalledWith({
      url: "/v1/admin/dashboard",
      method: "GET",
    });
  });
});
