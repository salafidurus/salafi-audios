import { drainOutbox, type DrainResult } from "@sd/core-sync";

import { downloadsOutbox, type DownloadOutboxPayload } from "./outbox.store";

export type DownloadMutationHandler = (
  type: string,
  payload: DownloadOutboxPayload,
) => Promise<void>;

/**
 * Drains the downloads outbox: attempts to run every queued mutation via
 * `handler`, keyed by entry type. Call on app foreground or network
 * reconnect — the underlying `isDraining` guard makes concurrent calls from
 * both triggers a safe no-op (no duplicate drains if both fire together).
 */
export function drainDownloadsOutbox(handler: DownloadMutationHandler): Promise<DrainResult> {
  return drainOutbox(downloadsOutbox, (entry) => handler(entry.type, entry.payload));
}

/** Enqueue a mutation for later sync — use when the device may be offline. */
export function enqueueDownloadMutation(type: string, payload: DownloadOutboxPayload): void {
  downloadsOutbox.useOutboxStore.getState().actions.enqueue(type, payload);
}
