import { ApiProperty } from '@nestjs/swagger';

export class HealthDbResponseDto {
  @ApiProperty({ example: 'ok' })
  status!: 'ok';

  @ApiProperty({ example: 'postgresql' })
  provider!: 'postgresql';

  @ApiProperty({ example: '2026-01-28T04:24:43.557Z' })
  timestamp!: string;
}
