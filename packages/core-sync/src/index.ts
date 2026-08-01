export type { StorageAdapter } from "./storage/storage-adapter";

export {
  createEntityStore,
  type SyncableEntity,
  type EntityStoreState,
} from "./store/entity-store";

export { resolveLastWriteWins, type Timestamped } from "./conflict/last-write-wins";
