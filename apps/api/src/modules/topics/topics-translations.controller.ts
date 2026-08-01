import { Controller, Get, Post, Patch, Param, Body } from '@nestjs/common';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { Permissions } from '@sd/core-contracts';
import { ApiCommonErrors } from '../../shared/decorators/api-common-errors.decorator';
import { RequiresPermission } from '../../core/auth/decorators';
import { TopicsService } from './topics.service';
import { SaveTopicTranslationDto } from './dto/save-topic-translation.dto';

@ApiTags('Topic Translations')
@ApiCommonErrors()
@Controller('topics')
export class TopicsTranslationsController {
  constructor(private readonly service: TopicsService) {}

  @Get(':id/translations')
  @RequiresPermission(Permissions.TRANSLATIONS_VIEW)
  @ApiOperation({ summary: 'List translations for a topic' })
  listTranslations(@Param('id') id: string) {
    return this.service.listTranslations(id);
  }

  @Post(':id/translations')
  @RequiresPermission(Permissions.TRANSLATIONS_CREATE)
  @ApiOperation({ summary: 'Upsert a topic translation' })
  upsertTranslation(@Param('id') id: string, @Body() dto: SaveTopicTranslationDto) {
    return this.service.upsertTranslation(id, dto);
  }

  @Patch(':id/translations/:locale')
  @RequiresPermission(Permissions.TRANSLATIONS_EDIT)
  @ApiOperation({ summary: 'Partially update a topic translation' })
  updateTranslation(
    @Param('id') id: string,
    @Param('locale') locale: string,
    @Body() body: Partial<{ name: string }>,
  ) {
    return this.service.updateTranslation(id, locale, body);
  }
}
