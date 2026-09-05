import { Controller, Get, Post, Patch, Param, Body } from '@nestjs/common';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import {
  LocaleSchema,
  SaveScholarTranslationDtoSchema,
  UpdateScholarTranslationDtoSchema,
  type SaveScholarTranslationDto,
  type UpdateScholarTranslationDto,
} from '@sd/core-contracts';
import { ApiCommonErrors } from '../../shared/decorators/api-common-errors.decorator';
import { CheckPolicy } from '../../core/auth/decorators/check-policy.decorator';
import { resolveScholarTranslation } from '../../core/auth/policy-resolvers';
import { ScholarsService } from './scholars.service';

/** NestJS scholars translations controller service or controller coordinating the API boundary for this responsibility. */
@ApiTags('Scholar Translations')
@ApiCommonErrors()
@Controller({ path: 'scholars', version: '1' })
/** scholars application module responsible for scholars translations.controller behavior at the backend boundary. */
// oxlint-disable-next-line anti-slop/require-tsdoc -- NestJS decorators separate the declaration from its TSDoc.
export class ScholarsTranslationsController {
  constructor(private readonly service: ScholarsService) {}

  @Get(':slug/translations')
  @ApiOperation({ summary: 'List translations for a scholar' })
  listTranslations(@Param('slug') slug: string) {
    return this.service.listTranslations(slug);
  }

  @Post(':slug/translations')
  @CheckPolicy('translate', 'Translation', resolveScholarTranslation())
  @ApiOperation({ summary: 'Upsert a scholar translation' })
  upsertTranslation(
    @Param('slug') slug: string,
    @Body({ schema: SaveScholarTranslationDtoSchema }) dto: SaveScholarTranslationDto,
  ) {
    return this.service.upsertTranslation(slug, dto);
  }

  @Patch(':slug/translations/:locale')
  @CheckPolicy('translate', 'Translation', resolveScholarTranslation())
  @ApiOperation({ summary: 'Partially update a scholar translation' })
  updateTranslation(
    @Param('slug') slug: string,
    @Param('locale', { schema: LocaleSchema }) locale: string,
    @Body({ schema: UpdateScholarTranslationDtoSchema }) body: UpdateScholarTranslationDto,
  ) {
    return this.service.updateTranslation(slug, LocaleSchema.parse(locale), body);
  }

  @Post(':slug/translations/:locale/publish')
  @CheckPolicy('publish', 'Translation', resolveScholarTranslation())
  @ApiOperation({ summary: 'Publish a scholar translation' })
  publishTranslation(
    @Param('slug') slug: string,
    @Param('locale', { schema: LocaleSchema }) locale: string,
  ) {
    return this.service.publishTranslation(slug, LocaleSchema.parse(locale));
  }

  @Post(':slug/translations/:locale/unpublish')
  @CheckPolicy('publish', 'Translation', resolveScholarTranslation())
  @ApiOperation({ summary: 'Unpublish a scholar translation' })
  unpublishTranslation(
    @Param('slug') slug: string,
    @Param('locale', { schema: LocaleSchema }) locale: string,
  ) {
    return this.service.unpublishTranslation(slug, LocaleSchema.parse(locale));
  }
}
