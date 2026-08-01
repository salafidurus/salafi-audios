import { describe, it, expect, beforeEach } from "bun:test";

import { createOutboxStore } from "../outbox/outbox.store";
import { createEntityStore, type SyncableEntity } from "../store/entity-store";
import { createFakeStorageAdapter } from "../test-utils/fake-storage-adapter";
import { createSyncEngine } from "./sync-engine";

type TestEntity = SyncableEntity & { value: number };

function wait(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

describe("createSyncEngine", () => {
  const useTestStore = createEntityStore<TestEntity>();

  beforeEach(() => {
    useTestStore.setState({ entities: {} });
  });

  it("scheduleSync writes the entity into the local store immediately (optimistic)", () => {
    const outbox = createOutboxStore(createFakeStorageAdapter(), "test");
    const engine = createSyncEngine<TestEntity>({
      store: useTestStore,
      outbox,
      entryType: "test-update",
      debounceMs: 10_000,
      pushOne: async () => {},
      pullSince: async () => [],
    });

    engine.scheduleSync({ id: "a", updatedAt: "2026-01-01T00:00:00.000Z", value: 1 });

    expect(useTestStore.getState().actions.get("a")?.value).toBe(1);
  });

  it("debounces multiple scheduleSync calls for the same id into a single push", async () => {
    let pushCalls = 0;
    let lastPushed: TestEntity | undefined;
    const outbox = createOutboxStore(createFakeStorageAdapter(), "test");
    const engine = createSyncEngine<TestEntity>({
      store: useTestStore,
      outbox,
      entryType: "test-update",
      debounceMs: 20,
      pushOne: async (entity) => {
        pushCalls++;
        lastPushed = entity;
      },
      pullSince: async () => [],
    });

    engine.scheduleSync({ id: "a", updatedAt: "2026-01-01T00:00:00.000Z", value: 1 });
    engine.scheduleSync({ id: "a", updatedAt: "2026-01-01T00:00:01.000Z", value: 2 });
    engine.scheduleSync({ id: "a", updatedAt: "2026-01-01T00:00:02.000Z", value: 3 });

    await wait(60);

    expect(pushCalls).toBe(1);
    expect(lastPushed?.value).toBe(3);
  });

  it("flush() bypasses the debounce timer and pushes immediately", async () => {
    let pushCalls = 0;
    const outbox = createOutboxStore(createFakeStorageAdapter(), "test");
    const engine = createSyncEngine<TestEntity>({
      store: useTestStore,
      outbox,
      entryType: "test-update",
      debounceMs: 120_000,
      pushOne: async () => {
        pushCalls++;
      },
      pullSince: async () => [],
    });

    engine.scheduleSync({ id: "a", updatedAt: "2026-01-01T00:00:00.000Z", value: 1 });
    await engine.flush();

    expect(pushCalls).toBe(1);
  });

  it("flush() with nothing pending does not call pushOne", async () => {
    let pushCalls = 0;
    const outbox = createOutboxStore(createFakeStorageAdapter(), "test");
    const engine = createSyncEngine<TestEntity>({
      store: useTestStore,
      outbox,
      entryType: "test-update",
      pushOne: async () => {
        pushCalls++;
      },
      pullSince: async () => [],
    });

    await engine.flush();

    expect(pushCalls).toBe(0);
  });

  it("notifies onFlushed listeners after a successful flush", async () => {
    const outbox = createOutboxStore(createFakeStorageAdapter(), "test");
    const engine = createSyncEngine<TestEntity>({
      store: useTestStore,
      outbox,
      entryType: "test-update",
      pushOne: async () => {},
      pullSince: async () => [],
    });

    let notified = 0;
    const unsubscribe = engine.onFlushed(() => notified++);

    engine.scheduleSync({ id: "a", updatedAt: "2026-01-01T00:00:00.000Z", value: 1 });
    await engine.flush();

    expect(notified).toBe(1);
    unsubscribe();
  });

  it("does not notify onFlushed listeners when there was nothing to flush", async () => {
    const outbox = createOutboxStore(createFakeStorageAdapter(), "test");
    const engine = createSyncEngine<TestEntity>({
      store: useTestStore,
      outbox,
      entryType: "test-update",
      pushOne: async () => {},
      pullSince: async () => [],
    });

    let notified = 0;
    engine.onFlushed(() => notified++);
    await engine.flush();

    expect(notified).toBe(0);
  });

  it("queues the entity in the persisted outbox when a flush push fails, instead of throwing", async () => {
    const adapter = createFakeStorageAdapter();
    const outbox = createOutboxStore(adapter, "test");
    const engine = createSyncEngine<TestEntity>({
      store: useTestStore,
      outbox,
      entryType: "test-update",
      pushOne: async () => {
        throw new Error("network down");
      },
      pullSince: async () => [],
    });

    engine.scheduleSync({ id: "a", updatedAt: "2026-01-01T00:00:00.000Z", value: 1 });
    await expect(engine.flush()).resolves.toBeUndefined();

    const entries = outbox.useOutboxStore.getState().entries;
    expect(entries).toHaveLength(1);
    expect(entries[0]?.type).toBe("test-update");
    expect((entries[0]?.payload as TestEntity | undefined)?.id).toBe("a");
  });

  it("hydrate pulls entities since the given cursor and merges them into the store via LWW", async () => {
    const outbox = createOutboxStore(createFakeStorageAdapter(), "test");
    let requestedSince: string | undefined;
    const engine = createSyncEngine<TestEntity>({
      store: useTestStore,
      outbox,
      entryType: "test-update",
      pushOne: async () => {},
      pullSince: async (since) => {
        requestedSince = since;
        return [{ id: "a", updatedAt: "2026-01-02T00:00:00.000Z", value: 5 }];
      },
    });

    const result = await engine.hydrate("2026-01-01T00:00:00.000Z");

    expect(requestedSince).toBe("2026-01-01T00:00:00.000Z");
    expect(result).toHaveLength(1);
    expect(useTestStore.getState().actions.get("a")?.value).toBe(5);
  });

  it("hydrate's LWW merge keeps a newer unsynced local write over a stale server pull", async () => {
    useTestStore
      .getState()
      .actions.upsert({ id: "a", updatedAt: "2026-01-03T00:00:00.000Z", value: 99 });

    const outbox = createOutboxStore(createFakeStorageAdapter(), "test");
    const engine = createSyncEngine<TestEntity>({
      store: useTestStore,
      outbox,
      entryType: "test-update",
      pushOne: async () => {},
      pullSince: async () => [{ id: "a", updatedAt: "2026-01-02T00:00:00.000Z", value: 1 }],
    });

    await engine.hydrate();

    expect(useTestStore.getState().actions.get("a")?.value).toBe(99);
  });

  it("bulkSync calls pushBulk with the full batch when provided", async () => {
    let bulkCalledWith: TestEntity[] | undefined;
    const outbox = createOutboxStore(createFakeStorageAdapter(), "test");
    const engine = createSyncEngine<TestEntity>({
      store: useTestStore,
      outbox,
      entryType: "test-update",
      pushOne: async () => {
        throw new Error("should not be called when pushBulk is provided");
      },
      pushBulk: async (entities) => {
        bulkCalledWith = entities;
      },
      pullSince: async () => [],
    });

    const batch = [{ id: "a", updatedAt: "2026-01-01T00:00:00.000Z", value: 1 }];
    await engine.bulkSync(batch);

    expect(bulkCalledWith).toEqual(batch);
  });

  it("bulkSync falls back to per-entity pushOne when pushBulk is not provided", async () => {
    const pushed: string[] = [];
    const outbox = createOutboxStore(createFakeStorageAdapter(), "test");
    const engine = createSyncEngine<TestEntity>({
      store: useTestStore,
      outbox,
      entryType: "test-update",
      pushOne: async (entity) => {
        pushed.push(entity.id);
      },
      pullSince: async () => [],
    });

    await engine.bulkSync([
      { id: "a", updatedAt: "2026-01-01T00:00:00.000Z", value: 1 },
      { id: "b", updatedAt: "2026-01-01T00:00:00.000Z", value: 2 },
    ]);

    expect(pushed.sort()).toEqual(["a", "b"]);
  });

  it("bulkSync is a no-op on an empty batch", async () => {
    let called = false;
    const outbox = createOutboxStore(createFakeStorageAdapter(), "test");
    const engine = createSyncEngine<TestEntity>({
      store: useTestStore,
      outbox,
      entryType: "test-update",
      pushOne: async () => {
        called = true;
      },
      pullSince: async () => [],
    });

    await engine.bulkSync([]);

    expect(called).toBe(false);
  });

  it("drainPending retries queued outbox entries via pushOne and removes them on success", async () => {
    const adapter = createFakeStorageAdapter();
    const outbox = createOutboxStore(adapter, "test");
    outbox.useOutboxStore
      .getState()
      .actions.enqueue("test-update", { id: "a", updatedAt: "2026-01-01T00:00:00.000Z", value: 1 });

    let pushed: TestEntity | undefined;
    const engine = createSyncEngine<TestEntity>({
      store: useTestStore,
      outbox,
      entryType: "test-update",
      pushOne: async (entity) => {
        pushed = entity;
      },
      pullSince: async () => [],
    });

    await engine.drainPending();

    expect(pushed?.id).toBe("a");
    expect(outbox.useOutboxStore.getState().entries).toEqual([]);
  });
});
