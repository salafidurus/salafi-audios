/** Shared API to optional utilities and boundary definitions used by backend modules. */
/** Resolves to optional behavior while preserving the API boundary contract. */
export function toOptional<T>(value: T | null | undefined): T | undefined {
  return value ?? undefined;
}
