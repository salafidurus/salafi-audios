import { Injectable } from '@nestjs/common';
import { Prisma, UserRole } from '@sd/core-db';

import { PrismaService } from '../db/prisma.service';

/** NestJS user directory repository service or controller coordinating the API boundary for this responsibility. */
@Injectable()
/** Core API user directory.repository module providing shared backend infrastructure and authority-boundary services. */
// oxlint-disable-next-line anti-slop/require-tsdoc -- NestJS decorators separate the declaration from its TSDoc.
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
    const queryArgs = withUserCursor(baseQueryArgs, cursor);

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

function withUserCursor<T extends Prisma.UserFindManyArgs>(
  args: T,
  cursor?: string,
): T | (T & { cursor: { id: string }; skip: number }) {
  return cursor ? { ...args, cursor: { id: cursor }, skip: 1 } : args;
}

function isUserRole(value: string): value is UserRole {
  return USER_ROLES.has(value);
}

const USER_ROLES: ReadonlySet<string> = new Set(Object.values(UserRole));
