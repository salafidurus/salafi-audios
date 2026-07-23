import { Controller, Get, Post, Put, Delete, Param, Body } from '@nestjs/common';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { Permissions } from '@sd/core-contracts';
import { ApiCommonErrors } from '../../shared/decorators/api-common-errors.decorator';
import { RequiresPermission } from '../../shared/decorators/requires-permission.decorator';
import { TopicsService } from './topics.service';
import { CreateTopicDto } from './dto/create-topic.dto';
import { UpdateTopicDto } from './dto/update-topic.dto';

@ApiTags('Admin Topics')
@ApiCommonErrors()
@Controller('admin/topics')
export class AdminTopicsController {
  constructor(private readonly service: TopicsService) {}

  @Get(':slug')
  @RequiresPermission(Permissions.TOPICS_EDIT)
  @ApiOperation({ summary: 'Get topic detail with translations' })
  getDetail(@Param('slug') slug: string) {
    return this.service.getAdminDetail(slug);
  }

  @Post()
  @RequiresPermission(Permissions.TOPICS_CREATE)
  @ApiOperation({ summary: 'Create a topic with translations' })
  create(@Body() dto: CreateTopicDto) {
    return this.service.createWithTranslations(dto);
  }

  @Put(':slug')
  @RequiresPermission(Permissions.TOPICS_EDIT)
  @ApiOperation({ summary: 'Update a topic with translations' })
  update(@Param('slug') slug: string, @Body() dto: UpdateTopicDto) {
    return this.service.updateWithTranslations(slug, dto);
  }

  @Delete(':slug')
  @RequiresPermission(Permissions.TOPICS_DELETE)
  @ApiOperation({ summary: 'Delete a topic' })
  remove(@Param('slug') slug: string) {
    return this.service.remove(slug);
  }
}
