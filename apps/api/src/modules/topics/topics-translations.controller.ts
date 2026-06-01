import {
  Controller,
  Get,
  Post,
  Patch,
  Param,
  Body,
  UseGuards,
} from '@nestjs/common';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { ApiCommonErrors } from '../../shared/decorators/api-common-errors.decorator';
import { RequiresPermission } from '../../shared/decorators/requires-permission.decorator';
import { AdminPermissionGuard } from '../../shared/guards/admin-permission.guard';
import { TopicsService } from './topics.service';
import { SaveTopicTranslationDto } from './dto/save-topic-translation.dto';

@ApiTags('Topic Translations')
@ApiCommonErrors()
@Controller('topics')
@UseGuards(AdminPermissionGuard)
export class TopicsTranslationsController {
  constructor(private readonly service: TopicsService) {}

  @Get(':id/translations')
  @RequiresPermission('manage:content')
  @ApiOperation({ summary: 'List translations for a topic' })
  listTranslations(@Param('id') id: string) {
    return this.service.listTranslations(id);
  }

  @Post(':id/translations')
  @RequiresPermission('manage:content')
  @ApiOperation({ summary: 'Upsert a topic translation' })
  upsertTranslation(
    @Param('id') id: string,
    @Body() dto: SaveTopicTranslationDto,
  ) {
    return this.service.upsertTranslation(id, dto);
  }

  @Patch(':id/translations/:locale')
  @RequiresPermission('manage:content')
  @ApiOperation({ summary: 'Partially update a topic translation' })
  updateTranslation(
    @Param('id') id: string,
    @Param('locale') locale: string,
    @Body() body: Partial<{ name: string }>,
  ) {
    return this.service.updateTranslation(id, locale, body);
  }

  @Post(':id/translations/:locale/publish')
  @RequiresPermission('manage:content')
  @ApiOperation({ summary: 'Publish a topic translation' })
  publishTranslation(@Param('id') id: string, @Param('locale') locale: string) {
    return this.service.publishTranslation(id, locale);
  }

  @Post(':id/translations/:locale/unpublish')
  @RequiresPermission('manage:content')
  @ApiOperation({ summary: 'Unpublish a topic translation' })
  unpublishTranslation(
    @Param('id') id: string,
    @Param('locale') locale: string,
  ) {
    return this.service.unpublishTranslation(id, locale);
  }
}
