import { Body, Controller, Param, Post, Put, UseGuards } from '@nestjs/common';
import { ApiOkResponse, ApiOperation, ApiTags } from '@nestjs/swagger';
import type {
  AdminLectureActionDto,
  AdminLectureUpdateDto,
} from '@sd/core-contracts';
import { ApiCommonErrors } from '../../shared/decorators/api-common-errors.decorator';
import { RequiresPermission } from '../../shared/decorators/requires-permission.decorator';
import { AdminPermissionGuard } from '../../shared/guards/admin-permission.guard';
import { LecturesService } from './lectures.service';

@ApiTags('Admin Lectures')
@ApiCommonErrors()
@Controller('admin/lectures')
@UseGuards(AdminPermissionGuard)
export class AdminLecturesController {
  constructor(private readonly lectures: LecturesService) {}

  @Put(':id')
  @RequiresPermission('manage:content')
  @ApiOperation({ summary: 'Update lecture metadata' })
  @ApiOkResponse({ description: 'Lecture updated successfully' })
  updateLecture(
    @Param('id') id: string,
    @Body() updateDto: AdminLectureUpdateDto,
  ): Promise<AdminLectureActionDto> {
    return this.lectures.updateLecture(id, updateDto);
  }

  @Post(':id/publish')
  @RequiresPermission('manage:content')
  @ApiOperation({ summary: 'Publish a lecture' })
  @ApiOkResponse({ description: 'Lecture published successfully' })
  publishLecture(@Param('id') id: string): Promise<AdminLectureActionDto> {
    return this.lectures.publishLecture(id);
  }

  @Post(':id/archive')
  @RequiresPermission('manage:content')
  @ApiOperation({ summary: 'Archive a lecture' })
  @ApiOkResponse({ description: 'Lecture archived successfully' })
  archiveLecture(@Param('id') id: string): Promise<AdminLectureActionDto> {
    return this.lectures.archiveLecture(id);
  }
}
