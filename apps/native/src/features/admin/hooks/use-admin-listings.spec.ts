import { useApiQuery } from "@sd/core-contracts";

import { useAdminListings } from "./use-admin-listings";

jest.mock("@sd/core-contracts", () => ({
  useApiQuery: jest.fn(),
  httpClient: jest.fn(),
  endpoints: { admin: { listings: { list: "/admin/listings" } } },
}));

const mockUseApiQuery = useApiQuery as jest.Mock;

describe("useAdminListings", () => {
  it("calls useApiQuery and returns result", () => {
    mockUseApiQuery.mockReturnValue({ data: { items: [], total: 0, page: 1 }, isLoading: false });

    const result = useAdminListings();
    expect(result.data?.items).toEqual([]);
    expect(mockUseApiQuery).toHaveBeenCalled();
  });
});
