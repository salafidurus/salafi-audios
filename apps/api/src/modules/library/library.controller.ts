import { Controller, Delete, Get, Param, Post, Query, Body } from '@nestjs/common';
import { ApiOkResponse, ApiOperation, ApiTags } from '@nestjs/swagger';
import { ApiCommonErrors } from '../../shared/decorators/api-common-errors.decorator';
import { CurrentUser } from '../../modules/auth/decorators';
import type { LibraryPageDto } from '@sd/core-contracts';
import { LibraryService } from './library.service';
import { SavedSyncDto } from './dto/saved-sync.dto';

@ApiTags('Library')
@ApiCommonErrors()
@Controller('me/library')
export class LibraryController {
  constructor(private readonly library: LibraryService) {}

  @Get('progress')
  @ApiOperation({ summary: 'Get in-progress listings' })
  @ApiOkResponse({ description: 'Paginated in-progress listings' })
  getProgress(
    @CurrentUser() user: { id: string },
    @Query('cursor') cursor?: string,
  ): Promise<LibraryPageDto> {
    return this.library.getInProgress(user.id, cursor);
  }

  @Get('completed')
  @ApiOperation({ summary: 'Get completed listings' })
  @ApiOkResponse({ description: 'Paginated completed listings' })
  getCompleted(
    @CurrentUser() user: { id: string },
    @Query('cursor') cursor?: string,
  ): Promise<LibraryPageDto> {
    return this.library.getCompleted(user.id, cursor);
  }

  @Get('saved')
  @ApiOperation({ summary: 'Get saved (favorite) listings' })
  @ApiOkResponse({ description: 'Paginated saved listings' })
  getSaved(
    @CurrentUser() user: { id: string },
    @Query('cursor') cursor?: string,
  ): Promise<LibraryPageDto> {
    return this.library.getSaved(user.id, cursor);
  }

  @Post('saved/sync')
  @ApiOperation({ summary: 'Bulk sync saved listings' })
  @ApiOkResponse({ description: 'Saved listings synced' })
  syncSaved(@CurrentUser() user: { id: string }, @Body() body: SavedSyncDto): Promise<void> {
    return this.library.bulkSave(user.id, body.listingIds ?? []);
  }

  @Post('save/:listingId')
  @ApiOperation({ summary: 'Save a listing' })
  @ApiOkResponse({ description: 'Listing saved' })
  saveListing(
    @CurrentUser() user: { id: string },
    @Param('listingId') listingId: string,
  ): Promise<void> {
    return this.library.saveListing(user.id, listingId);
  }

  @Delete('save/:listingId')
  @ApiOperation({ summary: 'Unsave a listing' })
  @ApiOkResponse({ description: 'Listing unsaved' })
  unsaveListing(
    @CurrentUser() user: { id: string },
    @Param('listingId') listingId: string,
  ): Promise<void> {
    return this.library.unsaveListing(user.id, listingId);
  }
}
