import { createOutboxStore, type Outbox } from "@sd/core-sync";

import { createSqliteKvAdapter } from "@/core/sync/sqlite-kv-adapter";

export type DownloadOutboxPayload = {
  lectureId: string;
  audioUrl: string;
};

/**
 * Downloads outbox: queues offline-initiated download intent (start a
 * download while offline, actually fetch when connectivity returns) and
 * download-removal follow-through. Device-scoped rather than per-user like
 * progress/saved's outboxes — the local download registry itself isn't
 * user-scoped either, so there's no cross-user leakage concern here.
 */
export const downloadsOutbox: Outbox<DownloadOutboxPayload> = createOutboxStore(
  createSqliteKvAdapter(),
  "downloads",
);
