import { Injectable } from '@nestjs/common';
import { Prisma, UserRole } from '@sd/core-db';

import { PrismaService } from '../db/prisma.service';

@Injectable()
export class UserDirectoryRepository {
  constructor(private readonly prisma: PrismaService) {}

  async listUsers(query?: string, role?: string, cursor?: string) {
    const pageSize = 50;
    const where: Prisma.UserWhereInput = {};

    if (query) {
      where.OR = [
        { name: { contains: query, mode: 'insensitive' } },
        { email: { contains: query, mode: 'insensitive' } },
      ];
    }

    if (role && isUserRole(role)) {
      where.roles = { some: { role } };
    }

    const baseQueryArgs = {
      where,
      take: pageSize + 1,
      include: {
        roles: { select: { role: true } },
        accessGrants: { select: { target: true, capability: true } },
      },
      orderBy: { createdAt: 'desc' },
    } satisfies Prisma.UserFindManyArgs;
    const queryArgs = cursor
      ? { ...baseQueryArgs, cursor: { id: cursor }, skip: 1 }
      : baseQueryArgs;

    const users = await this.prisma.user.findMany(queryArgs);

    const hasMore = users.length > pageSize;
    const paginatedUsers = hasMore ? users.slice(0, pageSize) : users;
    return {
      users: paginatedUsers,
      nextCursor: hasMore ? paginatedUsers.at(-1)?.id : undefined,
      hasMore,
    };
  }
}

function isUserRole(value: string): value is UserRole {
  return USER_ROLES.has(value);
}

const USER_ROLES: ReadonlySet<string> = new Set(Object.values(UserRole));
