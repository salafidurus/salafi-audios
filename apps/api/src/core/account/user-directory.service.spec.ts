import { describe, expect, it, vi } from 'bun:test';

import { UserDirectoryService } from './user-directory.service';

describe('UserDirectoryService', () => {
  it('maps paginated users for the admin directory', async () => {
    const repository = {
      listUsers: vi.fn().mockResolvedValue({
        users: [
          {
            id: 'u1',
            name: 'User One',
            email: 'one@example.com',
            image: null,
            roles: [{ role: 'listener' }],
            accessGrants: [
              { target: 'listing', capability: 'write' },
              { target: 'translation', capability: 'translate' },
            ],
            createdAt: new Date('2026-01-01'),
          },
        ],
        nextCursor: undefined,
        hasMore: false,
      }),
    };

    const result = await new UserDirectoryService(repository as any).listUsers('one');

    expect(repository.listUsers).toHaveBeenCalledWith('one', undefined, undefined);
    expect(result.users[0]).toMatchObject({
      id: 'u1',
      roles: ['Editor', 'Translator'],
      createdAt: '2026-01-01T00:00:00.000Z',
    });
  });
});
