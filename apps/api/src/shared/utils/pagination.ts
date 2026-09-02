/**
 * Cursor-based pagination helper
 * Encodes/decodes cursors as base64 to make them opaque to clients
 */

/** Paginated API response containing items, cursor state, and exhaustion state. */
export interface PaginatedResult<T> {
  items: T[];
  nextCursor?: string;
  hasMore: boolean;
}

/** Resolves decode cursor behavior while preserving the API boundary contract. */
export function decodeCursor(cursor?: string): string | undefined {
  if (!cursor) return undefined;
  try {
    return Buffer.from(cursor, 'base64').toString('utf-8');
  } catch {
    return undefined;
  }
}

/** Resolves encode cursor behavior while preserving the API boundary contract. */
export function encodeCursor(value: string): string {
  return Buffer.from(value, 'utf-8').toString('base64');
}

/** Resolves build paginated result behavior while preserving the API boundary contract. */
export function buildPaginatedResult<T extends { id: string }>(
  items: T[],
  pageSize: number,
): PaginatedResult<T> {
  const hasMore = items.length > pageSize;
  const pageItems = hasMore ? items.slice(0, pageSize) : items;
  const nextCursor = hasMore ? encodeCursor(pageItems[pageItems.length - 1]!.id) : undefined;

  return {
    items: pageItems,
    nextCursor,
    hasMore,
  };
}
