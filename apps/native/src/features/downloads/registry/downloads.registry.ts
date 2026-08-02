import * as SQLite from "expo-sqlite";

const DB_NAME = "sd-downloads.db";
const TABLE_NAME = "downloads";

export type DownloadStatus = "pending" | "downloading" | "paused" | "complete" | "error";

export type DownloadRow = {
  listingId: string;
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
          listingId TEXT PRIMARY KEY,
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
      return db;
    })();
  }
  return dbPromise;
}

/** Genuinely relational/queryable data, so this goes through raw SQLite rather
 * than `@sd/core-sync`'s KV `StorageAdapter` (that abstraction is for the
 * outbox and progress/saved caches, not a row-per-download registry). */
export async function upsertDownload(
  row: Partial<Omit<DownloadRow, "listingId" | "createdAt" | "updatedAt">> & { listingId: string },
): Promise<void> {
  const [db, existing] = await Promise.all([getDb(), getDownload(row.listingId)]);

  const merged: DownloadRow = {
    listingId: row.listingId,
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
      (listingId, url, localUri, status, bytesTotal, bytesDownloaded, pauseState, createdAt, updatedAt)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    merged.listingId,
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

export async function getDownload(listingId: string): Promise<DownloadRow | null> {
  const db = await getDb();
  const row = await db.getFirstAsync<DownloadRow>(
    `SELECT * FROM ${TABLE_NAME} WHERE listingId = ?`,
    listingId,
  );
  return row ?? null;
}

export async function getAllDownloads(): Promise<DownloadRow[]> {
  const db = await getDb();
  return db.getAllAsync<DownloadRow>(`SELECT * FROM ${TABLE_NAME}`);
}

export async function removeDownload(listingId: string): Promise<void> {
  const db = await getDb();
  await db.runAsync(`DELETE FROM ${TABLE_NAME} WHERE listingId = ?`, listingId);
}
