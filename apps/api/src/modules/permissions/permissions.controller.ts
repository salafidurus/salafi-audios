import {
  Controller,
  Post,
  Delete,
  Param,
  Body,
  BadRequestException,
  UseGuards,
} from '@nestjs/common';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { ApiCommonErrors } from '../../shared/decorators/api-common-errors.decorator';
import { RequiresPermission } from '../../shared/decorators/requires-permission.decorator';
import { PermissionGuard } from '../../shared/guards/permission.guard';
import { AdminPermissionGuard } from '../../shared/guards/admin-permission.guard';
import { PermissionsService } from './permissions.service';
import { CurrentUser } from '../auth/decorators';
import {
  Permissions,
  UserRole,
  GrantPermissionRequest,
  GrantRoleRequest,
  type Permission,
  type AdminPermissionsListDto,
} from '@sd/core-contracts';

@ApiTags('Permissions')
@ApiCommonErrors()
@Controller('admin/permissions')
@UseGuards(PermissionGuard, AdminPermissionGuard)
export class PermissionsController {
  constructor(private readonly permissionsService: PermissionsService) {}

  /**
   * Permission Management Endpoints
   */

  @Post(':userId/permissions')
  @RequiresPermission(Permissions.USERS_GRANT_PERMISSIONS)
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
  @RequiresPermission(Permissions.USERS_GRANT_PERMISSIONS)
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

  @Post(':userId/roles')
  @RequiresPermission(Permissions.USERS_GRANT_ROLES)
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
  @RequiresPermission(Permissions.USERS_GRANT_ROLES)
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
}
