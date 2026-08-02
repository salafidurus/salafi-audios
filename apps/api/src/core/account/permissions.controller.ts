import {
  Controller,
  Get,
  Post,
  Put,
  Patch,
  Delete,
  Param,
  Body,
  BadRequestException,
} from '@nestjs/common';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { ApiCommonErrors } from '../../shared/decorators/api-common-errors.decorator';
import { CurrentUser } from '../auth/decorators';
import { CheckPolicy } from '../auth/decorators/check-policy.decorator';
import { PermissionsService } from './permissions.service';
import {
  type UserRole,
  type GrantPermissionRequest,
  type GrantRoleRequest,
  type GrantScholarRoleRequest,
  type SyncTranslatorLocalesRequest,
  type UpdateTranslatorPublishRequest,
  type Permission,
  type ScholarPermissionType,
  type UserRoleAssignmentDto,
  type UserScholarRoleDto,
  type UserTranslatorRoleDto,
} from '@sd/core-contracts';
import type { Locale } from '@sd/core-db';

@ApiTags('Permissions')
@ApiCommonErrors()
@Controller('admin/permissions')
export class PermissionsController {
  constructor(private readonly permissionsService: PermissionsService) {}

  /**
   * Permission Management Endpoints
   */

  @Post(':userId/permissions')
  @CheckPolicy('grant', 'UserPermission')
  @ApiOperation({ summary: 'Grant a permission to a user' })
  async grantPermission(
    @Param('userId') userId: string,
    @Body() body: GrantPermissionRequest,
    @CurrentUser() granter: { id: string },
  ): Promise<{ success: boolean; message: string }> {
    try {
      await this.permissionsService.grantPermissionToUser(userId, body.permission, granter.id);
      return {
        success: true,
        message: `Permission '${body.permission}' granted to user`,
      };
    } catch (error) {
      if (error instanceof BadRequestException) {
        throw error;
      }
      throw new BadRequestException(
        `Failed to grant permission: ${error instanceof Error ? error.message : 'Unknown error'}`,
      );
    }
  }

  @Delete(':userId/permissions/:permission')
  @CheckPolicy('grant', 'UserPermission')
  @ApiOperation({ summary: 'Revoke a permission from a user' })
  async revokePermission(
    @Param('userId') userId: string,
    @Param('permission') permission: string,
  ): Promise<{ success: boolean; message: string }> {
    try {
      await this.permissionsService.revokePermissionFromUser(userId, permission as Permission);
      return {
        success: true,
        message: `Permission '${permission}' revoked from user`,
      };
    } catch (error) {
      if (error instanceof BadRequestException) {
        throw error;
      }
      throw new BadRequestException(
        `Failed to revoke permission: ${error instanceof Error ? error.message : 'Unknown error'}`,
      );
    }
  }

  /**
   * Role Management Endpoints
   * These endpoints enforce SuperAdmin protection:
   * - Only SuperAdmin can grant SuperAdmin role
   * - SuperAdmin cannot be demoted via API (requires direct database operations)
   */

  @Get(':userId/roles')
  @CheckPolicy('read', 'User')
  @ApiOperation({ summary: 'Get roles for a user' })
  async getRoles(@Param('userId') userId: string): Promise<{ roles: UserRoleAssignmentDto[] }> {
    return this.permissionsService.getRoles(userId);
  }

  @Post(':userId/roles')
  @CheckPolicy('grant', 'UserRoleAssignment')
  @ApiOperation({ summary: 'Grant a role to a user with SuperAdmin protection' })
  async grantRole(
    @Param('userId') userId: string,
    @Body() body: GrantRoleRequest,
    @CurrentUser() granter: { id: string },
  ): Promise<{ success: boolean; message: string }> {
    try {
      await this.permissionsService.grantRoleToUser(userId, body.role, granter.id);
      return { success: true, message: `Role '${body.role}' granted to user` };
    } catch (error) {
      if (error instanceof BadRequestException) {
        throw error;
      }
      throw new BadRequestException(
        `Failed to grant role: ${error instanceof Error ? error.message : 'Unknown error'}`,
      );
    }
  }

  @Delete(':userId/roles/:role')
  @CheckPolicy('grant', 'UserRoleAssignment')
  @ApiOperation({ summary: 'Revoke a role from a user with SuperAdmin protection' })
  async revokeRole(
    @Param('userId') userId: string,
    @Param('role') role: UserRole,
  ): Promise<{ success: boolean; message: string }> {
    try {
      await this.permissionsService.revokeRoleFromUser(userId, role);
      return { success: true, message: `Role '${role}' revoked from user` };
    } catch (error) {
      if (error instanceof BadRequestException) {
        throw error;
      }
      throw new BadRequestException(
        `Failed to revoke role: ${error instanceof Error ? error.message : 'Unknown error'}`,
      );
    }
  }

  /**
   * Scholar-Scoped Role Endpoints
   * Grant a user editing rights over a single scholar's content (identified
   * by slug, per this project's convention — see core-db Scholar model).
   */

  @Get(':userId/scholar-roles')
  @CheckPolicy('grant', 'UserScholarRole')
  @ApiOperation({ summary: "List a user's scholar-scoped role grants" })
  async listScholarRoles(@Param('userId') userId: string): Promise<{
    scholarRoles: UserScholarRoleDto[];
  }> {
    return { scholarRoles: await this.permissionsService.listScholarRoles(userId) };
  }

  @Post(':userId/scholar-roles')
  @CheckPolicy('grant', 'UserScholarRole')
  @ApiOperation({ summary: 'Link a user to a scholar with a scoped permission type' })
  async grantScholarRole(
    @Param('userId') userId: string,
    @Body() body: GrantScholarRoleRequest,
    @CurrentUser() granter: { id: string },
  ): Promise<{ success: boolean; message: string }> {
    try {
      await this.permissionsService.linkUserToScholar(
        userId,
        body.scholarSlug,
        body.permissionType,
        granter.id,
      );
      return {
        success: true,
        message: `User linked to scholar '${body.scholarSlug}' with permission type '${body.permissionType}'`,
      };
    } catch (error) {
      if (error instanceof BadRequestException) {
        throw error;
      }
      throw new BadRequestException(
        `Failed to grant scholar role: ${error instanceof Error ? error.message : 'Unknown error'}`,
      );
    }
  }

  @Delete(':userId/scholar-roles/:scholarSlug/:permissionType')
  @CheckPolicy('grant', 'UserScholarRole')
  @ApiOperation({ summary: 'Unlink a user from a scholar' })
  async revokeScholarRole(
    @Param('userId') userId: string,
    @Param('scholarSlug') scholarSlug: string,
    @Param('permissionType') permissionType: ScholarPermissionType,
  ): Promise<{ success: boolean; message: string }> {
    try {
      await this.permissionsService.unlinkUserFromScholar(userId, scholarSlug, permissionType);
      return {
        success: true,
        message: `User unlinked from scholar '${scholarSlug}'`,
      };
    } catch (error) {
      if (error instanceof BadRequestException) {
        throw error;
      }
      throw new BadRequestException(
        `Failed to revoke scholar role: ${error instanceof Error ? error.message : 'Unknown error'}`,
      );
    }
  }

  /**
   * Translator-Scoped Role Endpoints
   * Grant a user translation rights for a set of locales, optionally scoped
   * to a single scholar (scholarSlug: null = all scholars).
   */

  @Get(':userId/translator-roles')
  @CheckPolicy('grant', 'UserTranslatorRole')
  @ApiOperation({ summary: "List a user's translator-scoped role grants" })
  async listTranslatorRoles(@Param('userId') userId: string): Promise<{
    translatorRoles: UserTranslatorRoleDto[];
  }> {
    return { translatorRoles: await this.permissionsService.listTranslatorRoles(userId) };
  }

  @Put(':userId/translator-roles')
  @CheckPolicy('grant', 'UserTranslatorRole')
  @ApiOperation({ summary: 'Sync a user’s translator locale grants within a scholar scope' })
  async syncTranslatorRoles(
    @Param('userId') userId: string,
    @Body() body: SyncTranslatorLocalesRequest,
    @CurrentUser() granter: { id: string },
  ): Promise<{ success: boolean; message: string }> {
    try {
      await this.permissionsService.syncTranslatorLocales(
        userId,
        body.scholarSlug,
        body.locales,
        body.canPublish,
        granter.id,
      );
      return { success: true, message: 'Translator locale grants synced' };
    } catch (error) {
      if (error instanceof BadRequestException) {
        throw error;
      }
      throw new BadRequestException(
        `Failed to sync translator locales: ${error instanceof Error ? error.message : 'Unknown error'}`,
      );
    }
  }

  @Patch(':userId/translator-roles/:locale')
  @CheckPolicy('grant', 'UserTranslatorRole')
  @ApiOperation({ summary: 'Update the publish flag for an existing translator grant' })
  async updateTranslatorPublish(
    @Param('userId') userId: string,
    @Param('locale') locale: string,
    @Body() body: UpdateTranslatorPublishRequest,
  ): Promise<{ success: boolean; message: string }> {
    try {
      await this.permissionsService.updateTranslatorPublishPermission(
        userId,
        body.scholarSlug ?? null,
        locale as Locale,
        body.canPublish,
      );
      return { success: true, message: `Translator publish rights updated for locale '${locale}'` };
    } catch (error) {
      if (error instanceof BadRequestException) {
        throw error;
      }
      throw new BadRequestException(
        `Failed to update translator publish rights: ${error instanceof Error ? error.message : 'Unknown error'}`,
      );
    }
  }
}
