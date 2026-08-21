import { Prisma } from '@sd/core-db';

const TRIGRAM_ERROR_PATTERNS = [
  /pg_trgm/i,
  /similarity\s*\(/i,
  /gin_trgm_ops/i,
  /operator does not exist:.*%/i,
  /function .*similarity.* does not exist/i,
] as const;

export function isTrigramSearchFailure(error: Error): boolean {
  const message = error.message;
  if (error instanceof Prisma.PrismaClientKnownRequestError) {
    return TRIGRAM_ERROR_PATTERNS.some((pattern) => pattern.test(error.message));
  }
  return TRIGRAM_ERROR_PATTERNS.some((pattern) => pattern.test(message));
}
