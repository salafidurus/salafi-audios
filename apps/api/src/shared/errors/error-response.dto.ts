import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class ErrorResponseDto {
  @ApiProperty({ type: Number, example: 400 })
  statusCode!: number;

  @ApiProperty({ type: String, example: 'Validation failed' })
  message!: string;

  @ApiPropertyOptional({
    type: 'object',
    additionalProperties: true,
  })
  details?: Record<string, unknown>;

  @ApiProperty({
    type: String,
    example: 'c0a8012e-3d3b-4e72-9e5f-2d7b0f9d3d4a',
  })
  requestId!: string;

  @ApiProperty({ type: String, example: '2026-01-28T12:34:56.789Z' })
  timestamp!: string;

  @ApiProperty({ type: String, example: '/health' })
  path!: string;
}
