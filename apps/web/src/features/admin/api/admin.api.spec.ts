import { describe, it, expect, vi, beforeEach } from "bun:test";
import { fetchScholarFormData } from "./admin.api";

const mockHttpClient = vi.fn();

vi.mock("@sd/core-contracts", () => ({
  httpClient: mockHttpClient,
  endpoints: {
    admin: {
      scholars: {
        formData: (id: string) => `/admin/scholars/${id}/form-data`,
      },
    },
  },
}));

describe("fetchScholarFormData", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("calls httpClient with correct endpoint and GET method", async () => {
    const mockResponse = {
      scholar: {
        id: "scholar-1",
        name: "Test Scholar",
        slug: "test-scholar",
        isActive: true,
        createdAt: "2026-07-24T00:00:00.000Z",
      },
      translations: [],
    };

    mockHttpClient.mockResolvedValue(mockResponse);

    const result = await fetchScholarFormData("scholar-1");

    expect(mockHttpClient).toHaveBeenCalledWith({
      url: "/admin/scholars/scholar-1/form-data",
      method: "GET",
    });
    expect(result).toEqual(mockResponse);
  });

  it("uses correct endpoint function", async () => {
    const mockResponse = {
      scholar: { id: "s2", name: "Scholar 2", slug: "s2", isActive: true, createdAt: "" },
      translations: [],
    };

    mockHttpClient.mockResolvedValue(mockResponse);

    await fetchScholarFormData("s2");

    expect(mockHttpClient).toHaveBeenCalled();
    const call = mockHttpClient.mock.calls[0]?.[0];
    expect(call?.url).toBe("/admin/scholars/s2/form-data");
  });
});
