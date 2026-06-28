import { Body, Controller, Get, Param, Post, Put, Query, UseGuards } from '@nestjs/common';
import { ApiOkResponse, ApiOperation, ApiTags } from '@nestjs/swagger';
import type {
  AdminLectureActionDto,
  AdminLectureUpdateDto,
  AdminLectureListDto,
  AdminLectureDetailDto,
  BulkActionDto,
  BulkActionResultDto,
} from '@sd/core-contracts';
import { ApiCommonErrors } from '../../shared/decorators/api-common-errors.decorator';
import { RequiresPermission } from '../../shared/decorators/requires-permission.decorator';
import { AdminPermissionGuard } from '../../shared/guards/admin-permission.guard';
import { LecturesService } from './lectures.service';
import { CreateLectureDto } from './dto/create-lecture.dto';

@ApiTags('Admin Lectures')
@ApiCommonErrors()
@Controller('admin/lectures')
@UseGuards(AdminPermissionGuard)
export class AdminLecturesController {
  constructor(private readonly lectures: LecturesService) {}

  @Get()
  @RequiresPermission('manage:content')
  @ApiOperation({ summary: 'List all lectures (admin)' })
  listAdmin(
    @Query('page') page = '1',
    @Query('scholarId') scholarId?: string,
    @Query('status') status?: string,
    @Query('search') search?: string,
  ): Promise<AdminLectureListDto> {
    return this.lectures.listAdmin({
      page: Number(page),
      scholarId,
      status,
      search,
    });
  }

  @Get(':id')
  @RequiresPermission('manage:content')
  @ApiOperation({ summary: 'Get lecture detail (admin)' })
  getAdminDetail(@Param('id') id: string): Promise<AdminLectureDetailDto> {
    return this.lectures.getAdminDetail(id);
  }

  @Post()
  @RequiresPermission('manage:content')
  @ApiOperation({ summary: 'Create a lecture after R2 upload' })
  createLecture(@Body() dto: CreateLectureDto): Promise<{ id: string; title: string }> {
    const publicUrl = `${process.env['R2_PUBLIC_BASE_URL']}/${dto.audioKey}`;
    return this.lectures.createLecture({ ...dto, publicUrl });
  }

  @Post('bulk')
  @RequiresPermission('manage:content')
  @ApiOperation({ summary: 'Bulk publish or archive lectures' })
  bulkAction(@Body() dto: BulkActionDto): Promise<BulkActionResultDto> {
    return this.lectures.bulkAction(dto);
  }

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
