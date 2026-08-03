import { Body, Controller, Get, Param, Put, Query } from '@nestjs/common';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { ApiCommonErrors } from '../../shared/decorators/api-common-errors.decorator';
import { CheckPolicy } from '../auth/decorators/check-policy.decorator';
import { PermissionsService } from './permissions.service';
import type { AdminUserListDto, UserAccessSnapshot } from '@sd/core-contracts';
import { CurrentUser } from '../auth/decorators';
import { AccessService } from './access.service';
import { ReplaceUserAccessDto } from './dto/replace-user-access.dto';

/**
 * AdminUsersController
 *
 * Handles user listing and read-only operations.
 * Role and permission management endpoints have been migrated to PermissionsController.
 * User administration itself is never scholar/locale-scoped.
 */
@ApiTags('Admin Users')
@ApiCommonErrors()
@Controller('admin/users')
export class AdminUsersController {
  constructor(
    private readonly permissionsService: PermissionsService,
    private readonly accessService: AccessService,
  ) {}

  @Get()
  @CheckPolicy('read', 'User')
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

  @Get(':userId/access')
  @CheckPolicy('manage', 'UserAccess')
  @ApiOperation({ summary: 'Get the aggregate access snapshot for a user' })
  getAccess(@Param('userId') userId: string): Promise<UserAccessSnapshot> {
    return this.accessService.snapshot(userId);
  }

  @Put(':userId/access')
  @CheckPolicy('manage', 'UserAccess')
  @ApiOperation({ summary: 'Replace a user access snapshot atomically' })
  replaceAccess(
    @Param('userId') userId: string,
    @Body() body: ReplaceUserAccessDto,
    @CurrentUser() user: { id: string },
  ): Promise<UserAccessSnapshot> {
    return this.accessService.replace(userId, body, user.id);
  }
}
