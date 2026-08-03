import { describe, expect, it, vi } from 'bun:test';

import { AdminUsersController } from './admin-users.controller';

describe('AdminUsersController aggregate access routes', () => {
  it('delegates access snapshot reads', async () => {
    const accessService = { snapshot: vi.fn().mockResolvedValue({ userId: 'u1' }) };
    const controller = new AdminUsersController({} as any, accessService as any);

    await controller.getAccess('u1');

    expect(accessService.snapshot).toHaveBeenCalledWith('u1');
  });

  it('delegates versioned access replacement with the current admin', async () => {
    const accessService = { replace: vi.fn().mockResolvedValue({ userId: 'u1' }) };
    const controller = new AdminUsersController({} as any, accessService as any);
    const body = { version: 2, grants: [] };

    await controller.replaceAccess('u1', body as any, { id: 'admin-1' });

    expect(accessService.replace).toHaveBeenCalledWith('u1', body, 'admin-1');
  });
});
