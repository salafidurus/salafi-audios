import { describe, it, expect } from "bun:test";

import { createFakeStorageAdapter } from "../test-utils/fake-storage-adapter";
import { createOutboxStore } from "./outbox.store";

describe("createOutboxStore", () => {
  it("starts empty when storage has nothing persisted", () => {
    const outbox = createOutboxStore(createFakeStorageAdapter(), "progress");

    expect(outbox.useOutboxStore.getState().entries).toEqual([]);
  });

  it("enqueue adds an entry with a fresh id and zero retries", () => {
    const outbox = createOutboxStore(createFakeStorageAdapter(), "progress");

    const entry = outbox.useOutboxStore.getState().actions.enqueue("progress-update", {
      listingId: "a",
    });

    expect(outbox.useOutboxStore.getState().entries).toHaveLength(1);
    expect(entry.type).toBe("progress-update");
    expect(entry.payload).toEqual({ listingId: "a" });
    expect(entry.retries).toBe(0);
  });

  it("enqueue persists the entry to the storage adapter", async () => {
    const adapter = createFakeStorageAdapter();
    const outbox = createOutboxStore(adapter, "progress");

    outbox.useOutboxStore.getState().actions.enqueue("progress-update", { listingId: "a" });
    // Persistence is fire-and-forget from the store's perspective; wait a tick.
    await Promise.resolve();
    await Promise.resolve();

    const persisted = await adapter.getItem("sd:outbox:progress");
    expect(persisted).not.toBeNull();
    expect(JSON.parse(persisted!)).toHaveLength(1);
  });

  it("survives a simulated app restart: a new store hydrated from the same adapter recovers unflushed entries", async () => {
    const adapter = createFakeStorageAdapter();
    const first = createOutboxStore(adapter, "progress");
    first.useOutboxStore.getState().actions.enqueue("progress-update", { listingId: "a" });
    await Promise.resolve();
    await Promise.resolve();

    // Simulate a fresh process: a brand-new store instance against the same backing storage.
    const second = createOutboxStore(adapter, "progress");
    expect(second.useOutboxStore.getState().entries).toEqual([]); // not hydrated yet

    await second.hydrate();

    expect(second.useOutboxStore.getState().entries).toHaveLength(1);
    expect(second.useOutboxStore.getState().entries[0]?.type).toBe("progress-update");
  });

  it("hydrate is a no-op when nothing was ever persisted", async () => {
    const outbox = createOutboxStore(createFakeStorageAdapter(), "progress");

    await outbox.hydrate();

    expect(outbox.useOutboxStore.getState().entries).toEqual([]);
  });

  it("hydrate drops corrupted persisted payloads instead of throwing", async () => {
    const adapter = createFakeStorageAdapter();
    await adapter.setItem("sd:outbox:progress", "{not valid json");
    const outbox = createOutboxStore(adapter, "progress");

    await expect(outbox.hydrate()).resolves.toBeUndefined();
    expect(outbox.useOutboxStore.getState().entries).toEqual([]);
    expect(await adapter.getItem("sd:outbox:progress")).toBeNull();
  });

  it("remove drops an entry and persists the updated list", async () => {
    const adapter = createFakeStorageAdapter();
    const outbox = createOutboxStore(adapter, "progress");
    const entry = outbox.useOutboxStore.getState().actions.enqueue("progress-update", {});

    outbox.useOutboxStore.getState().actions.remove(entry.id);
    await Promise.resolve();
    await Promise.resolve();

    expect(outbox.useOutboxStore.getState().entries).toEqual([]);
    const persisted = await adapter.getItem("sd:outbox:progress");
    expect(JSON.parse(persisted!)).toEqual([]);
  });

  it("incrementRetry bumps the retry count for one entry and leaves others untouched", () => {
    const outbox = createOutboxStore(createFakeStorageAdapter(), "progress");
    const a = outbox.useOutboxStore.getState().actions.enqueue("progress-update", {});
    const b = outbox.useOutboxStore.getState().actions.enqueue("progress-update", {});

    outbox.useOutboxStore.getState().actions.incrementRetry(a.id);

    const entries = outbox.useOutboxStore.getState().entries;
    expect(entries.find((e) => e.id === a.id)?.retries).toBe(1);
    expect(entries.find((e) => e.id === b.id)?.retries).toBe(0);
  });

  it("clear empties the store and removes the persisted key", async () => {
    const adapter = createFakeStorageAdapter();
    const outbox = createOutboxStore(adapter, "progress");
    outbox.useOutboxStore.getState().actions.enqueue("progress-update", {});
    await Promise.resolve();
    await Promise.resolve();

    outbox.useOutboxStore.getState().actions.clear();
    await Promise.resolve();

    expect(outbox.useOutboxStore.getState().entries).toEqual([]);
    expect(await adapter.getItem("sd:outbox:progress")).toBeNull();
  });

  it("namespaces entries under distinct storage keys so two outboxes never collide", async () => {
    const adapter = createFakeStorageAdapter();
    const progress = createOutboxStore(adapter, "progress");
    const downloads = createOutboxStore(adapter, "downloads");

    progress.useOutboxStore.getState().actions.enqueue("progress-update", {});
    await Promise.resolve();
    await Promise.resolve();

    expect(downloads.useOutboxStore.getState().entries).toEqual([]);
    expect(await adapter.getItem("sd:outbox:downloads")).toBeNull();
  });
});
