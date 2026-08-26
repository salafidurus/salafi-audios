import * as SQLite from "expo-sqlite";

const DB_NAME = "sd-downloads.db";
const TABLE_NAME = "downloads";

export type DownloadStatus = "pending" | "downloading" | "paused" | "complete" | "error";

export type DownloadRow = {
  listingSlug: string;
  url: string;
  localUri: string | null;
  status: DownloadStatus;
  bytesTotal: number;
  bytesDownloaded: number;
  /** Serialized `DownloadPauseState`, present only while paused. */
  pauseState: string | null;
  createdAt: number;
  updatedAt: number;
};

let dbPromise: Promise<SQLite.SQLiteDatabase> | null = null;

function getDb(): Promise<SQLite.SQLiteDatabase> {
  if (!dbPromise) {
    dbPromise = (async () => {
      const db = await SQLite.openDatabaseAsync(DB_NAME);
      await db.execAsync(
        `CREATE TABLE IF NOT EXISTS ${TABLE_NAME} (
          listingSlug TEXT PRIMARY KEY,
          url TEXT NOT NULL,
          localUri TEXT,
          status TEXT NOT NULL,
          bytesTotal INTEGER NOT NULL DEFAULT 0,
          bytesDownloaded INTEGER NOT NULL DEFAULT 0,
          pauseState TEXT,
          createdAt INTEGER NOT NULL,
          updatedAt INTEGER NOT NULL
        )`,
      );
      // Existing installs may still have the pre-slug primary-key column.
      // Renaming it preserves downloaded rows while allowing all new queries
      // and writes to use the public listing identity.
      try {
        await db.execAsync(`ALTER TABLE ${TABLE_NAME} RENAME COLUMN listingId TO listingSlug`);
      } catch {
        // New databases already have listingSlug; SQLite reports an expected
        // error when there is no legacy column to rename.
      }
      return db;
    })();
  }
  return dbPromise;
}

/** Genuinely relational/queryable data, so this goes through raw SQLite rather
 * than `@sd/core-sync`'s KV `StorageAdapter` (that abstraction is for the
 * outbox and progress/saved caches, not a row-per-download registry). */
export async function upsertDownload(
  row: Partial<Omit<DownloadRow, "listingSlug" | "createdAt" | "updatedAt">> & {
    listingSlug: string;
  },
): Promise<void> {
  const [db, existing] = await Promise.all([getDb(), getDownload(row.listingSlug)]);

  const merged: DownloadRow = {
    listingSlug: row.listingSlug,
    url: row.url ?? existing?.url ?? "",
    localUri: row.localUri !== undefined ? row.localUri : (existing?.localUri ?? null),
    status: row.status ?? existing?.status ?? "pending",
    bytesTotal: row.bytesTotal ?? existing?.bytesTotal ?? 0,
    bytesDownloaded: row.bytesDownloaded ?? existing?.bytesDownloaded ?? 0,
    pauseState: row.pauseState !== undefined ? row.pauseState : (existing?.pauseState ?? null),
    createdAt: existing?.createdAt ?? Date.now(),
    updatedAt: Date.now(),
  };

  await db.runAsync(
    `INSERT OR REPLACE INTO ${TABLE_NAME}
      (listingSlug, url, localUri, status, bytesTotal, bytesDownloaded, pauseState, createdAt, updatedAt)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    merged.listingSlug,
    merged.url,
    merged.localUri,
    merged.status,
    merged.bytesTotal,
    merged.bytesDownloaded,
    merged.pauseState,
    merged.createdAt,
    merged.updatedAt,
  );
}

export async function getDownload(listingSlug: string): Promise<DownloadRow | null> {
  const db = await getDb();
  const row = await db.getFirstAsync<DownloadRow>(
    `SELECT * FROM ${TABLE_NAME} WHERE listingSlug = ?`,
    listingSlug,
  );
  return row ?? null;
}

export async function getAllDownloads(): Promise<DownloadRow[]> {
  const db = await getDb();
  return db.getAllAsync<DownloadRow>(`SELECT * FROM ${TABLE_NAME}`);
}

export async function removeDownload(listingSlug: string): Promise<void> {
  const db = await getDb();
  await db.runAsync(`DELETE FROM ${TABLE_NAME} WHERE listingSlug = ?`, listingSlug);
}
