import type { QueryKey } from "@tanstack/react-query";

// 24 hours in milliseconds (intuitive multiplier)
export const DEFAULT_MAX_AGE = 24 * 60 * 60 * 1000;

export const QUERY_MAX_AGES: Record<string, number> = {};

export function getMaxAge(queryKey: readonly unknown[]): number {
  const key = queryKey[0] as string;
  return QUERY_MAX_AGES[key] ?? DEFAULT_MAX_AGE;
}

// Sensitive namespaces that must never be written to persistent storage
const SENSITIVE_PREFIXES: QueryKey[] = [["admin"], ["account"]];

export function shouldPersistQuery(queryKey: QueryKey): boolean {
  for (const prefix of SENSITIVE_PREFIXES) {
    if (queryKey.length >= prefix.length) {
      let match = true;
      for (let i = 0; i < prefix.length; i++) {
        if (queryKey[i] !== prefix[i]) {
          match = false;
          break;
        }
      }
      if (match) {
        return false;
      }
    }
  }
  return true;
}
