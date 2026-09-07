import { describe, expect, it, vi } from 'bun:test';
import { ScholarFollowService } from './scholar-follow.service';

describe('ScholarFollowService', () => {
  it('reports the current follow state', async () => {
    const prisma = {
      scholar: { findUnique: vi.fn().mockResolvedValue({ id: 'scholar-1', slug: 'imam-nawawi' }) },
      scholarFollow: { findUnique: vi.fn().mockResolvedValue({}) },
    };
    const service = new ScholarFollowService(prisma as never, undefined);

    await expect(service.getStatus('user-1', 'imam-nawawi')).resolves.toEqual({
      scholarSlug: 'imam-nawawi',
      following: true,
    });
  });

  it('returns the transition result and is safe to call repeatedly', async () => {
    const transaction = {
      scholar: { findUnique: vi.fn().mockResolvedValue({ id: 'scholar-1', slug: 'imam-nawawi' }) },
      scholarFollow: {
        findUnique: vi.fn().mockResolvedValue(null),
        upsert: vi.fn().mockResolvedValue({}),
      },
    };
    const prisma = {
      $transaction: vi.fn(async (callback: (tx: typeof transaction) => unknown) =>
        callback(transaction),
      ),
    };
    const service = new ScholarFollowService(prisma as never, undefined);

    await expect(service.follow('user-1', 'imam-nawawi')).resolves.toEqual({
      scholarSlug: 'imam-nawawi',
      following: true,
    });
    expect(transaction.scholarFollow.upsert).toHaveBeenCalledTimes(1);
  });
});
