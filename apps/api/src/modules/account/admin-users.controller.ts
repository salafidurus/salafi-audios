import { Controller, Get, Query, Param } from '@nestjs/common';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { ApiCommonErrors } from '../../shared/decorators/api-common-errors.decorator';
import { RequiresPermission } from '../../shared/decorators/requires-permission.decorator';
import { PermissionsService } from './permissions.service';
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
export class AdminUsersController {
  constructor(private readonly permissionsService: PermissionsService) {}

  @Get()
  @RequiresPermission(Permissions.USERS_VIEW)
  @ApiOperation({
    summary: 'List all users with their admin permissions and roles',
  })
  async listUsers(
    @Query('q') query?: string,
    @Query('role') role?: string,
    @Query('cursor') cursor?: string,
  ): Promise<AdminUserListDto> {
    return this.permissionsService.listUsers(query, role, cursor);
  }

  @Get(':userId/permissions')
  @RequiresPermission(Permissions.USERS_VIEW)
  @ApiOperation({ summary: 'Get permissions for a user (read-only)' })
  async getPermissions(@Param('userId') userId: string): Promise<AdminPermissionsListDto> {
    return this.permissionsService.getPermissions(userId);
  }
}
