import { Controller, Get } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiOkResponse } from '@nestjs/swagger';
import { ApiCommonErrors } from '../../shared/decorators/api-common-errors.decorator';
import type { UserProfileDto } from '@sd/core-contracts';
import { AccountService } from './account.service';
import { CurrentUser } from '../auth/decorators';

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
      emailVerified: boolean;
      createdAt: Date;
      updatedAt: Date;
    },
  ): UserProfileDto {
    return this.accountService.getProfile(user);
  }
}
