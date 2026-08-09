import { create, type StoreApi, type UseBoundStore } from "zustand";

import { resolveLastWriteWins } from "../conflict/last-write-wins";

/**
 * Minimum shape every entity managed by `createEntityStore` must have: an id to
 * key on, an `updatedAt` for LWW conflict resolution, and an optional `deletedAt`
 * tombstone so removals can propagate through delta sync instead of silently
 * vanishing (see `FavoriteListing`'s planned `deletedAt` column).
 */
export type SyncableEntity = {
  id: string;
  updatedAt: string;
  deletedAt?: string;
};

export type EntityStoreState<T extends SyncableEntity> = {
  entities: Record<string, T>;
  actions: {
    /** Unconditional overwrite — used for known-fresh local writes. */
    upsert: (entity: T) => void;
    upsertMany: (entities: T[]) => void;
    /** Hard-removes from local state. This is cache eviction, not a sync-visible tombstone. */
    remove: (id: string) => void;
    get: (id: string) => T | undefined;
    /** All known entities, including tombstoned ones. */
    getAll: () => T[];
    /** Entities that are not tombstoned (`deletedAt` unset). */
    getActive: () => T[];
    /** Last-write-wins merge — used when reconciling server-pulled data with local state. */
    merge: (entity: T) => void;
    mergeMany: (entities: T[]) => void;
  };
};

export function createEntityStore<T extends SyncableEntity>(): UseBoundStore<
  StoreApi<EntityStoreState<T>>
> {
  return create<EntityStoreState<T>>((set, get) => ({
    entities: {},

    actions: {
      upsert: (entity) =>
        set((state) => ({ entities: { ...state.entities, [entity.id]: entity } })),

      upsertMany: (entities) =>
        set((state) => {
          const next = { ...state.entities };
          for (const entity of entities) next[entity.id] = entity;
          return { entities: next };
        }),

      remove: (id) =>
        set((state) => {
          const { [id]: _removed, ...rest } = state.entities;
          return { entities: rest };
        }),

      get: (id) => get().entities[id],

      getAll: () => Object.values(get().entities),

      getActive: () => Object.values(get().entities).filter((entity) => !entity.deletedAt),

      merge: (entity) =>
        set((state) => {
          const resolved = resolveLastWriteWins(state.entities[entity.id], entity);
          return { entities: { ...state.entities, [entity.id]: resolved } };
        }),

      mergeMany: (entities) =>
        set((state) => {
          const next = { ...state.entities };
          for (const entity of entities) {
            next[entity.id] = resolveLastWriteWins(next[entity.id], entity);
          }
          return { entities: next };
        }),
    },
  }));
}
