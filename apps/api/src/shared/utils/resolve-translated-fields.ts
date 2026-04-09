export function resolveTranslatedFields<
  T extends Record<string, string | null | undefined>,
>(primaryFields: T, publishedTranslation: Partial<T> | null): T {
  if (!publishedTranslation) return primaryFields;
  return Object.fromEntries(
    Object.entries(primaryFields).map(([key, value]) => [
      key,
      publishedTranslation[key as keyof T] ?? value,
    ]),
  ) as T;
}
