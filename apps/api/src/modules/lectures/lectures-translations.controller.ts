import { Controller, Get, Post, Patch, Param, Body, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { ApiCommonErrors } from '../../shared/decorators/api-common-errors.decorator';
import { RequiresPermission } from '../../shared/decorators/requires-permission.decorator';
import { AdminPermissionGuard } from '../../shared/guards/admin-permission.guard';
import { LecturesService } from './lectures.service';
import { SaveLectureTranslationDto } from './dto/save-lecture-translation.dto';

@ApiTags('Lecture Translations')
@ApiCommonErrors()
@Controller('lectures')
@UseGuards(AdminPermissionGuard)
export class LecturesTranslationsController {
  constructor(private readonly service: LecturesService) {}

  @Get(':id/translations')
  @RequiresPermission('manage:content')
  @ApiOperation({ summary: 'List translations for a lecture' })
  listTranslations(@Param('id') id: string) {
    return this.service.listTranslations(id);
  }

  @Post(':id/translations')
  @RequiresPermission('manage:content')
  @ApiOperation({ summary: 'Upsert a lecture translation' })
  upsertTranslation(@Param('id') id: string, @Body() dto: SaveLectureTranslationDto) {
    return this.service.upsertTranslation(id, dto);
  }

  @Patch(':id/translations/:locale')
  @RequiresPermission('manage:content')
  @ApiOperation({ summary: 'Partially update a lecture translation' })
  updateTranslation(
    @Param('id') id: string,
    @Param('locale') locale: string,
    @Body() body: Partial<{ title: string; description: string | null }>,
  ) {
    return this.service.updateTranslation(id, locale, body);
  }

  @Post(':id/translations/:locale/publish')
  @RequiresPermission('manage:content')
  @ApiOperation({ summary: 'Publish a lecture translation' })
  publishTranslation(@Param('id') id: string, @Param('locale') locale: string) {
    return this.service.publishTranslation(id, locale);
  }

  @Post(':id/translations/:locale/unpublish')
  @RequiresPermission('manage:content')
  @ApiOperation({ summary: 'Unpublish a lecture translation' })
  unpublishTranslation(@Param('id') id: string, @Param('locale') locale: string) {
    return this.service.unpublishTranslation(id, locale);
  }
}
