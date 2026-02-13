import { Controller, Get, Param } from '@nestjs/common';
import { ApiOkResponse, ApiOperation, ApiTags } from '@nestjs/swagger';
import { ApiCommonErrors } from '@/shared/decorators/api-common-errors.decorator';
import { SkipThrottle } from '@nestjs/throttler';
import { CollectionService } from './collections.service';
import { CollectionViewDto } from './dto/collection-view.dto';

@SkipThrottle()
@ApiTags('Collections')
@ApiCommonErrors()
@Controller('scholars/:scholarSlug/collections')
export class CollectionsController {
  constructor(private readonly collections: CollectionService) {}

  @Get()
  @ApiOperation({ summary: 'List published collections for a scholar' })
  @ApiOkResponse({ type: [CollectionViewDto] })
  list(
    @Param('scholarSlug') scholarSlug: string,
  ): Promise<CollectionViewDto[]> {
    return this.collections.listPublished(scholarSlug);
  }

  @Get(':slug')
  @ApiOperation({ summary: 'Get a published collection by slug' })
  @ApiOkResponse({ type: CollectionViewDto })
  get(
    @Param('scholarSlug') scholarSlug: string,
    @Param('slug') slug: string,
  ): Promise<CollectionViewDto> {
    return this.collections.getPublished(scholarSlug, slug);
  }
}
