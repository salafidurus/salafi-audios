import { describe, it, expect, vi, beforeEach } from "bun:test";
import { fetchListingFormData } from "./admin-lectures.api";

const mockHttpClient = vi.fn();

vi.mock("@sd/core-contracts", () => ({
  httpClient: mockHttpClient,
  endpoints: {
    admin: {
      listings: {
        formData: (id: string) => `/admin/listings/${id}/form-data`,
      },
    },
  },
}));

describe("fetchListingFormData", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("calls httpClient with correct endpoint and GET method", async () => {
    const mockResponse = {
      listing: {
        id: "listing-1",
        slug: "test-lecture",
        title: "Test Lecture",
        format: "single",
        status: "draft",
        scholarId: "scholar-1",
        scholarName: "Scholar Name",
        topics: [],
        createdAt: "2026-07-24T00:00:00.000Z",
      },
      translations: [],
    };

    mockHttpClient.mockResolvedValue(mockResponse);

    const result = await fetchListingFormData("listing-1");

    expect(mockHttpClient).toHaveBeenCalledWith({
      url: "/admin/listings/listing-1/form-data",
      method: "GET",
    });
    expect(result).toEqual(mockResponse);
  });

  it("uses correct endpoint function", async () => {
    const mockResponse = {
      listing: {
        id: "l2",
        slug: "l2",
        title: "Listing 2",
        format: "single",
        status: "draft",
        scholarId: "scholar-1",
        scholarName: "Scholar",
        topics: [],
        createdAt: "",
      },
      translations: [],
    };

    mockHttpClient.mockResolvedValue(mockResponse);

    await fetchListingFormData("l2");

    expect(mockHttpClient).toHaveBeenCalled();
    const call = mockHttpClient.mock.calls[0]?.[0];
    expect(call?.url).toBe("/admin/listings/l2/form-data");
  });
});
