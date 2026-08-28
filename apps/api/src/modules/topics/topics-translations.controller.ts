import { Controller, Get, Post, Patch, Param, Body } from '@nestjs/common';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { LocaleSchema } from '@sd/core-contracts';
import { ApiCommonErrors } from '../../shared/decorators/api-common-errors.decorator';
import { CheckPolicy } from '../../core/auth/decorators/check-policy.decorator';
import { resolveUnscoped } from '../../core/auth/policy-resolvers';
import { TopicsService } from './topics.service';
import { SaveTopicTranslationDto } from './dto/save-topic-translation.dto';

// Topics are never scholar/locale-scoped resources — unconditioned checks only.
/** NestJS topics translations controller service or controller coordinating the API boundary for this responsibility. */
@ApiTags('Topic Translations')
@ApiCommonErrors()
@Controller('topics')
/** topics application module responsible for topics translations.controller behavior at the backend boundary. */
// oxlint-disable-next-line anti-slop/require-tsdoc -- NestJS decorators separate the declaration from its TSDoc.
export class TopicsTranslationsController {
  constructor(private readonly service: TopicsService) {}

  @Get(':id/translations')
  @ApiOperation({ summary: 'List translations for a topic' })
  listTranslations(@Param('id') id: string) {
    return this.service.listTranslations(id);
  }

  @Post(':id/translations')
  @CheckPolicy('translate', 'Translation', resolveUnscoped)
  @ApiOperation({ summary: 'Upsert a topic translation' })
  upsertTranslation(@Param('id') id: string, @Body() dto: SaveTopicTranslationDto) {
    return this.service.upsertTranslation(id, dto);
  }

  @Patch(':id/translations/:locale')
  @CheckPolicy('translate', 'Translation', resolveUnscoped)
  @ApiOperation({ summary: 'Partially update a topic translation' })
  updateTranslation(
    @Param('id') id: string,
    @Param('locale') locale: string,
    @Body() body: Partial<{ name: string }>,
  ) {
    return this.service.updateTranslation(id, LocaleSchema.parse(locale), body);
  }
}
