import { BadRequestException, Injectable } from '@nestjs/common';
import type { Permission, ScholarPermissionType, UserRole } from '@sd/core-contracts';
import { ROLE_DEFAULT_PERMISSIONS } from '@sd/core-contracts';
import { PrismaService } from '../db/prisma.service';
import type { Locale } from '@sd/core-db/client';

/**
 * Permissions Service
 *
 * Manages role and permission assignments, including:
 * - Granting/revoking roles (with automatic default permission assignment)
 * - Granting/revoking individual permissions
 * - Linking users to scholars (scoped editing)
 * - Linking users to translator languages (language-scoped translation)
 */
@Injectable()
export class PermissionsService {
  constructor(private readonly prisma: PrismaService) {}

  /**
   * Assign a role to a user
   * Automatically grants default permissions for that role
   */
  async grantRoleToUser(userId: string, role: UserRole, grantedBy: string): Promise<void> {
    // Check if user already has this role
    const existingRole = await this.prisma.userRoleAssignment.findUnique({
      where: {
        userId_role: {
          userId,
          role,
        },
      },
    });

    if (existingRole) {
      throw new BadRequestException(`User already has role: ${role}`);
    }

    // Create the role assignment
    await this.prisma.userRoleAssignment.create({
      data: {
        userId,
        role,
        grantedBy,
      },
    });

    // Auto-grant default permissions for this role
    const defaultPermissions = ROLE_DEFAULT_PERMISSIONS[role] || [];
    for (const permission of defaultPermissions) {
      await this.grantPermissionToUser(userId, permission as Permission, grantedBy, true);
    }
  }

  /**
   * Revoke a role from a user
   */
  async revokeRoleFromUser(userId: string, role: UserRole): Promise<void> {
    const roleAssignment = await this.prisma.userRoleAssignment.findUnique({
      where: {
        userId_role: {
          userId,
          role,
        },
      },
    });

    if (!roleAssignment) {
      throw new BadRequestException(`User does not have role: ${role}`);
    }

    // Delete the role assignment
    await this.prisma.userRoleAssignment.delete({
      where: {
        id: roleAssignment.id,
      },
    });
  }

  /**
   * Grant a specific permission to a user
   * @param userId - User ID
   * @param permission - Permission to grant
   * @param grantedBy - User ID who granted this permission
   * @param skipConflictCheck - If true, don't throw on existing permission (used for auto-grants)
   */
  async grantPermissionToUser(
    userId: string,
    permission: Permission,
    grantedBy: string,
    skipConflictCheck = false,
  ): Promise<void> {
    if (!skipConflictCheck) {
      const existingPermission = await this.prisma.userPermission.findUnique({
        where: {
          userId_permission: {
            userId,
            permission,
          },
        },
      });

      if (existingPermission) {
        throw new BadRequestException(`User already has permission: ${permission}`);
      }
    }

    // Create or skip if already exists (for auto-grants)
    await this.prisma.userPermission.create({
      data: {
        userId,
        permission,
        grantedBy,
      },
    });
  }

  /**
   * Revoke a specific permission from a user
   */
  async revokePermissionFromUser(userId: string, permission: Permission): Promise<void> {
    const userPermission = await this.prisma.userPermission.findUnique({
      where: {
        userId_permission: {
          userId,
          permission,
        },
      },
    });

    if (!userPermission) {
      throw new BadRequestException(`User does not have permission: ${permission}`);
    }

    await this.prisma.userPermission.delete({
      where: {
        id: userPermission.id,
      },
    });
  }

  /**
   * Link a user to a scholar with a specific permission type
   * Automatically grants editing permissions if permissionType is OWN_CONTENT
   */
  async linkUserToScholar(
    userId: string,
    scholarId: string,
    permissionType: ScholarPermissionType,
    createdBy: string,
  ): Promise<void> {
    // Verify scholar exists
    const scholar = await this.prisma.scholar.findUnique({
      where: { id: scholarId },
    });

    if (!scholar) {
      throw new BadRequestException(`Scholar not found: ${scholarId}`);
    }

    // Check if link already exists
    const existingLink = await this.prisma.userScholarRole.findFirst({
      where: {
        userId,
        scholarId,
        permissionType,
      },
    });

    if (existingLink) {
      throw new BadRequestException(
        `User already linked to scholar with permission type: ${permissionType}`,
      );
    }

    // Create the link
    await this.prisma.userScholarRole.create({
      data: {
        userId,
        scholarId,
        permissionType,
        createdBy,
      },
    });

    // Auto-grant editing permissions for own content
    if (permissionType === 'OWN_CONTENT') {
      await this.grantPermissionToUser(userId, 'SCHOLARS_EDIT', createdBy, true);
      await this.grantPermissionToUser(userId, 'LISTINGS_CREATE', createdBy, true);
      await this.grantPermissionToUser(userId, 'LISTINGS_EDIT', createdBy, true);
      await this.grantPermissionToUser(userId, 'LISTINGS_PUBLISH', createdBy, true);
      await this.grantPermissionToUser(userId, 'MEDIA_UPLOAD', createdBy, true);
    }
  }

  /**
   * Unlink a user from a scholar
   */
  async unlinkUserFromScholar(
    userId: string,
    scholarId: string,
    permissionType: ScholarPermissionType,
  ): Promise<void> {
    const link = await this.prisma.userScholarRole.findFirst({
      where: {
        userId,
        scholarId,
        permissionType,
      },
    });

    if (!link) {
      throw new BadRequestException(`User is not linked to this scholar with that permission type`);
    }

    await this.prisma.userScholarRole.delete({
      where: {
        id: link.id,
      },
    });
  }

  /**
   * Grant translator access to a language
   * Automatically grants translation permissions if not already granted
   */
  async grantTranslatorLanguage(
    userId: string,
    locale: Locale,
    canPublish: boolean,
    createdBy: string,
  ): Promise<void> {
    // Check if translator role already assigned
    const existingRole = await this.prisma.userTranslatorRole.findUnique({
      where: {
        userId_locale: {
          userId,
          locale,
        },
      },
    });

    if (existingRole) {
      throw new BadRequestException(`User already has translator access for language: ${locale}`);
    }

    // Create the translator role
    await this.prisma.userTranslatorRole.create({
      data: {
        userId,
        locale,
        canPublish,
        createdBy,
      },
    });

    // Auto-grant translation permissions
    const permissions: Permission[] = [
      'TRANSLATIONS_VIEW',
      'TRANSLATIONS_CREATE',
      'TRANSLATIONS_EDIT',
    ];

    if (canPublish) {
      permissions.push('TRANSLATIONS_PUBLISH');
    }

    for (const permission of permissions) {
      await this.grantPermissionToUser(userId, permission, createdBy, true);
    }
  }

  /**
   * Revoke translator access to a language
   */
  async revokeTranslatorLanguage(userId: string, locale: Locale): Promise<void> {
    const translatorRole = await this.prisma.userTranslatorRole.findUnique({
      where: {
        userId_locale: {
          userId,
          locale,
        },
      },
    });

    if (!translatorRole) {
      throw new BadRequestException(`User does not have translator access for language: ${locale}`);
    }

    await this.prisma.userTranslatorRole.delete({
      where: {
        id: translatorRole.id,
      },
    });
  }

  /**
   * Update translator publish permissions for a language
   */
  async updateTranslatorPublishPermission(
    userId: string,
    locale: Locale,
    canPublish: boolean,
  ): Promise<void> {
    const translatorRole = await this.prisma.userTranslatorRole.findUnique({
      where: {
        userId_locale: {
          userId,
          locale,
        },
      },
    });

    if (!translatorRole) {
      throw new BadRequestException(`User does not have translator access for language: ${locale}`);
    }

    // Update the can_publish flag
    await this.prisma.userTranslatorRole.update({
      where: {
        id: translatorRole.id,
      },
      data: {
        canPublish,
      },
    });

    // Update permissions based on publish flag
    const hasPublishPermission = await this.prisma.userPermission.findUnique({
      where: {
        userId_permission: {
          userId,
          permission: 'TRANSLATIONS_PUBLISH',
        },
      },
    });

    if (canPublish && !hasPublishPermission) {
      await this.grantPermissionToUser(userId, 'TRANSLATIONS_PUBLISH', userId, true);
    } else if (!canPublish && hasPublishPermission) {
      await this.revokePermissionFromUser(userId, 'TRANSLATIONS_PUBLISH');
    }
  }

  /**
   * Check if a user has a specific permission
   */
  async hasPermission(userId: string, permission: Permission): Promise<boolean> {
    const userPermission = await this.prisma.userPermission.findUnique({
      where: {
        userId_permission: {
          userId,
          permission,
        },
      },
    });
    return !!userPermission;
  }

  /**
   * Check if a user has a specific role
   */
  async hasRole(userId: string, role: UserRole): Promise<boolean> {
    const roleAssignment = await this.prisma.userRoleAssignment.findUnique({
      where: {
        userId_role: {
          userId,
          role,
        },
      },
    });
    return !!roleAssignment;
  }

  /**
   * Get all roles for a user
   */
  async getUserRoles(userId: string): Promise<UserRole[]> {
    const roles = await this.prisma.userRoleAssignment.findMany({
      where: { userId },
      select: { role: true },
    });
    return roles.map((r) => r.role);
  }

  /**
   * Get all permissions for a user
   */
  async getUserPermissions(userId: string): Promise<Permission[]> {
    const permissions = await this.prisma.userPermission.findMany({
      where: { userId },
      select: { permission: true },
    });
    return permissions.map((p) => p.permission);
  }

  /**
   * Check if a user can access a specific scholar
   * (either has global edit permission or is assigned to this scholar)
   */
  async canAccessScholar(userId: string, scholarId: string): Promise<boolean> {
    // Check if user has global listings edit permission
    const hasGlobalAccess = await this.hasPermission(userId, 'LISTINGS_EDIT');
    if (hasGlobalAccess) return true;

    // Check if user is linked to this scholar
    const scholarLink = await this.prisma.userScholarRole.findFirst({
      where: {
        userId,
        scholarId,
      },
    });

    return !!scholarLink;
  }

  /**
   * Check if a user can translate to a specific language
   */
  async canTranslateToLocale(userId: string, locale: Locale): Promise<boolean> {
    const translatorRole = await this.prisma.userTranslatorRole.findUnique({
      where: {
        userId_locale: {
          userId,
          locale,
        },
      },
    });
    return !!translatorRole;
  }

  /**
   * Check if a user can publish translations to a specific language
   */
  async canPublishTranslations(userId: string, locale: Locale): Promise<boolean> {
    const translatorRole = await this.prisma.userTranslatorRole.findUnique({
      where: {
        userId_locale: {
          userId,
          locale,
        },
      },
    });

    return translatorRole?.canPublish ?? false;
  }
}
