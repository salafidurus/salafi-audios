import {
  Controller,
  Post,
  Patch,
  Param,
  Body,
  UseGuards,
} from '@nestjs/common';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { ApiCommonErrors } from '../../shared/decorators/api-common-errors.decorator';
import { RequiresPermission } from '../../shared/decorators/requires-permission.decorator';
import { AdminPermissionGuard } from '../../shared/guards/admin-permission.guard';
import { ScholarsService } from './scholars.service';
import { CreateScholarDto } from './dto/create-scholar.dto';
import { UpdateScholarDto } from './dto/update-scholar.dto';

@ApiTags('Admin Scholars')
@ApiCommonErrors()
@Controller('admin/scholars')
@UseGuards(AdminPermissionGuard)
export class AdminScholarsController {
  constructor(private readonly service: ScholarsService) {}

  @Post()
  @RequiresPermission('manage:scholars')
  @ApiOperation({ summary: 'Create a scholar' })
  create(@Body() dto: CreateScholarDto) {
    return this.service.create(dto);
  }

  @Patch(':id')
  @RequiresPermission('manage:scholars')
  @ApiOperation({ summary: 'Update a scholar' })
  update(@Param('id') id: string, @Body() dto: UpdateScholarDto) {
    return this.service.update(id, dto);
  }
}
