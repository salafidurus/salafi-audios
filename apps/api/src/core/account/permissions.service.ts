import { BadRequestException, Injectable } from '@nestjs/common';
import type {
  Permission,
  ScholarPermissionType,
  UserRole,
  UserScholarRoleDto,
  UserTranslatorRoleDto,
} from '@sd/core-contracts';
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
    await Promise.all(
      defaultPermissions.map((permission) =>
        this.grantPermissionToUser(userId, permission as Permission, grantedBy, true),
      ),
    );
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
   * Resolve a scholar's slug (the external API identifier, per this
   * project's convention) to its internal database id.
   */
  private async resolveScholarId(scholarSlug: string): Promise<string> {
    const scholar = await this.repository.findScholarBySlug(scholarSlug);
    if (!scholar) {
      throw new BadRequestException(`Scholar not found: ${scholarSlug}`);
    }
    return scholar.id;
  }

  private async resolveScholarIdOrNull(scholarSlug: string | null): Promise<string | null> {
    if (scholarSlug === null) return null;
    return this.resolveScholarId(scholarSlug);
  }

  /**
   * Link a user to a scholar with a specific permission type.
   * Scoped access is derived live by the CASL ability factory from this row
   * — no global permissions are materialized as a side effect.
   */
  async linkUserToScholar(
    userId: string,
    scholarSlug: string,
    permissionType: ScholarPermissionType,
    createdBy: string,
  ): Promise<void> {
    const scholarId = await this.resolveScholarId(scholarSlug);

    const existingLink = await this.repository.findScholarLink(userId, scholarId, permissionType);
    if (existingLink) {
      throw new BadRequestException(
        `User already linked to scholar with permission type: ${permissionType}`,
      );
    }

    await this.repository.createScholarLink(userId, scholarId, permissionType, createdBy);
  }

  /**
   * Unlink a user from a scholar
   */
  async unlinkUserFromScholar(
    userId: string,
    scholarSlug: string,
    permissionType: ScholarPermissionType,
  ): Promise<void> {
    const scholarId = await this.resolveScholarId(scholarSlug);
    const link = await this.repository.findScholarLink(userId, scholarId, permissionType);

    if (!link) {
      throw new BadRequestException(`User is not linked to this scholar with that permission type`);
    }

    await this.repository.deleteScholarLink(link.id);
  }

  /**
   * Grant translator access to a locale, optionally scoped to one scholar
   * (null scholarSlug = all scholars). Scoped access is derived live by the
   * CASL ability factory — no global permissions are materialized.
   */
  async grantTranslatorLanguage(
    userId: string,
    scholarSlug: string | null,
    locale: Locale,
    canPublish: boolean,
    createdBy: string,
  ): Promise<void> {
    const scholarId = await this.resolveScholarIdOrNull(scholarSlug);

    const existingRole = await this.repository.findTranslatorRoleByScope(userId, scholarId, locale);
    if (existingRole) {
      throw new BadRequestException(`User already has translator access for language: ${locale}`);
    }

    await this.repository.createTranslatorRole(userId, scholarId, locale, canPublish, createdBy);
  }

  /**
   * Revoke translator access to a locale within a scope
   */
  async revokeTranslatorLanguage(
    userId: string,
    scholarSlug: string | null,
    locale: Locale,
  ): Promise<void> {
    const scholarId = await this.resolveScholarIdOrNull(scholarSlug);
    const translatorRole = await this.repository.findTranslatorRoleByScope(
      userId,
      scholarId,
      locale,
    );

    if (!translatorRole) {
      throw new BadRequestException(`User does not have translator access for language: ${locale}`);
    }

    await this.repository.deleteTranslatorRole(translatorRole.id);
  }

  /**
   * Update the publish flag for an existing translator grant within a scope
   */
  async updateTranslatorPublishPermission(
    userId: string,
    scholarSlug: string | null,
    locale: Locale,
    canPublish: boolean,
  ): Promise<void> {
    const scholarId = await this.resolveScholarIdOrNull(scholarSlug);
    const translatorRole = await this.repository.findTranslatorRoleByScope(
      userId,
      scholarId,
      locale,
    );

    if (!translatorRole) {
      throw new BadRequestException(`User does not have translator access for language: ${locale}`);
    }

    await this.repository.updateTranslatorPublishPermission(translatorRole.id, canPublish);
  }

  /**
   * Grant/revoke a set of locales for a user within a scholar scope in one
   * batch — the admin UI grants "translate {en, ar}" as a single action
   * rather than one call per locale. Diffs the requested set against
   * existing rows: creates missing, deletes removed, updates canPublish on
   * whatever remains in the set.
   */
  async syncTranslatorLocales(
    userId: string,
    scholarSlug: string | null,
    locales: Locale[],
    canPublish: boolean,
    createdBy: string,
  ): Promise<void> {
    const scholarId = await this.resolveScholarIdOrNull(scholarSlug);
    const existing = await this.repository.getTranslatorRolesByScope(userId, scholarId);

    const requestedLocales = new Set(locales);
    const existingByLocale = new Map(existing.map((role) => [role.locale, role]));

    const toCreate = locales.filter((locale) => !existingByLocale.has(locale));
    const toDelete = existing.filter((role) => !requestedLocales.has(role.locale));
    const toUpdate = existing.filter(
      (role) => requestedLocales.has(role.locale) && role.canPublish !== canPublish,
    );

    await Promise.all([
      ...toCreate.map((locale) =>
        this.repository.createTranslatorRole(userId, scholarId, locale, canPublish, createdBy),
      ),
      ...toDelete.map((role) => this.repository.deleteTranslatorRole(role.id)),
      ...toUpdate.map((role) =>
        this.repository.updateTranslatorPublishPermission(role.id, canPublish),
      ),
    ]);
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
  async listUsers(query?: string, role?: string, cursor?: string) {
    const { users, nextCursor, hasMore } = await this.repository.listUsers(query, role, cursor);
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
      nextCursor,
      hasMore,
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

  /**
   * Get detailed role assignment information for a user
   * Used by admin endpoints to show user roles with timestamps and who granted them
   *
   * @param userId - User ID
   * @returns Object with roles array of UserRoleAssignmentDto
   */
  async getRoles(userId: string) {
    const roles = await this.repository.getUserRolesDetail(userId);
    return {
      roles: roles.map((r) => ({
        id: r.id,
        userId: r.userId,
        role: r.role as UserRole,
        grantedAt: r.grantedAt.toISOString(),
        grantedBy: r.grantedBy,
      })),
    };
  }

  /**
   * List a user's scholar-scoped role grants (for the admin scoped-grant UI)
   */
  async listScholarRoles(userId: string): Promise<UserScholarRoleDto[]> {
    const roles = await this.repository.getScholarsByUser(userId);
    return roles.map((r) => ({
      id: r.id,
      userId: r.userId,
      scholarId: r.scholarId,
      scholarSlug: r.scholar.slug,
      scholarName: r.scholar.name,
      permissionType: r.permissionType,
      createdAt: r.createdAt.toISOString(),
      createdBy: r.createdBy,
    }));
  }

  /**
   * List a user's translator-scoped role grants (for the admin scoped-grant UI)
   */
  async listTranslatorRoles(userId: string): Promise<UserTranslatorRoleDto[]> {
    const roles = await this.repository.getTranslatorLanguages(userId);
    return roles.map((r) => ({
      id: r.id,
      userId: r.userId,
      scholarId: r.scholarId,
      scholarSlug: r.scholar?.slug ?? null,
      scholarName: r.scholar?.name ?? null,
      locale: r.locale,
      canPublish: r.canPublish,
      createdAt: r.createdAt.toISOString(),
      createdBy: r.createdBy,
    }));
  }
}
