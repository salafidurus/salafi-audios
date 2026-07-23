import { vi, describe, it, expect } from 'bun:test';
import { HomeRepo } from './home.repo';

describe('HomeRepo', () => {
  describe('getScholars', () => {
    it('orders scholars by most-recently-added, with no reference to isFeatured/isKibar', async () => {
      const findMany = vi.fn<any>().mockResolvedValue([]);
      const prisma = { scholar: { findMany } };
      const repo = new HomeRepo(prisma as any);

      await repo.getScholars();

      expect(findMany).toHaveBeenCalledTimes(1);
      const args = findMany.mock.calls?.[0]?.[0] as any;
      expect(args?.orderBy).toEqual({ createdAt: 'desc' });
      expect(args?.select).not.toHaveProperty('isFeatured');
      expect(args?.select).not.toHaveProperty('isKibar');
    });
  });
});
