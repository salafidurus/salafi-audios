import * as SQLite from "expo-sqlite";
import type { PersistedClient, Persister } from "@tanstack/react-query-persist-client";

const DB_NAME = "sd-query-cache.db";
const TABLE_NAME = "query_cache";
const CACHE_KEY = "reactQueryCache";

let dbPromise: Promise<SQLite.SQLiteDatabase> | null = null;

function getDb(): Promise<SQLite.SQLiteDatabase> {
  if (!dbPromise) {
    dbPromise = (async () => {
      const db = await SQLite.openDatabaseAsync(DB_NAME);
      await db.execAsync(
        `CREATE TABLE IF NOT EXISTS ${TABLE_NAME} (key TEXT PRIMARY KEY, value TEXT NOT NULL, timestamp INTEGER NOT NULL)`,
      );
      return db;
    })();
  }
  return dbPromise;
}

export function createSqlitePersister(): Persister {
  return {
    persistClient: async (client: PersistedClient) => {
      try {
        const db = await getDb();
        const value = JSON.stringify(client);
        await db.runAsync(
          `INSERT OR REPLACE INTO ${TABLE_NAME} (key, value, timestamp) VALUES (?, ?, ?)`,
          CACHE_KEY,
          value,
          client.timestamp,
        );
      } catch (error) {
        console.error("Failed to persist sqlite query cache:", error);
      }
    },
    restoreClient: async () => {
      try {
        const db = await getDb();
        const row = await db.getFirstAsync<{ value: string }>(
          `SELECT value FROM ${TABLE_NAME} WHERE key = ?`,
          CACHE_KEY,
        );
        return row ? (JSON.parse(row.value) as PersistedClient) : undefined;
      } catch (error) {
        console.error("Failed to restore sqlite query cache:", error);
        return undefined; // Graceful degradation (fresh load) on corruption
      }
    },
    removeClient: async () => {
      try {
        const db = await getDb();
        await db.runAsync(`DELETE FROM ${TABLE_NAME} WHERE key = ?`, CACHE_KEY);
      } catch (error) {
        console.error("Failed to remove sqlite query cache:", error);
      }
    },
  };
}
