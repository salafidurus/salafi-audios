import { Controller, Get, Param } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiOkResponse } from '@nestjs/swagger';
import { ApiCommonErrors } from '../../shared/decorators/api-common-errors.decorator';
import { Public } from '../../modules/auth/decorators';
import { ListingService } from './listing.service';
import type { ListingDetailDto, RelatedListingDto } from '@sd/core-contracts';
import { SkipThrottle } from '@nestjs/throttler';

@SkipThrottle()
@ApiTags('Listings')
@ApiCommonErrors()
@Public()
@Controller('listings')
export class ListingController {
  constructor(private readonly service: ListingService) {}

  @Get(':id')
  @ApiOperation({ summary: 'Get listing detail by ID or slug' })
  @ApiOkResponse({
    description: 'Listing detail with scholar, topics, audio, and series context',
  })
  getById(@Param('id') id: string): Promise<ListingDetailDto> {
    return this.service.getById(id);
  }

  @Get(':id/related')
  @ApiOperation({ summary: 'Get related listings' })
  @ApiOkResponse({
    description: 'Related listings based on scholar, topics, and series',
  })
  getRelated(@Param('id') id: string): Promise<RelatedListingDto[]> {
    return this.service.getRelated(id);
  }
}
