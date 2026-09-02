import { Prisma } from '@sd/core-db';

/** search application module responsible for search error.utils behavior at the backend boundary. */
const TRIGRAM_ERROR_PATTERNS = [
  /pg_trgm/i,
  /similarity\s*\(/i,
  /gin_trgm_ops/i,
  /operator does not exist:.*%/i,
  /function .*similarity.* does not exist/i,
] as const;

/** Resolves is trigram search failure behavior while preserving the API boundary contract. */
export function isTrigramSearchFailure(error: Error): boolean {
  const message = error.message;
  if (error instanceof Prisma.PrismaClientKnownRequestError) {
    return TRIGRAM_ERROR_PATTERNS.some((pattern) => pattern.test(error.message));
  }
  return TRIGRAM_ERROR_PATTERNS.some((pattern) => pattern.test(message));
}
