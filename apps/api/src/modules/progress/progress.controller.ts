import { Controller, Post, Param, Body } from '@nestjs/common';
import { ApiOkResponse, ApiOperation, ApiTags } from '@nestjs/swagger';
import { ApiCommonErrors } from '../../shared/decorators/api-common-errors.decorator';
import { CurrentUser } from '../../modules/auth/decorators';
import type { ProgressSyncDto } from '@sd/core-contracts';
import { ProgressService } from './progress.service';

@ApiTags('Progress')
@ApiCommonErrors()
@Controller('me/progress')
export class ProgressController {
  constructor(private readonly progress: ProgressService) {}

  @Post('sync')
  @ApiOperation({ summary: 'Bulk sync progress from client' })
  @ApiOkResponse({ description: 'Progress synced' })
  syncProgress(
    @CurrentUser() user: { id: string },
    @Body() body: ProgressSyncDto,
  ): Promise<void> {
    return this.progress.bulkSync(user.id, body.items ?? []);
  }

  @Post(':lectureId')
  @ApiOperation({ summary: 'Upsert lecture progress' })
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
