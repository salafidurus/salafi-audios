import { useAdminLectures } from "./use-admin-lectures";
import { useApiQuery } from "@sd/core-contracts";

jest.mock("@sd/core-contracts", () => ({
  useApiQuery: jest.fn(),
  httpClient: jest.fn(),
  endpoints: { admin: { lectures: { list: "/admin/lectures" } } },
}));

const mockUseApiQuery = jest.mocked(useApiQuery);

describe("useAdminLectures", () => {
  it("calls useApiQuery and returns result", () => {
    mockUseApiQuery.mockReturnValue({ data: { items: [], total: 0, page: 1 }, isLoading: false });

    const result = useAdminLectures();
    expect(result.data?.items).toEqual([]);
    expect(mockUseApiQuery).toHaveBeenCalled();
  });
});
