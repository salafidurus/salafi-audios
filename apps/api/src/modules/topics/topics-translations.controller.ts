import { Controller, Get, Post, Patch, Param, Body } from '@nestjs/common';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { ApiCommonErrors } from '../../shared/decorators/api-common-errors.decorator';
import { CheckPolicy } from '../../core/auth/decorators/check-policy.decorator';
import { resolveUnscoped } from '../../core/auth/policy-resolvers';
import { TopicsService } from './topics.service';
import { SaveTopicTranslationDto } from './dto/save-topic-translation.dto';

// Topics are never scholar/locale-scoped resources — unconditioned checks only.
@ApiTags('Topic Translations')
@ApiCommonErrors()
@Controller('topics')
export class TopicsTranslationsController {
  constructor(private readonly service: TopicsService) {}

  @Get(':id/translations')
  @CheckPolicy('read', 'Translation', resolveUnscoped)
  @ApiOperation({ summary: 'List translations for a topic' })
  listTranslations(@Param('id') id: string) {
    return this.service.listTranslations(id);
  }

  @Post(':id/translations')
  @CheckPolicy('create', 'Translation', resolveUnscoped)
  @ApiOperation({ summary: 'Upsert a topic translation' })
  upsertTranslation(@Param('id') id: string, @Body() dto: SaveTopicTranslationDto) {
    return this.service.upsertTranslation(id, dto);
  }

  @Patch(':id/translations/:locale')
  @CheckPolicy('update', 'Translation', resolveUnscoped)
  @ApiOperation({ summary: 'Partially update a topic translation' })
  updateTranslation(
    @Param('id') id: string,
    @Param('locale') locale: string,
    @Body() body: Partial<{ name: string }>,
  ) {
    return this.service.updateTranslation(id, locale, body);
  }
}
