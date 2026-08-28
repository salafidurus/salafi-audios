/** Conflict-resolution module implementing the client/server timestamp contract. */
/** Timestamp contract used by client/server last-write-wins reconciliation. */
export type Timestamped = {
  /** ISO timestamp used to order competing representations of an entity. */
  updatedAt: string;
};

/**
 * Client-side counterpart of the LWW-by-`updatedAt` SQL pattern used server-side
 * (see `AudioRepository.bulkSync`'s `ON CONFLICT DO UPDATE ... CASE WHEN updatedAt > ...`).
 * On an exact tie, the incoming entity wins — a reconciling pull should be able to
 * confirm a write the client itself just made at the same instant.
 */
export function resolveLastWriteWins<T extends Timestamped>(
  current: T | undefined,
  incoming: T,
): T {
  if (!current) return incoming;
  return new Date(incoming.updatedAt).getTime() >= new Date(current.updatedAt).getTime()
    ? incoming
    : current;
}
