import { Body, Controller, Get, Param, Put, Query } from '@nestjs/common';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { ApiCommonErrors } from '../../shared/decorators/api-common-errors.decorator';
import { CheckPolicy } from '../auth/decorators/check-policy.decorator';
import { UserDirectoryService } from './user-directory.service';
import {
  ReplaceUserAccessRequestSchema,
  type ReplaceUserAccessRequest as ReplaceUserAccessDto,
  type AdminUserListDto,
  type UserAccessSnapshot,
} from '@sd/core-contracts';
import { CurrentUser } from '../auth/decorators';
import { AccessService } from './access.service';
import { RateLimitPolicy } from '../security/rate-limit.decorator';

/**
 * AdminUsersController
 *
 * Handles user listing and aggregate access management.
 * User administration is global and requires the UserAccess capability.
 */
/** NestJS admin users controller service or controller coordinating the API boundary for this responsibility. */
@ApiTags('Admin Users')
@ApiCommonErrors()
@Controller('admin/users')
/** Core API admin users.controller module providing shared backend infrastructure and authority-boundary services. */
// oxlint-disable-next-line anti-slop/require-tsdoc -- NestJS decorators separate the declaration from its TSDoc.
export class AdminUsersController {
  constructor(
    private readonly userDirectoryService: UserDirectoryService,
    private readonly accessService: AccessService,
  ) {}

  @Get()
  @CheckPolicy('manage', 'UserAccess')
  @ApiOperation({
    summary: 'List all users with their admin access and roles',
  })
  async listUsers(
    @Query('q') query?: string,
    @Query('role') role?: string,
    @Query('cursor') cursor?: string,
  ): Promise<AdminUserListDto> {
    return this.userDirectoryService.listUsers(query, role, cursor);
  }

  @Get(':userId/access')
  @CheckPolicy('manage', 'UserAccess')
  @ApiOperation({ summary: 'Get the aggregate access snapshot for a user' })
  getAccess(@Param('userId') userId: string): Promise<UserAccessSnapshot> {
    return this.accessService.snapshot(userId);
  }

  @Put(':userId/access')
  @RateLimitPolicy('admin-write')
  @CheckPolicy('manage', 'UserAccess')
  @ApiOperation({ summary: 'Replace a user access snapshot atomically' })
  replaceAccess(
    @Param('userId') userId: string,
    @Body({ schema: ReplaceUserAccessRequestSchema }) body: ReplaceUserAccessDto,
    @CurrentUser() user: { id: string },
  ): Promise<UserAccessSnapshot> {
    return this.accessService.replace(userId, body, user.id);
  }
}
