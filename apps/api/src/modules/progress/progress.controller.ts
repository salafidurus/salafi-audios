import { Controller, Get, Post, Param, Body, Query, Put } from '@nestjs/common';
import { ApiOkResponse, ApiOperation, ApiTags } from '@nestjs/swagger';
import { ApiCommonErrors } from '../../shared/decorators/api-common-errors.decorator';
import { CurrentUser } from '../../modules/auth/decorators';
import type { ProgressSyncDto, LectureProgressDto } from '@sd/core-contracts';
import { ProgressService } from './progress.service';

@ApiTags('Progress')
@ApiCommonErrors()
@Controller('me/progress')
export class ProgressController {
  constructor(private readonly progress: ProgressService) {}

  @Get()
  @ApiOperation({ summary: 'Get all progress entries for user' })
  @ApiOkResponse({ description: 'User progress entries' })
  getProgress(
    @CurrentUser() user: { id: string },
  ): Promise<LectureProgressDto[]> {
    return this.progress.getUserProgress(user.id);
  }

  @Post('sync')
  @ApiOperation({ summary: 'Bulk sync progress from client' })
  @ApiOkResponse({ description: 'Progress synced' })
  syncProgress(
    @CurrentUser() user: { id: string },
    @Body() body: ProgressSyncDto,
  ): Promise<void> {
    return this.progress.bulkSync(user.id, body.items ?? []);
  }

  @Put(':lectureId')
  @ApiOperation({ summary: 'Update lecture progress' })
  @ApiOkResponse({ description: 'Progress updated' })
  upsertProgress(
    @CurrentUser() user: { id: string },
    @Param('lectureId') lectureId: string,
    @Body()
    body: {
      positionSeconds: number;
      durationSeconds?: number;
      isCompleted?: boolean;
    },
  ): Promise<void> {
    return this.progress.upsertProgress(
      user.id,
      lectureId,
      body.positionSeconds,
      body.durationSeconds,
      body.isCompleted,
    );
  }
}
