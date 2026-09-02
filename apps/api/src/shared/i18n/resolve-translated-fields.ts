/** Shared API resolve translated fields utilities and boundary definitions used by backend modules. */
/** Resolves resolve translated fields behavior while preserving the API boundary contract. */
export function resolveTranslatedFields<T extends Record<string, string | null | undefined>>(
  primaryFields: T,
  publishedTranslation: Partial<T> | null,
): T {
  if (!publishedTranslation) return primaryFields;
  const resolved = { ...primaryFields };
  // SAFETY: `resolved` starts as a full copy of `primaryFields`, and this key
  // list is exactly the set of assignable keys on that object.
  const keys = Object.keys(primaryFields) as (keyof T)[];
  for (const key of keys) {
    resolved[key] = publishedTranslation[key] ?? primaryFields[key];
  }
  return resolved;
}
