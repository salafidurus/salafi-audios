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

describe("downloadsOutbox", () => {
  beforeEach(() => {
    downloadsOutbox.useOutboxStore.setState({ entries: [] });
    (jest.requireMock("expo-sqlite") as { __store: Map<string, string> }).__store.clear();
  });

  it("starts empty", () => {
    expect(downloadsOutbox.useOutboxStore.getState().entries).toEqual([]);
  });

  it("enqueue adds an entry and persists it via the SQLite kv adapter", async () => {
    downloadsOutbox.useOutboxStore.getState().actions.enqueue("start-download", {
      listingSlug: "l1",
      audioUrl: "https://s/l1.mp3",
    });

    expect(downloadsOutbox.useOutboxStore.getState().entries).toHaveLength(1);
    await Promise.resolve();
    await Promise.resolve();
    const { __store } = jest.requireMock("expo-sqlite") as { __store: Map<string, string> };
    expect(__store.get("sd:outbox:downloads")).toBeDefined();
  });
});
