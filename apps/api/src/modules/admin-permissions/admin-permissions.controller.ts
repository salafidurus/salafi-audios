import { Controller, Get, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { ApiCommonErrors } from '../../shared/decorators/api-common-errors.decorator';
import { CurrentUser } from '../../modules/auth/decorators';
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
}
