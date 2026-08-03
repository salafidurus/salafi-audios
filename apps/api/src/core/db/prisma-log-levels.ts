export type PrismaLogLevel = 'query' | 'warn' | 'error';

export function getPrismaLogLevels(logQueries: boolean): PrismaLogLevel[] {
  return logQueries ? ['query', 'warn', 'error'] : ['warn', 'error'];
}
