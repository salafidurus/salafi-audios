import { Controller, Get } from '@nestjs/common';
import { ApiOkResponse, ApiTags } from '@nestjs/swagger';

@ApiTags('Health')
@Controller('health')
export class HealthController {
  @Get()
  @ApiOkResponse({
    description: 'API health check',
    schema: {
      example: {
        status: 'ok',
      },
    },
  })
  getHealth() {
    return { status: 'ok' };
  }
}
