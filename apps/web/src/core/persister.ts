import { deleteDB, openDB, type IDBPDatabase } from "idb";
import type { PersistedClient, Persister } from "@tanstack/react-query-persist-client";

const DB_NAME = "sd-query-cache";
const STORE_NAME = "cache";
const CACHE_KEY = "reactQueryCache";

let dbPromise: Promise<IDBPDatabase> | null = null;

function getDb(): Promise<IDBPDatabase> {
  if (!dbPromise) {
    dbPromise = openDB(DB_NAME, 1, {
      upgrade(db) {
        if (!db.objectStoreNames.contains(STORE_NAME)) {
          db.createObjectStore(STORE_NAME);
        }
      },
      blocked() {
        console.warn("IndexedDB open blocked, resetting connection");
      },
      blocking() {
        // Another tab is upgrading the database — release our connection
        // instead of blocking that upgrade indefinitely.
        dbPromise
          ?.then((db) => db.close())
          .catch(() => {
            // Ignore errors when closing DB
          });
        dbPromise = null;
      },
      terminated() {
        dbPromise = null;
      },
    });
  }
  return dbPromise;
}

export async function purgeQueryCacheDb(): Promise<void> {
  if (dbPromise) {
    try {
      const db = await dbPromise;
      db.close();
    } catch {
      // Ignore errors when closing DB
    }
    dbPromise = null;
  }
  if (typeof indexedDB !== "undefined") {
    try {
      // Await the deletion itself rather than firing indexedDB.deleteDatabase()
      // and returning immediately — a bare fire-and-forget call races any
      // connection opened right after (e.g. an immediate persistClient call
      // reopening the database mid-deletion).
      await deleteDB(DB_NAME, {
        blocked() {
          console.warn("IndexedDB deletion blocked by another open connection");
        },
      });
    } catch (error) {
      console.error("Failed to purge query cache database:", error);
    }
  }
}

export function createIdbPersister(): Persister {
  return {
    persistClient: async (client: PersistedClient) => {
      try {
        const db = await getDb();
        await db.put(STORE_NAME, client, CACHE_KEY);
      } catch (error) {
        console.error("Failed to persist web query cache:", error);
      }
    },
    restoreClient: async () => {
      try {
        const db = await getDb();
        return (await db.get(STORE_NAME, CACHE_KEY)) as PersistedClient | undefined;
      } catch (error) {
        console.error("Failed to restore web query cache:", error);
        return undefined;
      }
    },
    removeClient: async () => {
      try {
        const db = await getDb();
        await db.delete(STORE_NAME, CACHE_KEY);
      } catch (error) {
        console.error("Failed to remove web query cache:", error);
      }
    },
  };
}
