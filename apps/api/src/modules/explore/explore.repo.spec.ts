import { vi, describe, it, expect } from 'bun:test';
import { ExploreRepo } from './explore.repo';

describe('ExploreRepo', () => {
  describe('scholar chip ordering', () => {
    it('orders scholar chips by most-recently-added, with no reference to isFeatured/isKibar', async () => {
      const findMany = vi.fn<any>().mockResolvedValue([]);
      const prisma = { scholar: { findMany } };
      const repo = new ExploreRepo(prisma as any);

      await (repo as any).fetchScholarChips('en', 8);

      expect(findMany).toHaveBeenCalledTimes(1);
      const args = findMany.mock.calls[0][0];
      expect(args.orderBy).toEqual({ createdAt: 'desc' });
      expect(args.select).not.toHaveProperty('isFeatured');
      expect(args.select).not.toHaveProperty('isKibar');
    });
  });
});
