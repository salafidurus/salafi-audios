import { Injectable } from '@nestjs/common';

import { UserDirectoryRepository } from './user-directory.repository';

@Injectable()
export class UserDirectoryService {
  constructor(private readonly repository: UserDirectoryRepository) {}

  async listUsers(query?: string, role?: string, cursor?: string) {
    const { users, nextCursor, hasMore } = await this.repository.listUsers(query, role, cursor);
    return {
      users: users.map((user) => ({
        id: user.id,
        name: user.name,
        email: user.email,
        image: user.image,
        roles: deriveAccessRoles(user),
        createdAt: user.createdAt.toISOString(),
      })),
      nextCursor,
      hasMore,
    };
  }
}

function deriveAccessRoles(user: {
  roles: Array<{ role: string }>;
  accessGrants: Array<{ target: string; capability: string }>;
}): string[] {
  const roles = new Set<string>();
  if (user.roles.some((role) => role.role === 'superadmin')) roles.add('Superadmin');
  if (user.accessGrants.some((grant) => grant.capability === 'write')) roles.add('Editor');
  if (user.accessGrants.some((grant) => grant.capability === 'translate')) roles.add('Translator');
  if (user.accessGrants.some((grant) => grant.capability === 'publish')) roles.add('Publisher');
  if (user.accessGrants.some((grant) => grant.capability === 'delete')) roles.add('Deleter');
  if (user.accessGrants.some((grant) => grant.target === 'user' && grant.capability === 'manage')) {
    roles.add('User manager');
  }
  return [...roles].sort();
}
