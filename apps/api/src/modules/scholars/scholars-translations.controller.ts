import { Controller, Get, Post, Patch, Param, Body, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { Permissions } from '@sd/core-contracts';
import { ApiCommonErrors } from '../../shared/decorators/api-common-errors.decorator';
import { RequiresPermission } from '../../shared/decorators/requires-permission.decorator';
import { AdminPermissionGuard } from '../../shared/guards/admin-permission.guard';
import { ScholarsService } from './scholars.service';
import { SaveScholarTranslationDto } from './dto/save-scholar-translation.dto';
import { UpdateScholarTranslationDto } from './dto/update-scholar-translation.dto';

@ApiTags('Scholar Translations')
@ApiCommonErrors()
@Controller('scholars')
@UseGuards(AdminPermissionGuard)
export class ScholarsTranslationsController {
  constructor(private readonly service: ScholarsService) {}

  @Get(':id/translations')
  @RequiresPermission(Permissions.TRANSLATIONS_VIEW)
  @ApiOperation({ summary: 'List translations for a scholar' })
  listTranslations(@Param('id') id: string) {
    return this.service.listTranslations(id);
  }

  @Post(':id/translations')
  @RequiresPermission(Permissions.TRANSLATIONS_CREATE)
  @ApiOperation({ summary: 'Upsert a scholar translation' })
  upsertTranslation(@Param('id') id: string, @Body() dto: SaveScholarTranslationDto) {
    return this.service.upsertTranslation(id, dto);
  }

  @Patch(':id/translations/:locale')
  @RequiresPermission(Permissions.TRANSLATIONS_EDIT)
  @ApiOperation({ summary: 'Partially update a scholar translation' })
  updateTranslation(
    @Param('id') id: string,
    @Param('locale') locale: string,
    @Body() body: UpdateScholarTranslationDto,
  ) {
    return this.service.updateTranslation(id, locale, body);
  }

  @Post(':id/translations/:locale/publish')
  @RequiresPermission(Permissions.TRANSLATIONS_PUBLISH)
  @ApiOperation({ summary: 'Publish a scholar translation' })
  publishTranslation(@Param('id') id: string, @Param('locale') locale: string) {
    return this.service.publishTranslation(id, locale);
  }

  @Post(':id/translations/:locale/unpublish')
  @RequiresPermission(Permissions.TRANSLATIONS_PUBLISH)
  @ApiOperation({ summary: 'Unpublish a scholar translation' })
  unpublishTranslation(@Param('id') id: string, @Param('locale') locale: string) {
    return this.service.unpublishTranslation(id, locale);
  }
}
