import { Controller, Get, Post, Patch, Param, Body, Query, Inject } from '@nestjs/common';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import type { Cache } from 'cache-manager';
import { Permissions, SUPPORTED_LOCALES } from '@sd/core-contracts';
import { ApiCommonErrors } from '../../shared/decorators/api-common-errors.decorator';
import { RequiresPermission } from '../../core/auth/decorators';
import { ScholarsService } from './scholars.service';
import { CreateScholarDto } from './dto/create-scholar.dto';
import { UpdateScholarDto } from './dto/update-scholar.dto';

@ApiTags('Admin Scholars')
@ApiCommonErrors()
@Controller('admin/scholars')
export class AdminScholarsController {
  constructor(
    private readonly service: ScholarsService,
    @Inject(CACHE_MANAGER) private cacheManager: Cache,
  ) {}

  @Get()
  @RequiresPermission(Permissions.SCHOLARS_VIEW)
  @ApiOperation({ summary: 'List all scholars (including inactive)' })
  list(@Query('cursor') cursor?: string) {
    return this.service.adminList(cursor);
  }

  @Get(':id/form-data')
  @RequiresPermission(Permissions.SCHOLARS_EDIT)
  @ApiOperation({ summary: 'Get scholar with translations for edit form' })
  getFormData(@Param('id') id: string) {
    return this.service.getFormData(id);
  }

  private async invalidateScholarsCache(slug?: string) {
    // LocaleCacheInterceptor uses format: ${url}:${locale}[:${userId}]
    const cacheKeysToInvalidate: string[] = [];

    // Invalidate list cache
    for (const locale of SUPPORTED_LOCALES) {
      cacheKeysToInvalidate.push(`/scholars:${locale}`);
    }

    // Also invalidate detail cache when a specific slug is provided
    if (slug) {
      for (const locale of SUPPORTED_LOCALES) {
        cacheKeysToInvalidate.push(`/scholars/${slug}:${locale}`);
      }
    }

    await Promise.all(cacheKeysToInvalidate.map((key) => this.cacheManager.del(key)));
  }

  @Post()
  @RequiresPermission(Permissions.SCHOLARS_CREATE)
  @ApiOperation({ summary: 'Create a scholar' })
  async create(@Body() dto: CreateScholarDto) {
    const result = await this.service.create(dto);
    await this.invalidateScholarsCache(result.slug);
    return result;
  }

  @Patch(':id')
  @RequiresPermission(Permissions.SCHOLARS_EDIT)
  @ApiOperation({ summary: 'Update a scholar' })
  async update(@Param('id') id: string, @Body() dto: UpdateScholarDto) {
    const result = await this.service.update(id, dto);
    await this.invalidateScholarsCache(result.slug);
    return result;
  }
}
