import { Body, Controller, Param, Patch } from '@nestjs/common';
import { ApiOkResponse, ApiOperation, ApiTags } from '@nestjs/swagger';
import { Roles } from '../../modules/auth/decorators';
import { ApiCommonErrors } from '../../shared/decorators/api-common-errors.decorator';
import { ScholarService } from './scholars.service';
import type { ScholarDetailDto } from '@sd/contracts';
import { SetKibarDto } from './dto/set-kibar.dto';

@ApiTags('Admin Scholars')
@ApiCommonErrors()
@Roles('admin')
@Controller('admin/scholars')
export class AdminScholarsController {
  constructor(private readonly scholars: ScholarService) {}

  @Patch(':id/kibar')
  @ApiOperation({ summary: 'Set Kibar ul-Ulama flag for a scholar' })
  @ApiOkResponse({ description: 'The updated scholar details' })
  setKibar(
    @Param('id') id: string,
    @Body() body: SetKibarDto,
  ): Promise<ScholarDetailDto> {
    return this.scholars.setKibarById(id, body.isKibar);
  }
}
