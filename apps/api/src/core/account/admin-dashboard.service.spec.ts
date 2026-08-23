import { describe, expect, it, vi } from 'bun:test';

import { AdminDashboardService } from './admin-dashboard.service';

describe('AdminDashboardService', () => {
  it("returns only metrics and records covered by the caller's scoped grants", async () => {
    const prisma = {
      scholar: { count: vi.fn().mockResolvedValue(1), findMany: vi.fn().mockResolvedValue([]) },
      listing: { count: vi.fn().mockResolvedValue(2), findMany: vi.fn().mockResolvedValue([]) },
      topic: { count: vi.fn().mockResolvedValue(0) },
      user: { count: vi.fn().mockResolvedValue(0) },
    } as any;
    const service = new AdminDashboardService(prisma);

    const result = await service.getDashboard({
      id: 'user-1',
      roles: ['admin'],
      accessGrants: [
        { target: 'listing', capability: 'write', scholarSlug: 'scholar-a', locale: null },
      ],
    });

    expect(result.metrics).toEqual({ listings: 2 });
    expect(prisma.listing.count).toHaveBeenCalledWith({
      where: { deletedAt: null, scholar: { slug: { in: ['scholar-a'] } } },
    });
    expect(prisma.scholar.count).not.toHaveBeenCalled();
    expect(result.activity).toEqual([]);
    expect(result.pendingWork).toEqual([]);
  });

  it('applies scholar-scoped grants to scholar slugs for counts and activity', async () => {
    const prisma = {
      scholar: {
        count: vi.fn().mockResolvedValue(1),
        findMany: vi.fn().mockResolvedValue([]),
      },
      listing: { count: vi.fn().mockResolvedValue(0), findMany: vi.fn().mockResolvedValue([]) },
      topic: { count: vi.fn().mockResolvedValue(0) },
      user: { count: vi.fn().mockResolvedValue(0) },
    } as any;
    const service = new AdminDashboardService(prisma);

    await service.getDashboard({
      id: 'user-1',
      roles: ['admin'],
      accessGrants: [
        { target: 'scholar', capability: 'write', scholarSlug: 'scholar-a', locale: null },
      ],
    });

    expect(prisma.scholar.count).toHaveBeenCalledWith({
      where: { slug: { in: ['scholar-a'] } },
    });
    expect(prisma.scholar.findMany).toHaveBeenCalledWith(
      expect.objectContaining({ where: { slug: { in: ['scholar-a'] } } }),
    );
  });
});
