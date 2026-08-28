import { Controller, Get, Post, Put, Param, Query, Body, UseInterceptors } from '@nestjs/common';
import { ApiOkResponse, ApiOperation, ApiTags } from '@nestjs/swagger';
import { ApiCommonErrors } from '../../shared/decorators/api-common-errors.decorator';
import { CurrentUser, Public } from '../../core/auth/decorators';
import type { AudioProgressDto, ProgressSyncDto, StreamResponseDto } from '@sd/core-contracts';
import { AudioService } from './audio.service';
import { CacheTTL } from '@nestjs/cache-manager';
import { LocaleCacheInterceptor } from '../../shared/interceptors/locale-cache.interceptor';
import { CacheControlInterceptor } from '../../shared/interceptors/cache-control.interceptor';

/** NestJS audio controller service or controller coordinating the API boundary for this responsibility. */
@ApiTags('Audio')
@ApiCommonErrors()
@Controller('audio')
/** audio application module responsible for audio.controller behavior at the backend boundary. */
// oxlint-disable-next-line anti-slop/require-tsdoc -- NestJS decorators separate the declaration from its TSDoc.
export class AudioController {
  constructor(private readonly audio: AudioService) {}

  @Get('progress')
  @ApiOperation({ summary: 'Get all or delta progress entries for user' })
  @ApiOkResponse({ description: 'User progress entries' })
  getProgress(
    @CurrentUser() user: { id: string },
    @Query('since') since?: string,
  ): Promise<AudioProgressDto[]> {
    return this.audio.getUserProgress(user.id, since);
  }

  @Post('progress/sync')
  @ApiOperation({ summary: 'Bulk sync progress from client' })
  @ApiOkResponse({ description: 'Progress synced' })
  syncProgress(@CurrentUser() user: { id: string }, @Body() body: ProgressSyncDto): Promise<void> {
    return this.audio.bulkSync(user.id, body.items ?? []);
  }

  @Put('progress/:slug')
  @ApiOperation({ summary: 'Update listing progress by public slug' })
  @ApiOkResponse({ description: 'Progress updated' })
  upsertProgress(
    @CurrentUser() user: { id: string },
    @Param('slug') slug: string,
    @Body()
    body: {
      positionSeconds: number;
      /** Documents the durationSeconds field's API projection semantics and lifecycle meaning. */
      durationSeconds?: number;
      isCompleted?: boolean;
    },
  ): Promise<void> {
    return this.audio.upsertProgress(
      user.id,
      slug,
      body.positionSeconds,
      body.durationSeconds,
      body.isCompleted,
    );
  }

  @Public()
  @Get('listings/:slug/stream')
  @UseInterceptors(CacheControlInterceptor, LocaleCacheInterceptor)
  @CacheTTL(3 * 24 * 60 * 60 * 1000) // Stream metadata almost never changes; writes clear cache
  @ApiOperation({ summary: 'Resolve a listing primary audio stream by public slug' })
  @ApiOkResponse({ description: 'Primary audio asset URL and duration' })
  getListingStream(@Param('slug') slug: string): Promise<StreamResponseDto> {
    return this.audio.resolveStreamUrl(slug);
  }
}
