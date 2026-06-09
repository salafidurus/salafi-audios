import { useAdminChannels, useAdminSessions } from "./use-admin-live";

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

const { useApiQuery } = require("@sd/core-contracts");

describe("useAdminLive hooks", () => {
  it("useAdminChannels calls useApiQuery", () => {
    useApiQuery.mockReturnValue({ data: [], isLoading: false });
    const result = useAdminChannels();
    expect(result.data).toEqual([]);
    expect(useApiQuery).toHaveBeenCalled();
  });

  it("useAdminSessions calls useApiQuery", () => {
    useApiQuery.mockReturnValue({ data: { sessions: [] }, isLoading: false });
    const result = useAdminSessions();
    expect(result.data?.sessions).toEqual([]);
    expect(useApiQuery).toHaveBeenCalled();
  });
});
