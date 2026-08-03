import { describe, expect, it, vi } from 'bun:test';

import { AccessService } from './access.service';

describe('AccessService', () => {
  it('groups normalized rows into multi-scholar and multi-locale grants', async () => {
    const prisma = {
      user: {
        findUnique: vi.fn().mockResolvedValue({
          accessVersion: 2,
          roles: [{ role: 'listener' }],
          accessGrants: [
            {
              target: 'translation',
              capability: 'translate',
              scholar: { slug: 'a' },
              locale: 'ar',
            },
            {
              target: 'translation',
              capability: 'translate',
              scholar: { slug: 'a' },
              locale: 'en',
            },
            {
              target: 'translation',
              capability: 'translate',
              scholar: { slug: 'b' },
              locale: 'ar',
            },
          ],
        }),
      },
      scholar: { findMany: vi.fn().mockResolvedValue([{ slug: 'a', name: 'Scholar A' }]) },
    };

    const result = await new AccessService(prisma as any).snapshot('user-1');

    expect(result.grants).toEqual([
      {
        target: 'translation',
        capability: 'translate',
        scholarSlugs: ['a', 'b'],
        locales: ['ar', 'en'],
      },
    ]);
    expect(result.roles).toEqual(['Translator']);
  });

  it('replaces grants only when the supplied version is current', async () => {
    const transaction = vi.fn(async (callback) =>
      callback({
        user: { updateMany: vi.fn().mockResolvedValue({ count: 1 }) },
        userAccessGrant: {
          deleteMany: vi.fn(),
          createMany: vi.fn(),
        },
      }),
    );
    const prisma = {
      user: { findUnique: vi.fn().mockResolvedValue({ id: 'user-1' }) },
      scholar: { findMany: vi.fn().mockResolvedValue([{ id: 'scholar-a', slug: 'a' }]) },
      $transaction: transaction,
    };
    const service = new AccessService(prisma as any);
    vi.spyOn(service, 'snapshot').mockResolvedValue({
      userId: 'user-1',
      version: 3,
      grants: [],
      roles: [],
      isSuperadmin: false,
      scholars: [],
    });

    await service.replace(
      'user-1',
      {
        version: 2,
        grants: [{ target: 'listing', capability: 'write', scholarSlugs: ['a'], locales: [] }],
      },
      'admin-1',
    );

    expect(transaction).toHaveBeenCalledTimes(1);
  });
});
