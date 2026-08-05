import { describe, expect, it, vi } from 'bun:test';
import type { PrismaService } from '../../src/core/db/prisma.service';
import { TestAuthFactory } from './test-auth.factory';

describe('TestAuthFactory.cleanup', () => {
  it('removes stale users matching the E2E email convention', async () => {
    const findMany = vi.fn().mockResolvedValue([{ id: 'stale-e2e-user' }]);
    const deleteMany = vi.fn().mockResolvedValue({ count: 1 });
    const prisma = {
      user: { findMany, deleteMany },
    } as unknown as PrismaService;

    await new TestAuthFactory(prisma).cleanup();

    expect(findMany).toHaveBeenCalledWith({
      where: {
        email: {
          startsWith: 'e2e-test-',
          endsWith: '@salafidurus.com',
        },
      },
      select: { id: true },
    });
    expect(deleteMany).toHaveBeenCalledWith({
      where: { id: { in: ['stale-e2e-user'] } },
    });
  });
});
