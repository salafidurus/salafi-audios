import { Controller, Get, Post, Patch, Param, Body, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { ApiCommonErrors } from '../../shared/decorators/api-common-errors.decorator';
import { RequiresPermission } from '../../shared/decorators/requires-permission.decorator';
import { AdminPermissionGuard } from '../../shared/guards/admin-permission.guard';
import { ScholarsService } from './scholars.service';
import { SaveCollectionTranslationDto } from './dto/save-collection-translation.dto';
import { UpdateCollectionTranslationDto } from './dto/update-collection-translation.dto';

@ApiTags('Collection Translations')
@ApiCommonErrors()
@Controller('scholars/:scholarId/collections')
@UseGuards(AdminPermissionGuard)
export class CollectionTranslationsController {
  constructor(private readonly service: ScholarsService) {}

  @Get(':collectionId/translations')
  @RequiresPermission('manage:content')
  @ApiOperation({ summary: 'List translations for a collection' })
  listTranslations(@Param('collectionId') collectionId: string) {
    return this.service.listCollectionTranslations(collectionId);
  }

  @Post(':collectionId/translations')
  @RequiresPermission('manage:content')
  @ApiOperation({ summary: 'Upsert a collection translation' })
  upsertTranslation(
    @Param('collectionId') collectionId: string,
    @Body() dto: SaveCollectionTranslationDto,
  ) {
    return this.service.upsertCollectionTranslation(collectionId, dto);
  }

  @Patch(':collectionId/translations/:locale')
  @RequiresPermission('manage:content')
  @ApiOperation({ summary: 'Partially update a collection translation' })
  updateTranslation(
    @Param('collectionId') collectionId: string,
    @Param('locale') locale: string,
    @Body() body: UpdateCollectionTranslationDto,
  ) {
    return this.service.updateCollectionTranslation(collectionId, locale, body);
  }

  @Post(':collectionId/translations/:locale/publish')
  @RequiresPermission('manage:content')
  @ApiOperation({ summary: 'Publish a collection translation' })
  publishTranslation(@Param('collectionId') collectionId: string, @Param('locale') locale: string) {
    return this.service.publishCollectionTranslation(collectionId, locale);
  }

  @Post(':collectionId/translations/:locale/unpublish')
  @RequiresPermission('manage:content')
  @ApiOperation({ summary: 'Unpublish a collection translation' })
  unpublishTranslation(
    @Param('collectionId') collectionId: string,
    @Param('locale') locale: string,
  ) {
    return this.service.unpublishCollectionTranslation(collectionId, locale);
  }
}
