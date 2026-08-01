const UUID_PATTERN = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

/**
 * A Listing route param may be either its UUID `id` or its unique `slug` —
 * callers are encouraged to use the slug (readable in logs/URLs), but the
 * UUID keeps working since it's what's stored internally and returned in
 * some older client state. Use this to pick the right `where` clause.
 */
export function isListingUuid(value: string): boolean {
  return UUID_PATTERN.test(value);
}
