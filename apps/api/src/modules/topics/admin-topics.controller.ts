import { Controller, Get, Post, Put, Delete, Param, Body } from '@nestjs/common';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { ApiCommonErrors } from '../../shared/decorators/api-common-errors.decorator';
import { CheckPolicy } from '../../core/auth/decorators/check-policy.decorator';
import { TopicsService } from './topics.service';
import { CreateTopicDto } from './dto/create-topic.dto';
import { UpdateTopicDto } from './dto/update-topic.dto';

// Topics are never scholar/locale-scoped — unconditioned checks only.
@ApiTags('Admin Topics')
@ApiCommonErrors()
@Controller('admin/topics')
export class AdminTopicsController {
  constructor(private readonly service: TopicsService) {}

  @Get()
  @ApiOperation({ summary: 'List all topics' })
  list() {
    return this.service.list();
  }

  @Get(':slug')
  @CheckPolicy('write', 'Topic')
  @ApiOperation({ summary: 'Get topic detail with translations' })
  getDetail(@Param('slug') slug: string) {
    return this.service.getAdminDetail(slug);
  }

  @Post()
  @CheckPolicy('write', 'Topic')
  @ApiOperation({ summary: 'Create a topic with translations' })
  create(@Body() dto: CreateTopicDto) {
    return this.service.createWithTranslations(dto);
  }

  @Put(':slug')
  @CheckPolicy('write', 'Topic')
  @ApiOperation({ summary: 'Update a topic with translations' })
  update(@Param('slug') slug: string, @Body() dto: UpdateTopicDto) {
    return this.service.updateWithTranslations(slug, dto);
  }

  @Delete(':slug')
  @CheckPolicy('delete', 'Topic')
  @ApiOperation({ summary: 'Delete a topic' })
  remove(@Param('slug') slug: string) {
    return this.service.remove(slug);
  }
}
