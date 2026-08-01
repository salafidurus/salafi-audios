export function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

export function deriveChildSlug(parentSlug: string, title: string): string {
  const fragment = slugify(title);
  return fragment ? `${parentSlug}-${fragment}` : parentSlug;
}
