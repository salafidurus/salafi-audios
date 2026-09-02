/** Builds the stable DOM id used to deep-link to a content item. */
/** Prefixes an item identifier so links target the content-item anchor namespace. */
export function contentItemAnchorId(itemId: string): string {
  return `content-item-${itemId}`;
}
