import { ApiProperty } from '@nestjs/swagger';

export class HealthDbResponseDto {
  @ApiProperty({ type: String, example: 'ok' })
  status!: string;

  @ApiProperty({ type: String, example: 'postgresql' })
  provider!: string;

  @ApiProperty({ type: String, example: '2026-01-28T04:24:43.557Z' })
  timestamp!: string;
}
