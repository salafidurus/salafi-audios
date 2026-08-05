import { describe, expect, it } from 'bun:test';
import { getPrismaLogLevels } from './prisma-log-levels';

describe('getPrismaLogLevels', () => {
  it('keeps query logging disabled by default', () => {
    expect(getPrismaLogLevels(false)).toEqual(['warn', 'error']);
  });

  it('enables query logging only when explicitly requested', () => {
    expect(getPrismaLogLevels(true)).toEqual(['query', 'warn', 'error']);
  });
});
