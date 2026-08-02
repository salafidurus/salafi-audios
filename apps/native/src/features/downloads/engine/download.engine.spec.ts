import { downloadsOutbox } from "@/features/downloads/outbox/outbox.store";
import { useDownloadsStore } from "@/features/downloads/store/downloads.store";

import {
  downloadLecture,
  getLocalAudioUri,
  handleDownloadOutboxEntry,
  removeLecture,
} from "./download.engine";

const mockDownloadAsync = jest.fn();
let capturedOnProgress: ((p: { bytesWritten: number; totalBytes: number }) => void) | undefined;
let capturedUrl: string | undefined;
let capturedDestination: unknown;

jest.mock("expo-sqlite", () => {
  const store = new Map<string, string>();
  return {
    __store: store,
    openDatabaseAsync: jest.fn(async () => ({
      execAsync: jest.fn(async () => {}),
      runAsync: jest.fn(async (sql: string, key: string, value?: string) => {
        if (sql.startsWith("INSERT")) store.set(key, value as string);
        else if (sql.startsWith("DELETE")) store.delete(key);
      }),
      getFirstAsync: jest.fn(async (_sql: string, key: string) => {
        const value = store.get(key);
        return value === undefined ? null : { value };
      }),
    })),
  };
});

jest.mock("expo-file-system", () => {
  class FakeFile {
    uri: string;
    delete = jest.fn();
    constructor(...parts: unknown[]) {
      this.uri = `file:///lectures/${String(parts[parts.length - 1])}`;
    }
  }
  class FakeDirectory {
    exists = true;
    create = jest.fn();
  }
  class FakeDownloadTask {
    downloadAsync = mockDownloadAsync;
    cancel = jest.fn();
    constructor(
      url: string,
      destination: unknown,
      options?: { onProgress?: (p: { bytesWritten: number; totalBytes: number }) => void },
    ) {
      capturedUrl = url;
      capturedDestination = destination;
      capturedOnProgress = options?.onProgress;
    }
  }
  return {
    File: FakeFile,
    Directory: FakeDirectory,
    Paths: { document: "file:///documents/" },
    DownloadTask: FakeDownloadTask,
  };
});

jest.mock("@/features/downloads/registry/downloads.registry", () => {
  const rows = new Map<string, any>();
  return {
    __rows: rows,
    upsertDownload: jest.fn(async (row: any) => {
      const existing = rows.get(row.listingId) ?? {};
      rows.set(row.listingId, { ...existing, ...row });
    }),
    getDownload: jest.fn(async (listingId: string) => rows.get(listingId) ?? null),
    getAllDownloads: jest.fn(async () => Array.from(rows.values())),
    removeDownload: jest.fn(async (listingId: string) => void rows.delete(listingId)),
  };
});

describe("download.engine", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    useDownloadsStore.setState({ downloads: {} });
    downloadsOutbox.useOutboxStore.setState({ entries: [] });
    (
      jest.requireMock("@/features/downloads/registry/downloads.registry") as {
        __rows: Map<string, unknown>;
      }
    ).__rows.clear();
    (jest.requireMock("expo-sqlite") as { __store: Map<string, string> }).__store.clear();
    capturedOnProgress = undefined;
  });

  it("marks the row downloading before the transfer starts", async () => {
    const upsertSpy = jest.spyOn(useDownloadsStore.getState().actions, "upsert");
    mockDownloadAsync.mockResolvedValue({ uri: "file:///lectures/l1.mp3" });

    await downloadLecture("l1", "https://s/l1.mp3");

    expect(upsertSpy.mock.calls[0]?.[0]).toMatchObject({
      listingId: "l1",
      url: "https://s/l1.mp3",
      status: "downloading",
    });
  });

  it("passes the given url and a lecture-scoped destination to DownloadTask", async () => {
    mockDownloadAsync.mockResolvedValue({ uri: "file:///lectures/l1.mp3" });

    await downloadLecture("l1", "https://s/l1.mp3");

    expect(capturedUrl).toBe("https://s/l1.mp3");
    expect(capturedDestination).toBeDefined();
  });

  it("updates store bytesTotal/bytesDownloaded as progress events arrive", async () => {
    mockDownloadAsync.mockImplementation(async () => {
      capturedOnProgress?.({ bytesWritten: 500, totalBytes: 1000 });
      return { uri: "file:///lectures/l1.mp3" };
    });

    await downloadLecture("l1", "https://s/l1.mp3");

    expect(useDownloadsStore.getState().downloads.l1).toMatchObject({
      bytesTotal: 1000,
      bytesDownloaded: 500,
    });
  });

  it("marks complete with the real local file uri on success", async () => {
    mockDownloadAsync.mockResolvedValue({ uri: "file:///lectures/l1.mp3" });

    await downloadLecture("l1", "https://s/l1.mp3");

    expect(useDownloadsStore.getState().downloads.l1).toMatchObject({
      status: "complete",
      localUri: "file:///lectures/l1.mp3",
    });
  });

  it("marks error status when the download throws", async () => {
    mockDownloadAsync.mockRejectedValue(new Error("network down"));

    await downloadLecture("l1", "https://s/l1.mp3");

    expect(useDownloadsStore.getState().downloads.l1?.status).toBe("error");
  });

  it("queues a start-download outbox entry when the download fails, for retry on reconnect", async () => {
    mockDownloadAsync.mockRejectedValue(new Error("network down"));

    await downloadLecture("l1", "https://s/l1.mp3");

    expect(downloadsOutbox.useOutboxStore.getState().entries).toEqual([
      expect.objectContaining({
        type: "start-download",
        payload: { lectureId: "l1", audioUrl: "https://s/l1.mp3" },
      }),
    ]);
  });

  it("does not queue an outbox entry when the download succeeds", async () => {
    mockDownloadAsync.mockResolvedValue({ uri: "file:///lectures/l1.mp3" });

    await downloadLecture("l1", "https://s/l1.mp3");

    expect(downloadsOutbox.useOutboxStore.getState().entries).toEqual([]);
  });

  describe("handleDownloadOutboxEntry", () => {
    it("dispatches a start-download entry to downloadLecture", async () => {
      mockDownloadAsync.mockResolvedValue({ uri: "file:///lectures/l1.mp3" });

      await handleDownloadOutboxEntry("start-download", {
        lectureId: "l1",
        audioUrl: "https://s/l1.mp3",
      });

      expect(useDownloadsStore.getState().downloads.l1?.status).toBe("complete");
    });

    it("ignores an unknown entry type", async () => {
      await expect(handleDownloadOutboxEntry("unknown-type", {})).resolves.toBeUndefined();
      expect(mockDownloadAsync).not.toHaveBeenCalled();
    });
  });

  describe("getLocalAudioUri", () => {
    it("returns undefined when nothing is registered", async () => {
      expect(await getLocalAudioUri("l1")).toBeUndefined();
    });

    it("returns undefined when the download isn't complete yet", async () => {
      const { upsertDownload } = jest.requireMock(
        "@/features/downloads/registry/downloads.registry",
      );
      await upsertDownload({ listingId: "l1", status: "downloading", localUri: null });

      expect(await getLocalAudioUri("l1")).toBeUndefined();
    });

    it("returns the local uri once complete", async () => {
      const { upsertDownload } = jest.requireMock(
        "@/features/downloads/registry/downloads.registry",
      );
      await upsertDownload({
        listingId: "l1",
        status: "complete",
        localUri: "file:///lectures/l1.mp3",
      });

      expect(await getLocalAudioUri("l1")).toBe("file:///lectures/l1.mp3");
    });
  });

  describe("removeLecture", () => {
    it("clears the row from the store", async () => {
      mockDownloadAsync.mockResolvedValue({ uri: "file:///lectures/l1.mp3" });
      await downloadLecture("l1", "https://s/l1.mp3");

      await removeLecture("l1");

      expect(useDownloadsStore.getState().downloads.l1).toBeUndefined();
    });

    it("removes cleanly even when there is no local file yet", async () => {
      await removeLecture("l1");

      expect(useDownloadsStore.getState().downloads.l1).toBeUndefined();
    });
  });
});
