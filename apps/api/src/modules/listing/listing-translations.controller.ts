import { Controller, Get, Post, Patch, Param, Body } from '@nestjs/common';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { ApiCommonErrors } from '../../shared/decorators/api-common-errors.decorator';
import { CheckPolicy } from '../../core/auth/decorators/check-policy.decorator';
import { resolveListingTranslation } from '../../core/auth/policy-resolvers';
import { ListingService } from './listing.service';
import { SaveListingTranslationDto } from './dto/save-listing-translation.dto';

@ApiTags('Listing Translations')
@ApiCommonErrors()
@Controller('listings')
export class ListingTranslationsController {
  constructor(private readonly service: ListingService) {}

  @Get(':slug/translations')
  @ApiOperation({ summary: 'List translations for a listing' })
  listTranslations(@Param('slug') slug: string) {
    return this.service.listTranslations(slug);
  }

  @Post(':slug/translations')
  @CheckPolicy('translate', 'Translation', resolveListingTranslation())
  @ApiOperation({ summary: 'Upsert a listing translation' })
  upsertTranslation(@Param('slug') slug: string, @Body() dto: SaveListingTranslationDto) {
    return this.service.upsertTranslation(slug, dto);
  }

  @Patch(':slug/translations/:locale')
  @CheckPolicy('translate', 'Translation', resolveListingTranslation())
  @ApiOperation({ summary: 'Partially update a listing translation' })
  updateTranslation(
    @Param('slug') slug: string,
    @Param('locale') locale: string,
    @Body() body: Partial<{ title: string; description: string | null }>,
  ) {
    return this.service.updateTranslation(slug, locale, body);
  }

  @Post(':slug/translations/:locale/publish')
  @CheckPolicy('publish', 'Translation', resolveListingTranslation())
  @ApiOperation({ summary: 'Publish a listing translation' })
  publishTranslation(@Param('slug') slug: string, @Param('locale') locale: string) {
    return this.service.publishTranslation(slug, locale);
  }

  @Post(':slug/translations/:locale/unpublish')
  @CheckPolicy('publish', 'Translation', resolveListingTranslation())
  @ApiOperation({ summary: 'Unpublish a listing translation' })
  unpublishTranslation(@Param('slug') slug: string, @Param('locale') locale: string) {
    return this.service.unpublishTranslation(slug, locale);
  }
}
