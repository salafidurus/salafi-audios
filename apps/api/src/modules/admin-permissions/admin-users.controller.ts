import { Controller, Get, Query, UseGuards, Param, Post, Delete, Body } from '@nestjs/common';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { ApiCommonErrors } from '../../shared/decorators/api-common-errors.decorator';
import { RequiresPermission } from '../../shared/decorators/requires-permission.decorator';
import { AdminPermissionGuard } from '../../shared/guards/admin-permission.guard';
import { AdminPermissionsService } from './admin-permissions.service';
import { CurrentUser } from '../../modules/auth/decorators';
import { GrantPermissionDto } from './dto/grant-permission.dto';
import type { AdminPermissionsListDto } from '@sd/core-contracts';

@ApiTags('Admin Users')
@ApiCommonErrors()
@Controller('admin/users')
@UseGuards(AdminPermissionGuard)
export class AdminUsersController {
  constructor(private readonly service: AdminPermissionsService) {}

  @Get()
  @RequiresPermission('manage:admin')
  @ApiOperation({ summary: 'List all users with their admin permissions' })
  listUsers(@Query('q') query?: string) {
    return this.service.listUsers(query);
  }

  @Get(':userId/permissions')
  @RequiresPermission('manage:admin')
  @ApiOperation({ summary: 'Get permissions for a user' })
  getPermissions(@Param('userId') userId: string): Promise<AdminPermissionsListDto> {
    return this.service.getPermissions(userId);
  }

  @Post(':userId/permissions')
  @RequiresPermission('manage:admin')
  @ApiOperation({ summary: 'Grant a permission to a user' })
  grant(
    @Param('userId') userId: string,
    @Body() body: GrantPermissionDto,
    @CurrentUser() granter: { id: string },
  ): Promise<AdminPermissionsListDto> {
    return this.service.grant(userId, body.permission, granter.id);
  }

  @Delete(':userId/permissions/:permission')
  @RequiresPermission('manage:admin')
  @ApiOperation({ summary: 'Revoke a permission from a user' })
  revoke(
    @Param('userId') userId: string,
    @Param('permission') permission: string,
  ): Promise<AdminPermissionsListDto> {
    return this.service.revoke(userId, permission);
  }
}
