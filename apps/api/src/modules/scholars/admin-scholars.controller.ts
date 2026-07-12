import { Controller, Post, Patch, Param, Body } from '@nestjs/common';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { Permissions } from '@sd/core-contracts';
import { ApiCommonErrors } from '../../shared/decorators/api-common-errors.decorator';
import { RequiresPermission } from '../../shared/decorators/requires-permission.decorator';
import { ScholarsService } from './scholars.service';
import { CreateScholarDto } from './dto/create-scholar.dto';
import { UpdateScholarDto } from './dto/update-scholar.dto';

@ApiTags('Admin Scholars')
@ApiCommonErrors()
@Controller('admin/scholars')
export class AdminScholarsController {
  constructor(private readonly service: ScholarsService) {}

  @Post()
  @RequiresPermission(Permissions.SCHOLARS_CREATE)
  @ApiOperation({ summary: 'Create a scholar' })
  create(@Body() dto: CreateScholarDto) {
    return this.service.create(dto);
  }

  @Patch(':id')
  @RequiresPermission(Permissions.SCHOLARS_EDIT)
  @ApiOperation({ summary: 'Update a scholar' })
  update(@Param('id') id: string, @Body() dto: UpdateScholarDto) {
    return this.service.update(id, dto);
  }
}
