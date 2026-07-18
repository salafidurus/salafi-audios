import { Injectable } from '@nestjs/common';
import type { Permission, ScholarPermissionType, UserRole } from '@sd/core-contracts';
import { ROLE_DEFAULT_PERMISSIONS } from '@sd/core-contracts';
import { PrismaService } from '../../shared/db/prisma.service';
import type { Locale } from '@sd/core-db';

/**
 * Permissions Repository
 *
 * Handles all database operations for permissions and roles management
 */
@Injectable()
export class PermissionsRepository {
  private readonly validPermissionsSet = new Set(ROLE_DEFAULT_PERMISSIONS.superadmin);

  constructor(private readonly prisma: PrismaService) {}

  // ========== UserRoleAssignment Operations ==========

  async findRoleAssignment(userId: string, role: UserRole) {
    return this.prisma.userRoleAssignment.findUnique({
      where: {
        userId_role: {
          userId,
          role,
        },
      },
    });
  }

  async createRoleAssignment(userId: string, role: UserRole, grantedBy: string) {
    return this.prisma.userRoleAssignment.create({
      data: {
        userId,
        role,
        grantedBy,
      },
    });
  }

  async deleteRoleAssignment(id: string) {
    return this.prisma.userRoleAssignment.delete({
      where: { id },
    });
  }

  async getUserRoles(userId: string): Promise<UserRole[]> {
    const roles = await this.prisma.userRoleAssignment.findMany({
      where: { userId },
      select: { role: true },
    });
    return roles.map((r) => r.role);
  }

  async hasRole(userId: string, role: UserRole): Promise<boolean> {
    const roleAssignment = await this.findRoleAssignment(userId, role);
    return !!roleAssignment;
  }

  // ========== UserPermission Operations ==========

  async findUserPermission(userId: string, permission: Permission) {
    return this.prisma.userPermission.findUnique({
      where: {
        userId_permission: {
          userId,
          permission,
        },
      },
    });
  }

  async createUserPermission(userId: string, permission: Permission, grantedBy: string) {
    return this.prisma.userPermission.create({
      data: {
        userId,
        permission,
        grantedBy,
      },
    });
  }

  async deleteUserPermission(id: string) {
    return this.prisma.userPermission.delete({
      where: { id },
    });
  }

  async getUserPermissions(userId: string): Promise<Permission[]> {
    const permissions = await this.prisma.userPermission.findMany({
      where: { userId },
      select: { permission: true },
    });
    return permissions.map((p) => p.permission);
  }

  async hasPermission(userId: string, permission: Permission): Promise<boolean> {
    const userPermission = await this.findUserPermission(userId, permission);
    return !!userPermission;
  }

  // ========== UserScholarRole Operations (Scholar Linking) ==========

  async findScholarLink(userId: string, scholarId: string, permissionType: ScholarPermissionType) {
    return this.prisma.userScholarRole.findFirst({
      where: {
        userId,
        scholarId,
        permissionType,
      },
    });
  }

  async findScholarLinkById(id: string) {
    return this.prisma.userScholarRole.findUnique({
      where: { id },
    });
  }

  async createScholarLink(
    userId: string,
    scholarId: string,
    permissionType: ScholarPermissionType,
    createdBy: string,
  ) {
    return this.prisma.userScholarRole.create({
      data: {
        userId,
        scholarId,
        permissionType,
        createdBy,
      },
    });
  }

  async deleteScholarLink(id: string) {
    return this.prisma.userScholarRole.delete({
      where: { id },
    });
  }

  async canAccessScholar(userId: string, scholarId: string): Promise<boolean> {
    const link = await this.prisma.userScholarRole.findFirst({
      where: {
        userId,
        scholarId,
      },
    });
    return !!link;
  }

  async getScholarsByUser(userId: string) {
    return this.prisma.userScholarRole.findMany({
      where: { userId },
    });
  }

  // ========== UserTranslatorRole Operations (Language Scoping) ==========

  async findTranslatorRole(userId: string, locale: Locale) {
    return this.prisma.userTranslatorRole.findUnique({
      where: {
        userId_locale: {
          userId,
          locale,
        },
      },
    });
  }

  async createTranslatorRole(
    userId: string,
    locale: Locale,
    canPublish: boolean,
    createdBy: string,
  ) {
    return this.prisma.userTranslatorRole.create({
      data: {
        userId,
        locale,
        canPublish,
        createdBy,
      },
    });
  }

  async deleteTranslatorRole(id: string) {
    return this.prisma.userTranslatorRole.delete({
      where: { id },
    });
  }

  async updateTranslatorPublishPermission(id: string, canPublish: boolean) {
    return this.prisma.userTranslatorRole.update({
      where: { id },
      data: { canPublish },
    });
  }

  async canTranslateToLocale(userId: string, locale: Locale): Promise<boolean> {
    const translatorRole = await this.findTranslatorRole(userId, locale);
    return !!translatorRole;
  }

  async canPublishTranslations(userId: string, locale: Locale): Promise<boolean> {
    const translatorRole = await this.findTranslatorRole(userId, locale);
    return translatorRole?.canPublish ?? false;
  }

  async getTranslatorLanguages(userId: string) {
    return this.prisma.userTranslatorRole.findMany({
      where: { userId },
    });
  }

  // ========== Verification Operations ==========

  async scholarExists(scholarId: string) {
    return this.prisma.scholar.findUnique({
      where: { id: scholarId },
    });
  }

  // ========== User Listing Operations ==========

  /**
   * List all users with optional filtering by name, email, or role
   * Returns user data with their permissions and roles included
   */
  async listUsers(query?: string, role?: string) {
    const where: any = {};

    // Add search filter (name or email)
    if (query) {
      where.OR = [
        { name: { contains: query, mode: 'insensitive' as const } },
        { email: { contains: query, mode: 'insensitive' as const } },
      ];
    }

    // Add role filter via UserRoleAssignment (silently ignore invalid values with warning)
    if (role) {
      const validRoles = ['listener', 'scholar', 'translator', 'editor', 'admin', 'superadmin'];
      if (validRoles.includes(role)) {
        where.roles = {
          some: { role },
        };
      } else {
        // Log warning for invalid role but continue processing
        console.warn(
          `[PermissionsRepository] Invalid role filter value: "${role}". Valid values: ${validRoles.join(', ')}`,
        );
      }
    }

    try {
      const [users, total] = await Promise.all([
        this.prisma.user.findMany({
          where,
          include: {
            permissions: {
              select: { permission: true },
            },
            roles: {
              select: { role: true },
            },
          },
          orderBy: { createdAt: 'desc' as const },
        }),
        this.prisma.user.count({ where }),
      ]);

      return { users, total };
    } catch (error) {
      // Fallback for stale/invalid enum values in permissions table
      if (error instanceof Error && error.message.includes('not found in enum')) {
        const [users, total] = await Promise.all([
          this.prisma.user.findMany({
            where,
            include: {
              roles: {
                select: { role: true },
              },
            },
            orderBy: { createdAt: 'desc' as const },
          }),
          this.prisma.user.count({ where }),
        ]);

        // Fetch permissions for each user using the graceful method
        const usersWithPermissions = await Promise.all(
          users.map(async (u) => ({
            ...u,
            permissions: (await this.findPermissionStringsByUserId(u.id)).map((p) => ({
              permission: p,
            })),
          })),
        );

        return { users: usersWithPermissions, total };
      }
      throw error;
    }
  }

  /**
   * Get permission strings for a user (ordered by grant date)
   * Filters out stale/invalid permissions that don't match current Permission enum
   */
  async findPermissionStringsByUserId(userId: string): Promise<Permission[]> {
    try {
      const perms = await this.prisma.userPermission.findMany({
        where: { userId },
        select: { permission: true },
        orderBy: { grantedAt: 'desc' },
      });
      return perms.map((p) => p.permission);
    } catch (error) {
      if (error instanceof Error && error.message.includes('not found in enum')) {
        const perms = await this.prisma.$queryRaw<Array<{ permission: string }>>`
          SELECT "permission" FROM "UserPermission"
          WHERE "userId" = ${userId}
          ORDER BY "grantedAt" DESC
        `;
        const validPermissions = new Set(ROLE_DEFAULT_PERMISSIONS.superadmin);
        return perms.reduce<Permission[]>((acc, p) => {
          if (validPermissions.has(p.permission as Permission)) {
            acc.push(p.permission as Permission);
          }
          return acc;
        }, []);
      }
      throw error;
    }
  }

  /**
   * Check if a user has any permissions at all
   */
  async hasAnyPermission(userId: string): Promise<boolean> {
    const count = await this.prisma.userPermission.count({
      where: { userId },
    });
    return count > 0;
  }

  /**
   * Get detailed permission information for a user (includes grantedAt and grantedBy)
   * Used by admin endpoints to show full permission audit trail
   * Filters out stale/invalid permissions that don't match current Permission enum
   */
  async getUserPermissionsDetail(userId: string) {
    try {
      return await this.prisma.userPermission.findMany({
        where: { userId },
        orderBy: { grantedAt: 'desc' },
      });
    } catch (error) {
      if (error instanceof Error && error.message.includes('not found in enum')) {
        const perms = await this.prisma.$queryRaw<
          Array<{
            id: string;
            userId: string;
            permission: string;
            grantedAt: Date;
            grantedBy: string | null;
          }>
        >`
          SELECT "id", "userId", "permission", "grantedAt", "grantedBy" FROM "UserPermission"
          WHERE "userId" = ${userId}
          ORDER BY "grantedAt" DESC
        `;
        return perms.flatMap((p) =>
          this.validPermissionsSet.has(p.permission as Permission)
            ? [
                {
                  id: p.id,
                  userId: p.userId,
                  permission: p.permission as Permission,
                  grantedAt: p.grantedAt,
                  grantedBy: p.grantedBy,
                },
              ]
            : [],
        );
      }
      throw error;
    }
  }

  /**
   * Get detailed role assignment information for a user (includes grantedAt and grantedBy)
   * Used by admin endpoints to show full role audit trail
   */
  async getUserRolesDetail(userId: string) {
    return this.prisma.userRoleAssignment.findMany({
      where: { userId },
      orderBy: { grantedAt: 'desc' },
    });
  }
}
