import { drainDownloadsOutbox, enqueueDownloadMutation } from "./outbox.drain";
import { downloadsOutbox } from "./outbox.store";

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

describe("downloads outbox drain", () => {
  beforeEach(() => {
    downloadsOutbox.useOutboxStore.setState({ entries: [] });
    (jest.requireMock("expo-sqlite") as { __store: Map<string, string> }).__store.clear();
  });

  it("enqueueDownloadMutation queues an entry", () => {
    enqueueDownloadMutation("start-download", { lectureId: "l1" });

    expect(downloadsOutbox.useOutboxStore.getState().entries).toHaveLength(1);
  });

  it("drainDownloadsOutbox calls the handler with each entry's type and payload, and removes it on success", async () => {
    enqueueDownloadMutation("start-download", { lectureId: "l1" });
    const handler = jest.fn(async () => {});

    const result = await drainDownloadsOutbox(handler);

    expect(handler).toHaveBeenCalledWith("start-download", { lectureId: "l1" });
    expect(result).toEqual({ succeeded: 1, failed: 0 });
    expect(downloadsOutbox.useOutboxStore.getState().entries).toEqual([]);
  });

  it("keeps a failed entry queued for retry", async () => {
    enqueueDownloadMutation("start-download", { lectureId: "l1" });
    const handler = jest.fn(async () => {
      throw new Error("offline");
    });

    const result = await drainDownloadsOutbox(handler);

    expect(result).toEqual({ succeeded: 0, failed: 1 });
    expect(downloadsOutbox.useOutboxStore.getState().entries).toHaveLength(1);
  });

  it("is a no-op when nothing is queued", async () => {
    const handler = jest.fn(async () => {});

    const result = await drainDownloadsOutbox(handler);

    expect(handler).not.toHaveBeenCalled();
    expect(result).toEqual({ succeeded: 0, failed: 0 });
  });
});
