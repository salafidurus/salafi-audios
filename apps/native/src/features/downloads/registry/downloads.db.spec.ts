import { upsertDownload, getDownload, getAllDownloads, removeDownload } from "./downloads.db";

jest.mock("expo-sqlite", () => {
  const rows = new Map<string, Record<string, unknown>>();
  return {
    __rows: rows,
    openDatabaseAsync: jest.fn(async () => ({
      execAsync: jest.fn(async () => {}),
      runAsync: jest.fn(async (sql: string, ...args: unknown[]) => {
        if (sql.trim().startsWith("INSERT")) {
          const [
            listingId,
            url,
            localUri,
            status,
            bytesTotal,
            bytesDownloaded,
            pauseState,
            createdAt,
            updatedAt,
          ] = args;
          rows.set(listingId as string, {
            listingId,
            url,
            localUri,
            status,
            bytesTotal,
            bytesDownloaded,
            pauseState,
            createdAt,
            updatedAt,
          });
        } else if (sql.trim().startsWith("DELETE")) {
          rows.delete(args[0] as string);
        }
      }),
      getFirstAsync: jest.fn(
        async (_sql: string, listingId: string) => rows.get(listingId) ?? null,
      ),
      getAllAsync: jest.fn(async () => Array.from(rows.values())),
    })),
  };
});

describe("downloads.db registry", () => {
  beforeEach(() => {
    (jest.requireMock("expo-sqlite") as { __rows: Map<string, unknown> }).__rows.clear();
  });

  it("returns null for a listing with no row", async () => {
    expect(await getDownload("l1")).toBeNull();
  });

  it("round-trips a full row through upsert/get", async () => {
    await upsertDownload({
      listingId: "l1",
      url: "https://s/l1.mp3",
      status: "downloading",
      bytesTotal: 1000,
      bytesDownloaded: 200,
    });

    const row = await getDownload("l1");
    expect(row).toMatchObject({
      listingId: "l1",
      url: "https://s/l1.mp3",
      status: "downloading",
      bytesTotal: 1000,
      bytesDownloaded: 200,
    });
  });

  it("merges a partial upsert onto the existing row instead of clobbering it", async () => {
    await upsertDownload({ listingId: "l1", url: "https://s/l1.mp3", status: "downloading" });

    await upsertDownload({ listingId: "l1", bytesDownloaded: 500, bytesTotal: 1000 });

    const row = await getDownload("l1");
    expect(row).toMatchObject({
      listingId: "l1",
      url: "https://s/l1.mp3", // preserved from the first upsert
      status: "downloading", // preserved
      bytesDownloaded: 500,
      bytesTotal: 1000,
    });
  });

  it("getAllDownloads returns every registered row", async () => {
    await upsertDownload({ listingId: "l1", url: "https://s/l1.mp3", status: "complete" });
    await upsertDownload({ listingId: "l2", url: "https://s/l2.mp3", status: "downloading" });

    const rows = await getAllDownloads();

    expect(rows.map((r) => r.listingId).sort()).toEqual(["l1", "l2"]);
  });

  it("removeDownload deletes the row", async () => {
    await upsertDownload({ listingId: "l1", url: "https://s/l1.mp3", status: "complete" });

    await removeDownload("l1");

    expect(await getDownload("l1")).toBeNull();
  });
});
