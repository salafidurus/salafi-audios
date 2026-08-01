export type { StorageAdapter } from "./storage/storage-adapter";

export {
  createEntityStore,
  type SyncableEntity,
  type EntityStoreState,
} from "./store/entity-store";

export { resolveLastWriteWins, type Timestamped } from "./conflict/last-write-wins";

export { createOutboxStore, type Outbox, type OutboxEntry } from "./outbox/outbox.store";
export { drainOutbox, type DrainResult } from "./outbox/outbox.drain";

export { createSyncEngine, type SyncEngine, type SyncEngineOptions } from "./sync/sync-engine";
