import { Controller, Get, Query, UseGuards, Param } from '@nestjs/common';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { ApiCommonErrors } from '../../shared/decorators/api-common-errors.decorator';
import { RequiresPermission } from '../../shared/decorators/requires-permission.decorator';
import { PermissionGuard } from '../../shared/guards/permission.guard';
import { AdminPermissionGuard } from '../../shared/guards/admin-permission.guard';
import { AdminPermissionsService } from './admin-permissions.service';
import { Permissions } from '@sd/core-contracts';
import type { AdminPermissionsListDto, AdminUserListDto } from '@sd/core-contracts';

/**
 * AdminUsersController
 *
 * Handles user listing and read-only operations.
 * Role and permission management endpoints have been migrated to PermissionsController.
 */
@ApiTags('Admin Users')
@ApiCommonErrors()
@Controller('admin/users')
@UseGuards(PermissionGuard, AdminPermissionGuard)
export class AdminUsersController {
  constructor(private readonly adminPermissionsService: AdminPermissionsService) {}

  @Get()
  @RequiresPermission(Permissions.USERS_VIEW)
  @ApiOperation({
    summary: 'List all users with their admin permissions and roles',
  })
  async listUsers(
    @Query('q') query?: string,
    @Query('role') role?: string,
  ): Promise<AdminUserListDto> {
    return this.adminPermissionsService.listUsers(query, role);
  }

  @Get(':userId/permissions')
  @RequiresPermission(Permissions.USERS_VIEW)
  @ApiOperation({ summary: 'Get permissions for a user (read-only)' })
  async getPermissions(@Param('userId') userId: string): Promise<AdminPermissionsListDto> {
    return this.adminPermissionsService.getPermissions(userId);
  }
}
