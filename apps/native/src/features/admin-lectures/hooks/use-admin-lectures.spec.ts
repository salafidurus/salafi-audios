import { useAdminLectures } from "./use-admin-lectures";

jest.mock("@sd/core-contracts", () => ({
  useApiQuery: jest.fn(),
  httpClient: jest.fn(),
  endpoints: { admin: { lectures: { list: "/admin/lectures" } } },
}));

const { useApiQuery } = require("@sd/core-contracts");

describe("useAdminLectures", () => {
  it("calls useApiQuery and returns result", () => {
    useApiQuery.mockReturnValue({ data: { items: [], total: 0, page: 1 }, isLoading: false });

    const result = useAdminLectures();
    expect(result.data?.items).toEqual([]);
    expect(useApiQuery).toHaveBeenCalled();
  });
});
