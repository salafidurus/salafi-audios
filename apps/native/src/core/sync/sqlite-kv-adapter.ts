import type { StorageAdapter } from "@sd/core-sync";

import * as SQLite from "expo-sqlite";

const DB_NAME = "sd-sync.db";
const TABLE_NAME = "kv_store";

let dbPromise: Promise<SQLite.SQLiteDatabase> | null = null;

function getDb(): Promise<SQLite.SQLiteDatabase> {
  if (!dbPromise) {
    dbPromise = (async () => {
      const db = await SQLite.openDatabaseAsync(DB_NAME);
      await db.execAsync(
        `CREATE TABLE IF NOT EXISTS ${TABLE_NAME} (key TEXT PRIMARY KEY, value TEXT NOT NULL)`,
      );
      return db;
    })();
  }
  return dbPromise;
}

/**
 * `@sd/core-sync` `StorageAdapter` backed by a dedicated `expo-sqlite` key/value
 * table — separate from `apps/native/src/core/persister.ts`'s (removed) React
 * Query cache DB, since this stores small sync-critical blobs (progress retry
 * queue, saved/library outbox) that must survive an app restart/crash.
 */
export function createSqliteKvAdapter(): StorageAdapter {
  return {
    getItem: async (key) => {
      const db = await getDb();
      const row = await db.getFirstAsync<{ value: string }>(
        `SELECT value FROM ${TABLE_NAME} WHERE key = ?`,
        key,
      );
      return row ? row.value : null;
    },
    setItem: async (key, value) => {
      const db = await getDb();
      await db.runAsync(
        `INSERT OR REPLACE INTO ${TABLE_NAME} (key, value) VALUES (?, ?)`,
        key,
        value,
      );
    },
    removeItem: async (key) => {
      const db = await getDb();
      await db.runAsync(`DELETE FROM ${TABLE_NAME} WHERE key = ?`, key);
    },
  };
}
