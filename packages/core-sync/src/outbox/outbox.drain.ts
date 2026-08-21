import type { Outbox, OutboxEntry, JsonValue } from "./outbox.store";

export type DrainResult = {
  succeeded: number;
  failed: number;
};

/**
 * Attempts to deliver every queued entry via `handler`. Entries whose handler
 * resolves are removed; entries whose handler rejects stay queued with an
 * incremented retry count for the next drain attempt.
 *
 * Guards against overlapping drains (e.g. an app-foreground trigger and a
 * network-reconnect trigger firing within the same tick) — a call made while
 * one is already in flight is a no-op that returns immediately.
 */
export async function drainOutbox<TPayload extends JsonValue>(
  outbox: Outbox<TPayload>,
  handler: (entry: OutboxEntry<TPayload>) => Promise<void>,
): Promise<DrainResult> {
  const { entries, isDraining, actions } = outbox.useOutboxStore.getState();

  if (isDraining || entries.length === 0) {
    return { succeeded: 0, failed: 0 };
  }

  actions.setDraining(true);
  const toProcess = [...entries];
  let succeeded = 0;
  let failed = 0;

  try {
    await Promise.all(
      toProcess.map(async (entry) => {
        try {
          await handler(entry);
          actions.remove(entry.id);
          succeeded++;
        } catch {
          actions.incrementRetry(entry.id);
          failed++;
        }
      }),
    );
  } finally {
    actions.setDraining(false);
  }

  return { succeeded, failed };
}
