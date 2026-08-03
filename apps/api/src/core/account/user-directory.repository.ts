import { Injectable } from '@nestjs/common';

import { PrismaService } from '../db/prisma.service';

@Injectable()
export class UserDirectoryRepository {
  constructor(private readonly prisma: PrismaService) {}

  async listUsers(query?: string, role?: string, cursor?: string) {
    const pageSize = 50;
    const where: Record<string, unknown> = {};

    if (query) {
      where.OR = [
        { name: { contains: query, mode: 'insensitive' } },
        { email: { contains: query, mode: 'insensitive' } },
      ];
    }

    const validRoles = ['listener', 'scholar', 'translator', 'editor', 'admin', 'superadmin'];
    if (role && validRoles.includes(role)) {
      where.roles = { some: { role } };
    }

    const users = await this.prisma.user.findMany({
      where,
      take: pageSize + 1,
      ...(cursor ? { cursor: { id: cursor }, skip: 1 } : {}),
      include: {
        permissions: { select: { permission: true } },
        roles: { select: { role: true } },
      },
      orderBy: { createdAt: 'desc' },
    });

    const hasMore = users.length > pageSize;
    const paginatedUsers = hasMore ? users.slice(0, pageSize) : users;
    return {
      users: paginatedUsers,
      nextCursor: hasMore ? paginatedUsers.at(-1)?.id : undefined,
      hasMore,
    };
  }
}
