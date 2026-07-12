import { BadRequestException, Injectable } from '@nestjs/common';
import type { Permission, ScholarPermissionType, UserRole } from '@sd/core-contracts';
import { ROLE_DEFAULT_PERMISSIONS } from '@sd/core-contracts';
import { PermissionsRepository } from './permissions.repository';
import type { Locale } from '@sd/core-db';

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
  constructor(private readonly repository: PermissionsRepository) {}

  /**
   * Assign a role to a user
   * Automatically grants default permissions for that role
   *
   * SECURITY NOTE: Only superadmin can grant superadmin role.
   * To create/demote superadmin, use direct database operations (SQL or script).
   *
   * @throws BadRequestException if:
   * - User already has the role
   * - Attempting to grant superadmin without being superadmin
   */
  async grantRoleToUser(userId: string, role: UserRole, grantedBy: string): Promise<void> {
    // Enforce: Only superadmin can grant superadmin role
    if (role === 'superadmin') {
      const isGranterSuperadmin = await this.hasRole(grantedBy, 'superadmin');
      if (!isGranterSuperadmin) {
        throw new BadRequestException(
          'Only superadmin can grant superadmin role. Use direct database operations for superadmin management.',
        );
      }
    }

    // Check if user already has this role
    const existingRole = await this.repository.findRoleAssignment(userId, role);

    if (existingRole) {
      throw new BadRequestException(`User already has role: ${role}`);
    }

    // Create the role assignment
    await this.repository.createRoleAssignment(userId, role, grantedBy);

    // Auto-grant default permissions for this role
    const defaultPermissions = ROLE_DEFAULT_PERMISSIONS[role] || [];
    for (const permission of defaultPermissions) {
      await this.grantPermissionToUser(userId, permission as Permission, grantedBy, true);
    }
  }

  /**
   * Revoke a role from a user
   *
   * SECURITY NOTE: SuperAdmin role cannot be revoked through this API.
   * To demote a superadmin, use direct database operations (SQL or script).
   *
   * @throws BadRequestException if:
   * - User does not have the role
   * - Attempting to revoke superadmin role (use direct DB operations instead)
   */
  async revokeRoleFromUser(userId: string, role: UserRole): Promise<void> {
    // Prevent superadmin demotion through API
    if (role === 'superadmin') {
      throw new BadRequestException(
        'SuperAdmin role cannot be revoked through the API. Use direct database operations (SQL or script) for superadmin management.',
      );
    }

    const roleAssignment = await this.repository.findRoleAssignment(userId, role);

    if (!roleAssignment) {
      throw new BadRequestException(`User does not have role: ${role}`);
    }

    // Delete the role assignment
    await this.repository.deleteRoleAssignment(roleAssignment.id);
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
      const existingPermission = await this.repository.findUserPermission(userId, permission);

      if (existingPermission) {
        throw new BadRequestException(`User already has permission: ${permission}`);
      }
    }

    // Create or skip if already exists (for auto-grants)
    await this.repository.createUserPermission(userId, permission, grantedBy);
  }

  /**
   * Revoke a specific permission from a user
   */
  async revokePermissionFromUser(userId: string, permission: Permission): Promise<void> {
    const userPermission = await this.repository.findUserPermission(userId, permission);

    if (!userPermission) {
      throw new BadRequestException(`User does not have permission: ${permission}`);
    }

    await this.repository.deleteUserPermission(userPermission.id);
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
    const scholar = await this.repository.scholarExists(scholarId);

    if (!scholar) {
      throw new BadRequestException(`Scholar not found: ${scholarId}`);
    }

    // Check if link already exists
    const existingLink = await this.repository.findScholarLink(userId, scholarId, permissionType);

    if (existingLink) {
      throw new BadRequestException(
        `User already linked to scholar with permission type: ${permissionType}`,
      );
    }

    // Create the link
    await this.repository.createScholarLink(userId, scholarId, permissionType, createdBy);

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
    const link = await this.repository.findScholarLink(userId, scholarId, permissionType);

    if (!link) {
      throw new BadRequestException(`User is not linked to this scholar with that permission type`);
    }

    await this.repository.deleteScholarLink(link.id);
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
    const existingRole = await this.repository.findTranslatorRole(userId, locale);

    if (existingRole) {
      throw new BadRequestException(`User already has translator access for language: ${locale}`);
    }

    // Create the translator role
    await this.repository.createTranslatorRole(userId, locale, canPublish, createdBy);

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
    const translatorRole = await this.repository.findTranslatorRole(userId, locale);

    if (!translatorRole) {
      throw new BadRequestException(`User does not have translator access for language: ${locale}`);
    }

    await this.repository.deleteTranslatorRole(translatorRole.id);
  }

  /**
   * Update translator publish permissions for a language
   */
  async updateTranslatorPublishPermission(
    userId: string,
    locale: Locale,
    canPublish: boolean,
  ): Promise<void> {
    const translatorRole = await this.repository.findTranslatorRole(userId, locale);

    if (!translatorRole) {
      throw new BadRequestException(`User does not have translator access for language: ${locale}`);
    }

    // Update the can_publish flag
    await this.repository.updateTranslatorPublishPermission(translatorRole.id, canPublish);

    // Update permissions based on publish flag
    const hasPublishPermission = await this.repository.findUserPermission(
      userId,
      'TRANSLATIONS_PUBLISH',
    );

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
    return this.repository.hasPermission(userId, permission);
  }

  /**
   * Check if a user has a specific role
   */
  async hasRole(userId: string, role: UserRole): Promise<boolean> {
    return this.repository.hasRole(userId, role);
  }

  /**
   * Get all roles for a user
   */
  async getUserRoles(userId: string): Promise<UserRole[]> {
    return this.repository.getUserRoles(userId);
  }

  /**
   * Get all permissions for a user
   */
  async getUserPermissions(userId: string): Promise<Permission[]> {
    return this.repository.getUserPermissions(userId);
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
    return this.repository.canAccessScholar(userId, scholarId);
  }

  /**
   * Check if a user can translate to a specific language
   */
  async canTranslateToLocale(userId: string, locale: Locale): Promise<boolean> {
    return this.repository.canTranslateToLocale(userId, locale);
  }

  /**
   * Check if a user can publish translations to a specific language
   */
  async canPublishTranslations(userId: string, locale: Locale): Promise<boolean> {
    return this.repository.canPublishTranslations(userId, locale);
  }

  /**
   * List all users with optional filtering by name, email, or role
   * Used by the admin users listing endpoint
   * Returns data in AdminUserListDto format for API compatibility
   *
   * @param query - Optional search query (matches name or email, case-insensitive)
   * @param role - Optional role filter (filters by UserRoleAssignment)
   * @returns AdminUserListDto with users array and total count
   */
  async listUsers(query?: string, role?: string) {
    const { users, total } = await this.repository.listUsers(query, role);
    return {
      users: users.map((u) => ({
        id: u.id,
        name: u.name,
        email: u.email,
        image: u.image,
        roles: u.roles.map((r) => r.role),
        createdAt: u.createdAt.toISOString(),
        permissions: u.permissions.map((p) => p.permission),
      })),
      total,
    };
  }

  /**
   * Get current user's permissions with role and permission details
   * Used by the /me endpoint to return the current user's permission state
   *
   * @param userId - User ID
   * @returns Object with permissions array (Permission enum values) and roles array
   */
  async getMyPermissions(userId: string) {
    const [permissions, roles] = await Promise.all([
      this.repository.findPermissionStringsByUserId(userId),
      this.repository.getUserRoles(userId),
    ]);

    return {
      permissions,
      roles,
    };
  }

  /**
   * Get detailed permission information for a user (with full audit trail)
   * Used by admin endpoints to show user permissions with timestamps and who granted them
   *
   * @param userId - User ID
   * @returns AdminPermissionsListDto with detailed permission information
   */
  async getPermissions(userId: string) {
    const perms = await this.repository.getUserPermissionsDetail(userId);
    return {
      permissions: perms.map((p) => ({
        userId: p.userId,
        permission: p.permission,
        grantedAt: p.grantedAt.toISOString(),
        grantedById: p.grantedBy,
      })),
    };
  }
}
