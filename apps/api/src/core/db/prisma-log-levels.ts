/** Core API prisma log levels module providing shared backend infrastructure and authority-boundary services. */
/** API type describing the prisma log level contract. */
export type PrismaLogLevel = 'query' | 'warn' | 'error';

/** Resolves get prisma log levels behavior while preserving the API boundary contract. */
export function getPrismaLogLevels(logQueries: boolean): PrismaLogLevel[] {
  return logQueries ? ['query', 'warn', 'error'] : ['warn', 'error'];
}
