import { Controller, Get, Param } from '@nestjs/common';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { ApiCommonErrors } from '../../shared/decorators/api-common-errors.decorator';
import { Public } from '../../modules/auth/decorators';
import { ListingService } from './listing.service';

@ApiTags('Listing')
@ApiCommonErrors()
@Public()
@Controller('listing')
export class ListingController {
  constructor(private readonly service: ListingService) {}

  @Get(':id')
  @ApiOperation({ summary: 'Resolve a listing by ID — returns format + ID' })
  getById(@Param('id') id: string) {
    return this.service.getById(id);
  }
}
