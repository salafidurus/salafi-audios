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
        roles: user.roles.map((role) => role.role),
        createdAt: user.createdAt.toISOString(),
        permissions: user.permissions.map((permission) => permission.permission),
      })),
      nextCursor,
      hasMore,
    };
  }
}
