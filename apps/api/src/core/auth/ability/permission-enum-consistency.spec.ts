import { describe, it, expect } from 'bun:test';
import { Permission as PrismaPermission } from '@sd/core-db';
import { Permissions as ContractPermissions } from '@sd/core-contracts';
import { PERMISSION_ACTION_MAP } from './permission-action-map';

/**
 * Guards against drift between the three places the Permission taxonomy is
 * declared: the Prisma enum (DB source of truth), the contracts-side Zod
 * enum consumed by web/native, and this ability engine's action map. Past
 * drift here has caused real operational pain (see the stale-enum $queryRaw
 * fallback in permissions.repository.ts) — this test fails loudly instead.
 */
describe('Permission enum consistency', () => {
  it('Prisma Permission enum and @sd/core-contracts Permissions match exactly', () => {
    const prismaValues = new Set(Object.values(PrismaPermission));
    const contractValues = new Set(Object.values(ContractPermissions));
    expect(contractValues).toEqual(prismaValues);
  });

  it('every Permission has an entry in the CASL permission-action map', () => {
    const prismaValues = Object.values(PrismaPermission);
    for (const permission of prismaValues) {
      expect(PERMISSION_ACTION_MAP).toHaveProperty(permission);
    }
  });
});
