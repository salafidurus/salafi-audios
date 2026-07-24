import { Controller, Get, Post, Put, Delete, Param, Body, Inject } from '@nestjs/common';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import type { Cache } from 'cache-manager';
import { Permissions, SUPPORTED_LOCALES } from '@sd/core-contracts';
import { ApiCommonErrors } from '../../shared/decorators/api-common-errors.decorator';
import { RequiresPermission } from '../../core/auth/decorators';
import { TopicsService } from './topics.service';
import { CreateTopicDto } from './dto/create-topic.dto';
import { UpdateTopicDto } from './dto/update-topic.dto';

@ApiTags('Admin Topics')
@ApiCommonErrors()
@Controller('admin/topics')
export class AdminTopicsController {
  constructor(
    private readonly service: TopicsService,
    @Inject(CACHE_MANAGER) private cacheManager: Cache,
  ) {}

  @Get(':slug')
  @RequiresPermission(Permissions.TOPICS_EDIT)
  @ApiOperation({ summary: 'Get topic detail with translations' })
  getDetail(@Param('slug') slug: string) {
    return this.service.getAdminDetail(slug);
  }

  private async invalidateTopicsCache() {
    // LocaleCacheInterceptor uses format: ${url}:${locale}[:${userId}]
    // Must invalidate both list cache AND detail caches for all locales
    const cacheKeysToInvalidate: string[] = [];

    // Invalidate list cache
    for (const locale of SUPPORTED_LOCALES) {
      cacheKeysToInvalidate.push(`/topics:${locale}`);
    }

    // Also invalidate detail caches (attempted slugs from recent operations)
    // This catches the current topic being edited
    if (this.lastModifiedTopicSlug) {
      for (const locale of SUPPORTED_LOCALES) {
        cacheKeysToInvalidate.push(`/topics/${this.lastModifiedTopicSlug}:${locale}`);
      }
    }

    await Promise.all(cacheKeysToInvalidate.map((key) => this.cacheManager.del(key)));
  }

  private lastModifiedTopicSlug?: string;

  @Post()
  @RequiresPermission(Permissions.TOPICS_CREATE)
  @ApiOperation({ summary: 'Create a topic with translations' })
  async create(@Body() dto: CreateTopicDto) {
    const result = await this.service.createWithTranslations(dto);
    this.lastModifiedTopicSlug = result.slug;
    await this.invalidateTopicsCache();
    return result;
  }

  @Put(':slug')
  @RequiresPermission(Permissions.TOPICS_EDIT)
  @ApiOperation({ summary: 'Update a topic with translations' })
  async update(@Param('slug') slug: string, @Body() dto: UpdateTopicDto) {
    const result = await this.service.updateWithTranslations(slug, dto);
    this.lastModifiedTopicSlug = slug;
    await this.invalidateTopicsCache();
    return result;
  }

  @Delete(':slug')
  @RequiresPermission(Permissions.TOPICS_DELETE)
  @ApiOperation({ summary: 'Delete a topic' })
  async remove(@Param('slug') slug: string) {
    const result = await this.service.remove(slug);
    this.lastModifiedTopicSlug = slug;
    await this.invalidateTopicsCache();
    return result;
  }
}
