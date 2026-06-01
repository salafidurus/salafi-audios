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
import { ScholarsService } from './scholars.service';
import { SaveSeriesTranslationDto } from './dto/save-series-translation.dto';

@ApiTags('Series Translations')
@ApiCommonErrors()
@Controller('scholars/:scholarId/series')
@UseGuards(AdminPermissionGuard)
export class SeriesTranslationsController {
  constructor(private readonly service: ScholarsService) {}

  @Get(':seriesId/translations')
  @RequiresPermission('manage:content')
  @ApiOperation({ summary: 'List translations for a series' })
  listTranslations(@Param('seriesId') seriesId: string) {
    return this.service.listSeriesTranslations(seriesId);
  }

  @Post(':seriesId/translations')
  @RequiresPermission('manage:content')
  @ApiOperation({ summary: 'Upsert a series translation' })
  upsertTranslation(
    @Param('seriesId') seriesId: string,
    @Body() dto: SaveSeriesTranslationDto,
  ) {
    return this.service.upsertSeriesTranslation(seriesId, dto);
  }

  @Patch(':seriesId/translations/:locale')
  @RequiresPermission('manage:content')
  @ApiOperation({ summary: 'Partially update a series translation' })
  updateTranslation(
    @Param('seriesId') seriesId: string,
    @Param('locale') locale: string,
    @Body() body: Partial<{ title: string; description: string | null }>,
  ) {
    return this.service.updateSeriesTranslation(seriesId, locale, body);
  }

  @Post(':seriesId/translations/:locale/publish')
  @RequiresPermission('manage:content')
  @ApiOperation({ summary: 'Publish a series translation' })
  publishTranslation(
    @Param('seriesId') seriesId: string,
    @Param('locale') locale: string,
  ) {
    return this.service.publishSeriesTranslation(seriesId, locale);
  }

  @Post(':seriesId/translations/:locale/unpublish')
  @RequiresPermission('manage:content')
  @ApiOperation({ summary: 'Unpublish a series translation' })
  unpublishTranslation(
    @Param('seriesId') seriesId: string,
    @Param('locale') locale: string,
  ) {
    return this.service.unpublishSeriesTranslation(seriesId, locale);
  }
}
