import { openDB, type IDBPDatabase } from "idb";
import type { PersistedClient, Persister } from "@tanstack/react-query-persist-client";

const DB_NAME = "sd-query-cache";
const STORE_NAME = "cache";
const CACHE_KEY = "reactQueryCache";

let dbPromise: Promise<IDBPDatabase> | null = null;

function getDb(): Promise<IDBPDatabase> {
  if (!dbPromise) {
    dbPromise = openDB(DB_NAME, 1, {
      upgrade(db: any) {
        db.createObjectStore(STORE_NAME);
      },
    });
  }
  return dbPromise!;
}

export function createIdbPersister(): Persister {
  return {
    persistClient: async (client: PersistedClient) => {
      const db = await getDb();
      await db.put(STORE_NAME, client, CACHE_KEY);
    },
    restoreClient: async () => {
      try {
        const db = await getDb();
        return await db.get(STORE_NAME, CACHE_KEY);
      } catch (error) {
        console.error("Failed to restore web query cache:", error);
        return undefined;
      }
    },
    removeClient: async () => {
      const db = await getDb();
      await db.delete(STORE_NAME, CACHE_KEY);
    },
  };
}
