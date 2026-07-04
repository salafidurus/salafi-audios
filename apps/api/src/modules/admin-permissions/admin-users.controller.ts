import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { ApiCommonErrors } from '../../shared/decorators/api-common-errors.decorator';
import { RequiresPermission } from '../../shared/decorators/requires-permission.decorator';
import { AdminPermissionGuard } from '../../shared/guards/admin-permission.guard';
import { AdminPermissionsService } from './admin-permissions.service';

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
}
