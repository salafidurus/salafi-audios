import { createSqliteKvAdapter } from "./sqlite-kv-adapter";

jest.mock("expo-sqlite", () => {
  const store = new Map<string, string>();
  return {
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

describe("createSqliteKvAdapter", () => {
  it("returns null for a key that was never set", async () => {
    const adapter = createSqliteKvAdapter();

    expect(await adapter.getItem("missing-key")).toBeNull();
  });

  it("round-trips a value through setItem/getItem", async () => {
    const adapter = createSqliteKvAdapter();

    await adapter.setItem("k1", "v1");

    expect(await adapter.getItem("k1")).toBe("v1");
  });

  it("overwrites an existing value on repeated setItem calls", async () => {
    const adapter = createSqliteKvAdapter();
    await adapter.setItem("k2", "first");

    await adapter.setItem("k2", "second");

    expect(await adapter.getItem("k2")).toBe("second");
  });

  it("removeItem deletes the key", async () => {
    const adapter = createSqliteKvAdapter();
    await adapter.setItem("k3", "v3");

    await adapter.removeItem("k3");

    expect(await adapter.getItem("k3")).toBeNull();
  });
});
