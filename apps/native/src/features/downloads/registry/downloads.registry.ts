import * as SQLite from "expo-sqlite";

/** Implements the native offline-download lifecycle, persistence, and synchronization boundary. */
const DB_NAME = "sd-downloads.db";
const TABLE_NAME = "downloads";

/** Enumerates the lifecycle values used by the native download workflow. */
export type DownloadStatus = "pending" | "downloading" | "paused" | "complete" | "error";

/** Defines the native download row contract shared by its consumers. */
export type DownloadRow = {
  /** Carries the canonical lecture identity used to reconcile local and remote state. */
  listingSlug: string;
  url: string;
  localUri: string | null;
  /** Records the lifecycle state used to decide which transition or UI state is valid. */
  status: DownloadStatus;
  bytesTotal: number;
  bytesDownloaded: number;
  /** Serialized `DownloadPauseState`, present only while paused. */
  pauseState: string | null;
  /** Records when the local record was created, preserving ordering and reconciliation metadata. */
  createdAt: number;
  /** Records the last local update used when reconciling persisted state. */
  updatedAt: number;
};

type DownloadUpdate = Partial<Omit<DownloadRow, "listingSlug" | "createdAt" | "updatedAt">> & {
  /** Carries the canonical lecture identity used to reconcile local and remote state. */
  listingSlug: string;
};

function keepDefined<T>(value: T | undefined, previous: T): T {
  return value === undefined ? previous : value;
}

function mergeDownloadRow(row: DownloadUpdate, existing: DownloadRow | null): DownloadRow {
  const previous = existing ?? {
    listingSlug: row.listingSlug,
    url: "",
    localUri: null,
    status: "pending" as const,
    bytesTotal: 0,
    bytesDownloaded: 0,
    pauseState: null,
    createdAt: Date.now(),
    updatedAt: Date.now(),
  };
  return {
    listingSlug: row.listingSlug,
    url: row.url ?? previous.url,
    localUri: keepDefined(row.localUri, previous.localUri),
    status: row.status ?? previous.status,
    bytesTotal: row.bytesTotal ?? previous.bytesTotal,
    bytesDownloaded: row.bytesDownloaded ?? previous.bytesDownloaded,
    pauseState: keepDefined(row.pauseState, previous.pauseState),
    createdAt: previous.createdAt,
    updatedAt: Date.now(),
  };
}

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
export async function upsertDownload(row: DownloadUpdate): Promise<void> {
  const [db, existing] = await Promise.all([getDb(), getDownload(row.listingSlug)]);
  const merged = mergeDownloadRow(row, existing);

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

/** Loads one persisted download row by its canonical lecture identity. */
export async function getDownload(listingSlug: string): Promise<DownloadRow | null> {
  const db = await getDb();
  const row = await db.getFirstAsync<DownloadRow>(
    `SELECT * FROM ${TABLE_NAME} WHERE listingSlug = ?`,
    listingSlug,
  );
  return row ?? null;
}

/** Returns every persisted download row for offline-library reconciliation. */
export async function getAllDownloads(): Promise<DownloadRow[]> {
  const db = await getDb();
  return db.getAllAsync<DownloadRow>(`SELECT * FROM ${TABLE_NAME}`);
}

/** Deletes the persisted download row for a canonical lecture identity. */
export async function removeDownload(listingSlug: string): Promise<void> {
  const db = await getDb();
  await db.runAsync(`DELETE FROM ${TABLE_NAME} WHERE listingSlug = ?`, listingSlug);
}
