import {
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Body,
  UseGuards,
} from '@nestjs/common';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { ApiCommonErrors } from '../../shared/decorators/api-common-errors.decorator';
import { CurrentUser } from '../../modules/auth/decorators';
import { RequiresPermission } from '../../shared/decorators/requires-permission.decorator';
import { AdminPermissionGuard } from '../../shared/guards/admin-permission.guard';
import { AdminPermissionsService } from './admin-permissions.service';

@ApiTags('Admin Permissions')
@ApiCommonErrors()
@Controller('admin/permissions')
@UseGuards(AdminPermissionGuard)
export class AdminPermissionsController {
  constructor(private readonly service: AdminPermissionsService) {}

  @Get('me')
  @ApiOperation({ summary: 'Get current user permissions' })
  getMyPermissions(@CurrentUser() user: { id: string }) {
    return this.service.getMyPermissions(user.id);
  }

  @Get(':userId')
  @RequiresPermission('manage:admin')
  @ApiOperation({ summary: 'Get permissions for a user' })
  getPermissions(@Param('userId') userId: string) {
    return this.service.getPermissions(userId);
  }

  @Post(':userId')
  @RequiresPermission('manage:admin')
  @ApiOperation({ summary: 'Grant a permission to a user' })
  grant(
    @Param('userId') userId: string,
    @Body() body: { permission: string },
    @CurrentUser() granter: { id: string },
  ) {
    return this.service.grant(userId, body.permission, granter.id);
  }

  @Delete(':userId/:permission')
  @RequiresPermission('manage:admin')
  @ApiOperation({ summary: 'Revoke a permission from a user' })
  revoke(
    @Param('userId') userId: string,
    @Param('permission') permission: string,
  ) {
    return this.service.revoke(userId, permission);
  }
}
