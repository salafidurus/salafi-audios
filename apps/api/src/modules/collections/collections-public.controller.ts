import { Controller, Get, Param } from '@nestjs/common';
import { ApiOkResponse, ApiOperation, ApiTags } from '@nestjs/swagger';
import { SkipThrottle } from '@nestjs/throttler';
import { ApiCommonErrors } from '@/shared/decorators/api-common-errors.decorator';
import { CollectionService } from './collections.service';
import { CollectionViewDto } from './dto/collection-view.dto';

@SkipThrottle()
@ApiTags('Collections')
@ApiCommonErrors()
@Controller('collections')
export class CollectionsPublicController {
  constructor(private readonly collections: CollectionService) {}

  @Get(':id')
  @ApiOperation({ summary: 'Get a published collection by id' })
  @ApiOkResponse({ type: CollectionViewDto })
  getById(@Param('id') id: string): Promise<CollectionViewDto> {
    return this.collections.getPublishedById(id);
  }
}
