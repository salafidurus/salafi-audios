import { PrismaService } from '../../src/shared/db/prisma.service';
import { Permission, UserRole } from '@sd/core-db';
import { createId } from '@paralleldrive/cuid2';

export class TestAuthFactory {
  constructor(private readonly prisma: PrismaService) {}

  async createUser(
    email?: string,
    roles: UserRole[] = [UserRole.listener],
    permissions: Permission[] = [],
  ) {
    const uniqueEmail = email ?? `e2e-test-${createId()}@salafidurus.com`;
    const user = await this.prisma.user.create({
      data: {
        name: 'E2E Test User',
        email: uniqueEmail,
        role: 'user',
        emailVerified: true,
      },
    });

    // Create role assignments
    if (roles.length > 0) {
      await this.prisma.userRoleAssignment.createMany({
        data: roles.map((role) => ({
          userId: user.id,
          role,
        })),
      });
    }

    // Create permissions
    if (permissions.length > 0) {
      await this.prisma.userPermission.createMany({
        data: permissions.map((permission) => ({
          userId: user.id,
          permission,
        })),
      });
    }

    // Insert Session directly into the DB to bypass OAuth redirects
    const token = `token-${createId()}`;
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 7); // expires in 7 days

    const session = await this.prisma.session.create({
      data: {
        token,
        userId: user.id,
        expiresAt,
      },
    });

    return {
      user,
      session,
      headers: {
        Authorization: `Bearer ${token}`,
      },
    };
  }

  async createAdminUser(permissions: Permission[] = []) {
    return this.createUser(undefined, [UserRole.admin], permissions);
  }
}
