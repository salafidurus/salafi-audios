import "@/test-setup";
// happy-dom (registered in test-setup) does not implement IndexedDB — this
// package's persister is the only thing in apps/web that touches it, so the
// shim is registered here rather than globally in test-setup.
import "fake-indexeddb/auto";
import { describe, it, expect, vi } from "bun:test";
import { purgeQueryCacheDb, createIdbPersister } from "./persister";

describe("Web Query Cache Persister", () => {
  it("exports purgeQueryCacheDb function", () => {
    expect(typeof purgeQueryCacheDb).toBe("function");
  });

  it("purgeQueryCacheDb safely executes without throwing", async () => {
    await expect(purgeQueryCacheDb()).resolves.toBeUndefined();
  });

  it("createIdbPersister handles removeClient gracefully", async () => {
    const persister = createIdbPersister();
    expect(typeof persister.removeClient).toBe("function");
    await expect(persister.removeClient()).resolves.toBeUndefined();
  });

  it("purgeQueryCacheDb fully clears persisted data, and the persister can write fresh data right after", async () => {
    const persister = createIdbPersister();
    const clientA = {
      timestamp: 1,
      buster: "",
      clientState: { queries: [], mutations: [] },
    } as any;
    const clientB = {
      timestamp: 2,
      buster: "",
      clientState: { queries: [], mutations: [] },
    } as any;

    await persister.persistClient(clientA);
    expect(await persister.restoreClient()).toEqual(clientA);

    await purgeQueryCacheDb();
    expect(await persister.restoreClient()).toBeUndefined();

    // A write issued right after purge must not race a still-in-flight
    // deletion — proves purgeQueryCacheDb awaits the deletion itself rather
    // than firing indexedDB.deleteDatabase() and returning immediately.
    await persister.persistClient(clientB);
    expect(await persister.restoreClient()).toEqual(clientB);
  });

  it("purgeQueryCacheDb awaits the underlying deleteDatabase request instead of firing-and-forgetting it", async () => {
    const listeners: Record<string, Array<() => void>> = {};
    // idb's wrap() only promisifies real IDBRequest instances, so the fake
    // must pass `instanceof IDBRequest` (fake-indexeddb provides the class).
    const fakeRequest = Object.assign(Object.create(IDBRequest.prototype), {
      result: undefined,
      error: null,
      addEventListener(type: string, cb: () => void) {
        (listeners[type] ??= []).push(cb);
      },
      removeEventListener(type: string, cb: () => void) {
        listeners[type] = (listeners[type] ?? []).filter((l) => l !== cb);
      },
    });

    const deleteDatabaseSpy = vi
      .spyOn(indexedDB, "deleteDatabase")
      .mockReturnValue(fakeRequest as unknown as IDBOpenDBRequest);

    let purgeResolved = false;
    const purgePromise = purgeQueryCacheDb().then(() => {
      purgeResolved = true;
    });

    // Let pending microtasks flush without the deletion "succeeding" yet.
    await Promise.resolve();
    await Promise.resolve();
    await Promise.resolve();
    expect(purgeResolved).toBe(false);

    listeners.success?.forEach((cb) => cb());
    await purgePromise;
    expect(purgeResolved).toBe(true);

    deleteDatabaseSpy.mockRestore();
  });
});
