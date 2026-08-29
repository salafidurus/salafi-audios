/** my library application module responsible for my library.controller behavior at the backend boundary. */
/** my library application module responsible for my library.controller behavior at the backend boundary. */
import { Controller, Delete, Get, Param, Post, Query, Body } from '@nestjs/common';
import { ApiOkResponse, ApiOperation, ApiTags } from '@nestjs/swagger';
import { ApiCommonErrors } from '../../shared/decorators/api-common-errors.decorator';
import { CurrentUser } from '../../core/auth/decorators';
import type { MyLibraryPageDto, RecentProgressDto, SavedDeltaItemDto } from '@sd/core-contracts';
import { MyLibraryService } from './my-library.service';
import { SavedSyncDtoSchema, type SavedSyncDto } from './dto/saved-sync.dto';

/** NestJS my library controller service or controller coordinating the API boundary for this responsibility. */
@ApiTags('My Library')
@ApiCommonErrors()
@Controller('me/my-library')
/** my-library application module responsible for my library.controller behavior at the backend boundary. */
// oxlint-disable-next-line anti-slop/require-tsdoc -- NestJS decorators separate the declaration from its TSDoc.
export class MyLibraryController {
  constructor(private readonly myLibrary: MyLibraryService) {}

  @Get('recent-progress')
  @ApiOperation({ summary: 'Get most recent listening progress' })
  @ApiOkResponse({ description: 'Most recent in-progress listing or null' })
  getRecentProgress(@CurrentUser() user: { id: string }): Promise<RecentProgressDto | null> {
    return this.myLibrary.getRecentProgress(user.id);
  }

  @Get('progress')
  @ApiOperation({ summary: 'Get in-progress listings' })
  @ApiOkResponse({ description: 'Paginated in-progress listings' })
  getProgress(
    @CurrentUser() user: { id: string },
    @Query('cursor') cursor?: string,
  ): Promise<MyLibraryPageDto> {
    return this.myLibrary.getInProgress(user.id, cursor);
  }

  @Get('completed')
  @ApiOperation({ summary: 'Get completed listings' })
  @ApiOkResponse({ description: 'Paginated completed listings' })
  getCompleted(
    @CurrentUser() user: { id: string },
    @Query('cursor') cursor?: string,
  ): Promise<MyLibraryPageDto> {
    return this.myLibrary.getCompleted(user.id, cursor);
  }

  @Get('saved')
  @ApiOperation({ summary: 'Get saved (favorite) listings' })
  @ApiOkResponse({ description: 'Paginated saved listings' })
  getSaved(
    @CurrentUser() user: { id: string },
    @Query('cursor') cursor?: string,
  ): Promise<MyLibraryPageDto> {
    return this.myLibrary.getSaved(user.id, cursor);
  }

  @Get('saved/delta')
  @ApiOperation({
    summary: 'Get saved (favorite) listings changed since a cursor, including tombstones',
  })
  @ApiOkResponse({ description: 'Delta of saved listings, including removals' })
  getSavedDelta(
    @CurrentUser() user: { id: string },
    @Query('since') since?: string,
  ): Promise<SavedDeltaItemDto[]> {
    return this.myLibrary.getSavedDelta(user.id, since);
  }

  @Post('saved/sync')
  @ApiOperation({ summary: 'Bulk sync saved listings' })
  @ApiOkResponse({ description: 'Saved listings synced' })
  syncSaved(
    @CurrentUser() user: { id: string },
    @Body({ schema: SavedSyncDtoSchema }) body: SavedSyncDto,
  ): Promise<void> {
    return this.myLibrary.bulkSyncSaved(user.id, body.items ?? []);
  }

  @Post('save/:slug')
  @ApiOperation({ summary: 'Save a listing by public slug' })
  @ApiOkResponse({ description: 'Listing saved' })
  saveListing(@CurrentUser() user: { id: string }, @Param('slug') slug: string): Promise<void> {
    return this.myLibrary.saveListing(user.id, slug);
  }

  @Delete('save/:slug')
  @ApiOperation({ summary: 'Unsave a listing by public slug' })
  @ApiOkResponse({ description: 'Listing unsaved' })
  unsaveListing(@CurrentUser() user: { id: string }, @Param('slug') slug: string): Promise<void> {
    return this.myLibrary.unsaveListing(user.id, slug);
  }
}
