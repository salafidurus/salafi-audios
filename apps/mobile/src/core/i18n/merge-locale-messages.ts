/** Deep-merge locale override objects into the shared base. Shared keys remain the baseline; override leaves replace only the overlapping keys. */
export function mergeLocaleMessages<T extends Record<string, unknown>>(
  shared: T,
  overrides: Partial<T>,
): T {
  const result = { ...shared };
  for (const key of Object.keys(overrides) as Array<keyof T>) {
    const base = shared[key];
    const override = overrides[key];
    if (
      base !== null &&
      typeof base === "object" &&
      !Array.isArray(base) &&
      override !== null &&
      typeof override === "object" &&
      !Array.isArray(override)
    ) {
      result[key] = mergeLocaleMessages(
        base as Record<string, unknown>,
        override as Record<string, unknown>,
      ) as T[typeof key];
    } else if (override !== undefined) {
      result[key] = override as T[typeof key];
    }
  }
  return result;
}
