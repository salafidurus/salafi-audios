import { Controller, Get, Patch, Body, Delete } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiOkResponse } from '@nestjs/swagger';
import { ApiCommonErrors } from '../../shared/decorators/api-common-errors.decorator';
import { UpdateProfileDtoSchema, type UserProfileDto } from '@sd/core-contracts';
import { AccountService } from './account.service';
import { CurrentUser } from '../auth/decorators';
import type { UpdateProfileDto } from './dto/update-profile.dto';
import type { AccessGrantAttribute } from '../auth/ability/ability.types';

/** NestJS account controller service or controller coordinating the API boundary for this responsibility. */
@ApiTags('Account')
@ApiCommonErrors()
@Controller('account')
/** Core API account.controller module providing shared backend infrastructure and authority-boundary services. */
// oxlint-disable-next-line anti-slop/require-tsdoc -- NestJS decorators separate the declaration from its TSDoc.
export class AccountController {
  constructor(private readonly accountService: AccountService) {}

  @Get('profile')
  @ApiOperation({ summary: 'Get current user profile' })
  @ApiOkResponse({ description: 'Current user profile' })
  getProfile(
    @CurrentUser()
    user: {
      id: string;
      email: string;
      name: string;
      image?: string | null;
      /** Documents the role field's API projection semantics and lifecycle meaning. */
      role: string;
      /** Documents the roles field's API projection semantics and lifecycle meaning. */
      roles: string[];
      accessGrants?: AccessGrantAttribute[];
      emailVerified: boolean;
      /** Documents the createdAt field's API projection semantics and lifecycle meaning. */
      createdAt: Date;
      /** Documents the updatedAt field's API projection semantics and lifecycle meaning. */
      updatedAt: Date;
    },
  ): UserProfileDto {
    return this.accountService.getProfile(user);
  }

  @Patch('profile')
  @ApiOperation({ summary: 'Update current user profile' })
  @ApiOkResponse({ description: 'Updated user profile' })
  updateProfile(
    @CurrentUser() user: { id: string },
    @Body({ schema: UpdateProfileDtoSchema }) body: UpdateProfileDto,
  ): Promise<UserProfileDto> {
    return this.accountService.updateProfile(user.id, body.displayName);
  }

  @Delete()
  @ApiOperation({ summary: 'Hard-delete current user account (GDPR)' })
  @ApiOkResponse({ description: 'Account deleted successfully' })
  deleteAccount(@CurrentUser() user: { id: string }): Promise<void> {
    return this.accountService.deleteAccount(user.id);
  }
}
