export function toOptional<T>(value: T | null | undefined): T | undefined {
  return value ?? undefined;
}
