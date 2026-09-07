import { Controller, Delete, Get, Param, Post } from '@nestjs/common';
import { ApiOkResponse, ApiOperation, ApiTags } from '@nestjs/swagger';
import type { ScholarFollowDto } from '@sd/core-contracts';
import { ApiCommonErrors } from '../../shared/decorators/api-common-errors.decorator';
import { CurrentUser } from '../../core/auth/decorators';
import { ScholarFollowService } from './scholar-follow.service';

@ApiTags('Scholars')
@ApiCommonErrors()
@Controller({ path: 'me/scholars', version: '1' })
/** HTTP controller for authenticated scholar follow state and transitions. */
// oxlint-disable-next-line anti-slop/require-tsdoc -- Controller behavior is documented by the boundary comment above.
export class ScholarFollowController {
  constructor(private readonly follows: ScholarFollowService) {}

  @Get(':slug/follow')
  @ApiOperation({ summary: 'Get the current scholar follow state' })
  @ApiOkResponse({ description: 'Current follow state' })
  status(
    @CurrentUser() user: { id: string },
    @Param('slug') slug: string,
  ): Promise<ScholarFollowDto> {
    return this.follows.getStatus(user.id, slug);
  }

  @Post(':slug/follow')
  @ApiOperation({ summary: 'Follow a scholar' })
  @ApiOkResponse({ description: 'Scholar followed' })
  follow(
    @CurrentUser() user: { id: string },
    @Param('slug') slug: string,
  ): Promise<ScholarFollowDto> {
    return this.follows.follow(user.id, slug);
  }

  @Delete(':slug/follow')
  @ApiOperation({ summary: 'Unfollow a scholar' })
  @ApiOkResponse({ description: 'Scholar unfollowed' })
  unfollow(
    @CurrentUser() user: { id: string },
    @Param('slug') slug: string,
  ): Promise<ScholarFollowDto> {
    return this.follows.unfollow(user.id, slug);
  }
}
