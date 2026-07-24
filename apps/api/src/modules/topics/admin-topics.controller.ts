import { Controller, Get, Post, Put, Delete, Param, Body, Inject } from '@nestjs/common';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import type { Cache } from 'cache-manager';
import { Permissions } from '@sd/core-contracts';
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
    await this.cacheManager.del('GET /topics');
  }

  @Post()
  @RequiresPermission(Permissions.TOPICS_CREATE)
  @ApiOperation({ summary: 'Create a topic with translations' })
  async create(@Body() dto: CreateTopicDto) {
    const result = await this.service.createWithTranslations(dto);
    await this.invalidateTopicsCache();
    return result;
  }

  @Put(':slug')
  @RequiresPermission(Permissions.TOPICS_EDIT)
  @ApiOperation({ summary: 'Update a topic with translations' })
  async update(@Param('slug') slug: string, @Body() dto: UpdateTopicDto) {
    const result = await this.service.updateWithTranslations(slug, dto);
    await this.invalidateTopicsCache();
    return result;
  }

  @Delete(':slug')
  @RequiresPermission(Permissions.TOPICS_DELETE)
  @ApiOperation({ summary: 'Delete a topic' })
  async remove(@Param('slug') slug: string) {
    const result = await this.service.remove(slug);
    await this.invalidateTopicsCache();
    return result;
  }
}
