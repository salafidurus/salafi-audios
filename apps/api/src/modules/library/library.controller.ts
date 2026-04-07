import {
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Query,
  Body,
} from '@nestjs/common';
import { ApiOkResponse, ApiOperation, ApiTags } from '@nestjs/swagger';
import { ApiCommonErrors } from '../../shared/decorators/api-common-errors.decorator';
import { CurrentUser } from '../../modules/auth/decorators';
import type { LibraryPageDto } from '@sd/core-contracts';
import { LibraryService } from './library.service';

@ApiTags('Library')
@ApiCommonErrors()
@Controller('me/library')
export class LibraryController {
  constructor(private readonly library: LibraryService) {}

  @Get('progress')
  @ApiOperation({ summary: 'Get in-progress lectures' })
  @ApiOkResponse({ description: 'Paginated in-progress lectures' })
  getProgress(
    @CurrentUser() user: { id: string },
    @Query('cursor') cursor?: string,
  ): Promise<LibraryPageDto> {
    return this.library.getInProgress(user.id, cursor);
  }

  @Get('completed')
  @ApiOperation({ summary: 'Get completed lectures' })
  @ApiOkResponse({ description: 'Paginated completed lectures' })
  getCompleted(
    @CurrentUser() user: { id: string },
    @Query('cursor') cursor?: string,
  ): Promise<LibraryPageDto> {
    return this.library.getCompleted(user.id, cursor);
  }

  @Get('saved')
  @ApiOperation({ summary: 'Get saved (favorite) lectures' })
  @ApiOkResponse({ description: 'Paginated saved lectures' })
  getSaved(
    @CurrentUser() user: { id: string },
    @Query('cursor') cursor?: string,
  ): Promise<LibraryPageDto> {
    return this.library.getSaved(user.id, cursor);
  }

  @Post('saved/sync')
  @ApiOperation({ summary: 'Bulk sync saved lectures' })
  @ApiOkResponse({ description: 'Saved lectures synced' })
  syncSaved(
    @CurrentUser() user: { id: string },
    @Body() body: { lectureIds: string[] },
  ): Promise<void> {
    return this.library.bulkSave(user.id, body.lectureIds ?? []);
  }

  @Post('saved/:lectureId')
  @ApiOperation({ summary: 'Save a lecture' })
  @ApiOkResponse({ description: 'Lecture saved' })
  saveLecture(
    @CurrentUser() user: { id: string },
    @Param('lectureId') lectureId: string,
  ): Promise<void> {
    return this.library.saveLecture(user.id, lectureId);
  }

  @Delete('saved/:lectureId')
  @ApiOperation({ summary: 'Unsave a lecture' })
  @ApiOkResponse({ description: 'Lecture unsaved' })
  unsaveLecture(
    @CurrentUser() user: { id: string },
    @Param('lectureId') lectureId: string,
  ): Promise<void> {
    return this.library.unsaveLecture(user.id, lectureId);
  }
}
