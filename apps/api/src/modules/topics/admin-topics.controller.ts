import { Controller, Post, Patch, Delete, Param, Body, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { Permissions } from '@sd/core-contracts';
import { ApiCommonErrors } from '../../shared/decorators/api-common-errors.decorator';
import { RequiresPermission } from '../../shared/decorators/requires-permission.decorator';
import { AdminPermissionGuard } from '../../shared/guards/admin-permission.guard';
import { TopicsService } from './topics.service';
import { UpsertTopicDto } from './dto/upsert-topic.dto';

@ApiTags('Admin Topics')
@ApiCommonErrors()
@Controller('admin/topics')
@UseGuards(AdminPermissionGuard)
export class AdminTopicsController {
  constructor(private readonly service: TopicsService) {}

  @Post()
  @RequiresPermission(Permissions.TOPICS_CREATE)
  @ApiOperation({ summary: 'Create a topic' })
  create(@Body() dto: UpsertTopicDto) {
    return this.service.upsert(dto);
  }

  @Patch(':slug')
  @RequiresPermission(Permissions.TOPICS_EDIT)
  @ApiOperation({ summary: 'Update a topic' })
  update(@Param('slug') slug: string, @Body() dto: UpsertTopicDto) {
    return this.service.upsert({ ...dto, slug });
  }

  @Delete(':slug')
  @RequiresPermission(Permissions.TOPICS_DELETE)
  @ApiOperation({ summary: 'Delete a topic' })
  remove(@Param('slug') slug: string) {
    return this.service.remove(slug);
  }
}
