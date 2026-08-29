import { Controller, Get, Post, Put, Delete, Param, Body } from '@nestjs/common';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { ApiCommonErrors } from '../../shared/decorators/api-common-errors.decorator';
import { CheckPolicy } from '../../core/auth/decorators/check-policy.decorator';
import { TopicsService } from './topics.service';
import { CreateTopicWithTranslationsDtoSchema, type CreateTopicDto } from './dto/create-topic.dto';
import { UpdateTopicWithTranslationsDtoSchema, type UpdateTopicDto } from './dto/update-topic.dto';

// Topics are never scholar/locale-scoped — unconditioned checks only.
/** NestJS admin topics controller service or controller coordinating the API boundary for this responsibility. */
@ApiTags('Admin Topics')
@ApiCommonErrors()
@Controller('admin/topics')
/** topics application module responsible for admin topics.controller behavior at the backend boundary. */
// oxlint-disable-next-line anti-slop/require-tsdoc -- NestJS decorators separate the declaration from its TSDoc.
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
  create(@Body({ schema: CreateTopicWithTranslationsDtoSchema }) dto: CreateTopicDto) {
    return this.service.createWithTranslations(dto);
  }

  @Put(':slug')
  @CheckPolicy('write', 'Topic')
  @ApiOperation({ summary: 'Update a topic with translations' })
  update(
    @Param('slug') slug: string,
    @Body({ schema: UpdateTopicWithTranslationsDtoSchema }) dto: UpdateTopicDto,
  ) {
    return this.service.updateWithTranslations(slug, dto);
  }

  @Delete(':slug')
  @CheckPolicy('delete', 'Topic')
  @ApiOperation({ summary: 'Delete a topic' })
  remove(@Param('slug') slug: string) {
    return this.service.remove(slug);
  }
}
