import { describe, it, expect } from "bun:test";

import { createFakeStorageAdapter } from "../test-utils/fake-storage-adapter";
import { drainOutbox } from "./outbox.drain";
import { createOutboxStore } from "./outbox.store";

describe("drainOutbox", () => {
  it("is a no-op when there are no entries — the handler is never called", async () => {
    const outbox = createOutboxStore(createFakeStorageAdapter(), "progress");
    let calls = 0;

    const result = await drainOutbox(outbox, async () => {
      calls++;
    });

    expect(calls).toBe(0);
    expect(result).toEqual({ succeeded: 0, failed: 0 });
  });

  it("calls the handler for every entry and removes entries whose handler resolves", async () => {
    const outbox = createOutboxStore(createFakeStorageAdapter(), "progress");
    outbox.useOutboxStore.getState().actions.enqueue("progress-update", { listingId: "a" });
    outbox.useOutboxStore.getState().actions.enqueue("progress-update", { listingId: "b" });

    const result = await drainOutbox(outbox, async () => {
      // succeed unconditionally
    });

    expect(result).toEqual({ succeeded: 2, failed: 0 });
    expect(outbox.useOutboxStore.getState().entries).toEqual([]);
  });

  it("keeps entries whose handler rejects and increments their retry count", async () => {
    const outbox = createOutboxStore(createFakeStorageAdapter(), "progress");
    const failing = outbox.useOutboxStore
      .getState()
      .actions.enqueue("progress-update", { listingId: "fails" });

    const result = await drainOutbox(outbox, async () => {
      throw new Error("network down");
    });

    expect(result).toEqual({ succeeded: 0, failed: 1 });
    const remaining = outbox.useOutboxStore.getState().entries;
    expect(remaining).toHaveLength(1);
    expect(remaining[0]?.id).toBe(failing.id);
    expect(remaining[0]?.retries).toBe(1);
  });

  it("processes a mix of succeeding and failing entries independently", async () => {
    type Payload = { ok: boolean };
    const outbox = createOutboxStore<Payload>(createFakeStorageAdapter(), "progress");
    outbox.useOutboxStore.getState().actions.enqueue("progress-update", { ok: true });
    const failing = outbox.useOutboxStore
      .getState()
      .actions.enqueue("progress-update", { ok: false });

    const result = await drainOutbox(outbox, async (entry) => {
      if (entry.payload.ok === false) throw new Error("fail");
    });

    expect(result).toEqual({ succeeded: 1, failed: 1 });
    const remaining = outbox.useOutboxStore.getState().entries;
    expect(remaining).toHaveLength(1);
    expect(remaining[0]?.id).toBe(failing.id);
  });

  it("sets isDraining true while draining and false once settled", async () => {
    const outbox = createOutboxStore(createFakeStorageAdapter(), "progress");
    outbox.useOutboxStore.getState().actions.enqueue("progress-update", {});

    let deferredResolve: () => void = () => {};
    const gate = new Promise<void>((resolve) => {
      deferredResolve = resolve;
    });

    const drainPromise = drainOutbox(outbox, async () => {
      expect(outbox.useOutboxStore.getState().isDraining).toBe(true);
      await gate;
    });

    deferredResolve();
    await drainPromise;

    expect(outbox.useOutboxStore.getState().isDraining).toBe(false);
  });

  it("is a no-op (de-dupe guard) when a drain is already in flight", async () => {
    const outbox = createOutboxStore(createFakeStorageAdapter(), "progress");
    outbox.useOutboxStore.getState().actions.enqueue("progress-update", {});

    let handlerCalls = 0;
    let releaseFirst: () => void = () => {};
    const gate = new Promise<void>((resolve) => {
      releaseFirst = resolve;
    });

    const firstDrain = drainOutbox(outbox, async () => {
      handlerCalls++;
      await gate;
    });

    // Fired concurrently, e.g. AppState foreground + network reconnect racing.
    const secondDrainResult = await drainOutbox(outbox, async () => {
      handlerCalls++;
    });

    expect(secondDrainResult).toEqual({ succeeded: 0, failed: 0 });
    expect(handlerCalls).toBe(1);

    releaseFirst();
    await firstDrain;
  });
});
