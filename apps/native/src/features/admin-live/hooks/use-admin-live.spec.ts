import { useAdminChannels, useAdminSessions } from "./use-admin-live";
import { useApiQuery } from "@sd/core-contracts";

jest.mock("@sd/core-contracts", () => ({
  useApiQuery: jest.fn(),
  httpClient: jest.fn(),
  endpoints: {
    admin: {
      live: {
        listChannels: "/admin/live/channels",
        listSessions: "/admin/live/sessions",
      },
    },
  },
}));

const mockUseApiQuery = useApiQuery as jest.Mock;

describe("useAdminLive hooks", () => {
  it("useAdminChannels calls useApiQuery", () => {
    mockUseApiQuery.mockReturnValue({ data: [], isLoading: false });
    const result = useAdminChannels();
    expect(result.data).toEqual([]);
    expect(mockUseApiQuery).toHaveBeenCalled();
  });

  it("useAdminSessions calls useApiQuery", () => {
    mockUseApiQuery.mockReturnValue({ data: { sessions: [] }, isLoading: false });
    const result = useAdminSessions();
    expect(result.data?.sessions).toEqual([]);
    expect(mockUseApiQuery).toHaveBeenCalled();
  });
});
