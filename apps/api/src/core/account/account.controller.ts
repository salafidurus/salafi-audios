import { Controller, Get, Patch, Body, Delete } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiOkResponse } from '@nestjs/swagger';
import { ApiCommonErrors } from '../../shared/decorators/api-common-errors.decorator';
import type { UserProfileDto } from '@sd/core-contracts';
import { AccountService } from './account.service';
import { CurrentUser } from '../auth/decorators';
import { UpdateProfileDto } from './dto/update-profile.dto';

@ApiTags('Account')
@ApiCommonErrors()
@Controller('account')
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
      role: string;
      roles: string[];
      emailVerified: boolean;
      createdAt: Date;
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
    @Body() body: UpdateProfileDto,
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
