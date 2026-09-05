import { beforeEach, describe, expect, it, vi } from "bun:test";

import { fetchUserAccess, replaceUserAccess } from "./admin.api";

const mockHttpClient = vi.fn();

vi.mock("@sd/core-contracts", () => ({
  httpClient: mockHttpClient,
  endpoints: { admin: { users: { access: (id: string) => `/v1/admin/users/${id}/access` } } },
}));

describe("aggregate access API", () => {
  beforeEach(() => vi.clearAllMocks());

  it("fetches the user access snapshot", async () => {
    mockHttpClient.mockResolvedValue({ userId: "u1" });
    await fetchUserAccess("u1");
    expect(mockHttpClient).toHaveBeenCalledWith({
      url: "/v1/admin/users/u1/access",
      method: "GET",
    });
  });

  it("replaces access with the snapshot version", async () => {
    mockHttpClient.mockResolvedValue({ userId: "u1", version: 4 });
    await replaceUserAccess("u1", { version: 3, grants: [] });
    expect(mockHttpClient).toHaveBeenCalledWith({
      url: "/v1/admin/users/u1/access",
      method: "PUT",
      body: { version: 3, grants: [] },
    });
  });
});
