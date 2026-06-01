import { useOutboxStore } from "./outbox.store";

/**
 * Drain the outbox: attempt to send all queued mutations to backend.
 * Call this on app foreground or network reconnect.
 */
export async function drainOutbox(): Promise<void> {
  const { actions } = useOutboxStore.getState();
  await actions.drain();
}

/**
 * Enqueue a mutation for later sync.
 * Use when the device may be offline.
 */
export function enqueueOutboxMutation(type: string, payload: unknown): void {
  const { actions } = useOutboxStore.getState();
  actions.enqueue(type, payload);
}
