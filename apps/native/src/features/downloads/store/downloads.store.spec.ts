import { useDownloadsStore } from "./downloads.store";

jest.mock("../registry/downloads.db", () => {
  const rows = new Map<string, any>();
  return {
    __rows: rows,
    upsertDownload: jest.fn(async (row: any) => {
      const existing = rows.get(row.listingId) ?? {
        status: "pending",
        bytesTotal: 0,
        bytesDownloaded: 0,
        localUri: null,
        pauseState: null,
        createdAt: 0,
        updatedAt: 0,
      };
      rows.set(row.listingId, { ...existing, ...row });
    }),
    getDownload: jest.fn(async (listingId: string) => rows.get(listingId) ?? null),
    getAllDownloads: jest.fn(async () => Array.from(rows.values())),
    removeDownload: jest.fn(async (listingId: string) => void rows.delete(listingId)),
  };
});

describe("useDownloadsStore", () => {
  beforeEach(() => {
    useDownloadsStore.setState({ downloads: {} });
    (
      jest.requireMock("../registry/downloads.db") as { __rows: Map<string, unknown> }
    ).__rows.clear();
  });

  it("starts empty", () => {
    expect(useDownloadsStore.getState().downloads).toEqual({});
  });

  it("hydrate loads every row from the registry into state", async () => {
    const { upsertDownload } = jest.requireMock("../registry/downloads.db");
    await upsertDownload({ listingId: "l1", url: "https://s/l1.mp3", status: "complete" });

    await useDownloadsStore.getState().actions.hydrate();

    expect(useDownloadsStore.getState().downloads.l1?.status).toBe("complete");
  });

  it("upsert writes through to the registry and updates local state reactively", async () => {
    await useDownloadsStore.getState().actions.upsert({
      listingId: "l1",
      url: "https://s/l1.mp3",
      status: "downloading",
      bytesDownloaded: 50,
      bytesTotal: 100,
    });

    const row = useDownloadsStore.getState().actions.getDownload("l1");
    expect(row?.status).toBe("downloading");
    expect(row?.bytesDownloaded).toBe(50);
  });

  it("remove writes through to the registry and clears local state", async () => {
    await useDownloadsStore
      .getState()
      .actions.upsert({ listingId: "l1", url: "u", status: "complete" });

    await useDownloadsStore.getState().actions.remove("l1");

    expect(useDownloadsStore.getState().actions.getDownload("l1")).toBeUndefined();
  });
});
