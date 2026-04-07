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
}
