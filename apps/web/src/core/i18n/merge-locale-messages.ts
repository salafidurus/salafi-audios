export function mergeLocaleMessages<T extends Record<string, unknown>>(
  shared: T,
  overrides: Partial<T>,
): T {
  const result = { ...shared };
  for (const key of Object.keys(overrides) as (keyof T)[]) {
    const sharedVal = shared[key];
    const overrideVal = overrides[key];
    if (
      typeof sharedVal === "object" &&
      sharedVal !== null &&
      typeof overrideVal === "object" &&
      overrideVal !== null &&
      !Array.isArray(sharedVal)
    ) {
      result[key] = mergeLocaleMessages(
        sharedVal as Record<string, unknown>,
        overrideVal as Partial<Record<string, unknown>>,
      ) as T[keyof T];
    } else if (overrideVal !== undefined) {
      result[key] = overrideVal as T[keyof T];
    }
  }
  return result;
}
