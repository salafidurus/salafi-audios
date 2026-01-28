import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class ErrorResponseDto {
  @ApiProperty({ example: 400 })
  statusCode!: number;

  @ApiProperty({ example: 'Validation failed' })
  message!: string;

  @ApiPropertyOptional()
  details?: unknown;

  @ApiProperty({
    example: 'c0a8012e-3d3b-4e72-9e5f-2d7b0f9d3d4a',
  })
  requestId!: string;

  @ApiProperty({ example: '2026-01-28T12:34:56.789Z' })
  timestamp!: string;

  @ApiProperty({ example: '/health' })
  path!: string;
}
