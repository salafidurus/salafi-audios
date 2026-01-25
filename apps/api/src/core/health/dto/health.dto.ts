import { ApiProperty } from '@nestjs/swagger';

export enum HealthStatus {
  OK = 'ok',
}

export class HealthResponseDto {
  @ApiProperty({
    enum: HealthStatus,
    example: HealthStatus.OK,
    description: 'Overall service status',
    type: String,
  })
  status!: HealthStatus;

  @ApiProperty({
    example: '2026-01-21T20:18:36.123Z',
    description: 'Server timestamp in ISO 8601 format',
    type: String,
    format: 'date-time',
  })
  timestamp!: string;

  @ApiProperty({
    example: 'salafi-durus-api',
    description: 'Service name',
    required: false,
    type: String,
  })
  service?: string;

  @ApiProperty({
    example: 'development',
    description: 'Node environment',
    required: false,
    type: String,
  })
  environment?: string;
}
