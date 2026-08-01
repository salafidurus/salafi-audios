import { describe, it, expect, beforeEach } from "bun:test";

import { createEntityStore, type SyncableEntity } from "./entity-store";

type TestEntity = SyncableEntity & { value: number };

describe("createEntityStore", () => {
  const useTestStore = createEntityStore<TestEntity>();

  beforeEach(() => {
    useTestStore.setState({ entities: {} });
  });

  it("starts empty", () => {
    expect(useTestStore.getState().entities).toEqual({});
    expect(useTestStore.getState().actions.getAll()).toEqual([]);
  });

  it("upserts an entity and reads it back by id", () => {
    const entity: TestEntity = { id: "a", updatedAt: "2026-01-01T00:00:00.000Z", value: 1 };

    useTestStore.getState().actions.upsert(entity);

    expect(useTestStore.getState().actions.get("a")).toEqual(entity);
  });

  it("upsert overwrites an existing entity unconditionally (no LWW check)", () => {
    useTestStore
      .getState()
      .actions.upsert({ id: "a", updatedAt: "2026-01-02T00:00:00.000Z", value: 1 });
    useTestStore
      .getState()
      .actions.upsert({ id: "a", updatedAt: "2026-01-01T00:00:00.000Z", value: 2 });

    expect(useTestStore.getState().actions.get("a")?.value).toBe(2);
  });

  it("upsertMany adds multiple entities", () => {
    useTestStore.getState().actions.upsertMany([
      { id: "a", updatedAt: "2026-01-01T00:00:00.000Z", value: 1 },
      { id: "b", updatedAt: "2026-01-01T00:00:00.000Z", value: 2 },
    ]);

    expect(useTestStore.getState().actions.getAll()).toHaveLength(2);
  });

  it("getAll includes tombstoned (deletedAt-set) entities", () => {
    useTestStore.getState().actions.upsert({
      id: "a",
      updatedAt: "2026-01-01T00:00:00.000Z",
      deletedAt: "2026-01-02T00:00:00.000Z",
      value: 1,
    });

    expect(useTestStore.getState().actions.getAll()).toHaveLength(1);
  });

  it("getActive excludes tombstoned entities", () => {
    useTestStore.getState().actions.upsertMany([
      { id: "a", updatedAt: "2026-01-01T00:00:00.000Z", value: 1 },
      {
        id: "b",
        updatedAt: "2026-01-01T00:00:00.000Z",
        deletedAt: "2026-01-02T00:00:00.000Z",
        value: 2,
      },
    ]);

    const active = useTestStore.getState().actions.getActive();
    expect(active).toHaveLength(1);
    expect(active[0]?.id).toBe("a");
  });

  it("remove hard-deletes an entity from local state (cache eviction, not a tombstone)", () => {
    useTestStore
      .getState()
      .actions.upsert({ id: "a", updatedAt: "2026-01-01T00:00:00.000Z", value: 1 });

    useTestStore.getState().actions.remove("a");

    expect(useTestStore.getState().actions.get("a")).toBeUndefined();
  });

  it("merge applies last-write-wins: newer incoming replaces older current", () => {
    useTestStore
      .getState()
      .actions.upsert({ id: "a", updatedAt: "2026-01-01T00:00:00.000Z", value: 1 });

    useTestStore
      .getState()
      .actions.merge({ id: "a", updatedAt: "2026-01-02T00:00:00.000Z", value: 2 });

    expect(useTestStore.getState().actions.get("a")?.value).toBe(2);
  });

  it("merge keeps the current entity when incoming is older (unsynced local write wins)", () => {
    useTestStore
      .getState()
      .actions.upsert({ id: "a", updatedAt: "2026-01-02T00:00:00.000Z", value: 1 });

    useTestStore
      .getState()
      .actions.merge({ id: "a", updatedAt: "2026-01-01T00:00:00.000Z", value: 2 });

    expect(useTestStore.getState().actions.get("a")?.value).toBe(1);
  });

  it("merge adds the entity when there is no current counterpart", () => {
    useTestStore
      .getState()
      .actions.merge({ id: "a", updatedAt: "2026-01-01T00:00:00.000Z", value: 1 });

    expect(useTestStore.getState().actions.get("a")?.value).toBe(1);
  });

  it("mergeMany applies merge semantics per entity", () => {
    useTestStore
      .getState()
      .actions.upsert({ id: "a", updatedAt: "2026-01-02T00:00:00.000Z", value: 1 });

    useTestStore.getState().actions.mergeMany([
      { id: "a", updatedAt: "2026-01-01T00:00:00.000Z", value: 99 }, // stale, ignored
      { id: "b", updatedAt: "2026-01-01T00:00:00.000Z", value: 2 }, // new, added
    ]);

    expect(useTestStore.getState().actions.get("a")?.value).toBe(1);
    expect(useTestStore.getState().actions.get("b")?.value).toBe(2);
  });
});
