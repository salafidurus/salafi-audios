import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../shared/db/prisma.service';

@Injectable()
export class AdminPermissionsRepository {
  constructor(private readonly prisma: PrismaService) {}

  async findByUserId(userId: string) {
    return this.prisma.adminPermission.findMany({
      where: { userId },
      orderBy: { grantedAt: 'desc' },
    });
  }

  async grant(userId: string, permission: string, grantedById: string) {
    return this.prisma.adminPermission.upsert({
      where: { userId_permission: { userId, permission } },
      update: { grantedById },
      create: { userId, permission, grantedById },
    });
  }

  async revoke(userId: string, permission: string) {
    return this.prisma.adminPermission.delete({
      where: { userId_permission: { userId, permission } },
    });
  }

  async findPermissionStringsByUserId(userId: string): Promise<string[]> {
    const perms = await this.prisma.adminPermission.findMany({
      where: { userId },
      select: { permission: true },
      orderBy: { grantedAt: 'desc' },
    });
    return perms.map((p) => p.permission);
  }

  async hasPermission(userId: string, permission: string): Promise<boolean> {
    const found = await this.prisma.adminPermission.findUnique({
      where: { userId_permission: { userId, permission } },
    });
    return !!found;
  }

  async hasAnyPermission(userId: string): Promise<boolean> {
    const count = await this.prisma.adminPermission.count({
      where: { userId },
    });
    return count > 0;
  }

  async listUsers(query?: string, role?: string) {
    const where: any = {};

    // Add search filter (name or email)
    if (query) {
      where.OR = [
        { name: { contains: query, mode: 'insensitive' as const } },
        { email: { contains: query, mode: 'insensitive' as const } },
      ];
    }

    // Add role filter (silently ignore invalid values with warning)
    if (role) {
      const validRoles = ['user', 'admin', 'editor', 'superadmin'];
      if (validRoles.includes(role)) {
        where.role = role;
      } else {
        // Log warning for invalid role but continue processing
        console.warn(
          `[AdminPermissionsRepo] Invalid role filter value: "${role}". Valid values: ${validRoles.join(', ')}`,
        );
      }
    }

    const [users, total] = await Promise.all([
      this.prisma.user.findMany({
        where,
        include: {
          adminPermissions: {
            select: { permission: true },
          },
        },
        orderBy: { createdAt: 'desc' as const },
      }),
      this.prisma.user.count({ where }),
    ]);

    return { users, total };
  }
}
