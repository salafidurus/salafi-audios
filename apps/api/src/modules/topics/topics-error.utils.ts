import { Prisma } from '@sd/core-db';

const LEGACY_TOPIC_SCHEMA_PATTERNS = [
  /column .*parentId.* does not exist/i,
  /column .*createdAt.* does not exist/i,
  /The column `(?:parentId|createdAt)` does not exist/i,
] as const;

export function isLegacyTopicSchemaFailure(error: unknown): boolean {
  if (error instanceof Prisma.PrismaClientKnownRequestError) {
    return (
      error.code === 'P2022' ||
      LEGACY_TOPIC_SCHEMA_PATTERNS.some((pattern) => pattern.test(error.message))
    );
  }

  if (error instanceof Prisma.PrismaClientUnknownRequestError) {
    return LEGACY_TOPIC_SCHEMA_PATTERNS.some((pattern) =>
      pattern.test(error.message),
    );
  }

  if (error instanceof Error) {
    return LEGACY_TOPIC_SCHEMA_PATTERNS.some((pattern) =>
      pattern.test(error.message),
    );
  }

  return false;
}
