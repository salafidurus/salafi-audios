/** Documents this module's responsibility and public boundary. */
/** Converts arbitrary text into a normalized URL-safe slug. */
export function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

/** Builds a child slug while preserving the parent slug when the title has no slug fragment. */
export function deriveChildSlug(parentSlug: string, title: string): string {
  const fragment = slugify(title);
  return fragment ? `${parentSlug}-${fragment}` : parentSlug;
}
